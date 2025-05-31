<?php
require_once '../dbconnect.php';

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Enable detailed error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set higher execution limits
set_time_limit(30);
ini_set('memory_limit', '128M');

// Initialize response array with comprehensive debug fields
$response = [
    'success' => false,
    'message' => '',
    'purchase_id' => null,
    'invoice_number' => null,
    'measurement_ids' => [],
    'debug' => [
        'timing' => ['start' => microtime(true)],
        'memory' => ['start' => memory_get_usage(true)],
        'input_received' => false,
        'input_length' => 0,
        'json_decode_success' => false,
        'db_connection' => false,
        'transaction_started' => false,
        'customer_insert' => null,
        'measurement_inserts' => [],
        'purchase_insert' => null,
        'assignment_inserts' => [],
        'execution_steps' => []
    ]
];


// Register shutdown function to catch fatal errors
register_shutdown_function(function() use (&$response) {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $response['message'] = "Fatal error: " . $error['message'];
        $response['debug']['fatal_error'] = $error;
        http_response_code(500);
        echo json_encode($response);
    }
});

try {
    $response['debug']['timing']['request_start'] = microtime(true);
    
    // Handle OPTIONS request for CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Verify request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST requests are allowed", 405);
    }

    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $response['debug']['input_length'] = strlen($rawData);
    $response['debug']['input_sample'] = substr($rawData, 0, 200);


    if (empty($rawData)) {
        if (!empty($_POST)) {
            $rawData = json_encode($_POST);
        } else {
            throw new Exception("No data received in request body", 400);
        }
    }

    $response['debug']['input_received'] = true;

    // Decode the JSON data
    $data = json_decode($rawData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {

        throw new Exception("JSON decode error: " . json_last_error_msg(), 400);
    }
    
    $response['debug']['json_decode_success'] = true;


    // Validate required fields
    if (empty($data['customer']) || !is_array($data['customer'])) {
        throw new Exception("Customer data is required", 400);
    }

    if (empty($data['measurements']) || !is_array($data['measurements'])) {
        throw new Exception("At least one measurement is required", 400);
    }

    if (empty($data['payment']) || !is_array($data['payment'])) {
        throw new Exception("Payment data is required", 400);
    }

    // Get DB connection
    $connStart = microtime(true);
    $conn = getDBConnection();
    if ($conn->connect_error) {

        throw new Exception("Database connection failed: " . $conn->connect_error, 500);
    }
    $response['debug']['db_connection'] = true;
    $response['debug']['timing']['db_connect'] = microtime(true) - $connStart;


    // Start transaction
    $txStart = microtime(true);
    if (!$conn->begin_transaction()) {
        throw new Exception("Failed to start transaction", 500);
    }
    $response['debug']['transaction_started'] = true;
    $response['debug']['timing']['transaction_start'] = microtime(true) - $txStart;

    // 1. Insert customer data
    $customer = $data['customer'];
    $requiredCustomerFields = ['name', 'phone', 'store_id'];
    foreach ($requiredCustomerFields as $field) {
        if (empty($customer[$field])) {
            throw new Exception("Missing required customer field: $field", 400);
        }
    }

    $stmt = $conn->prepare("INSERT INTO customers (name, email, phone, whatsapp, dob, address, store_id) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {

        throw new Exception("Prepare failed: " . $conn->error, 500);
    }

    $customerParams = [
        $customer['name'],
        $customer['email'] ?? '',
        $customer['phone'],
        $customer['whatsapp'] ?? '',
        $customer['dob'] ?? '',
        $customer['address'] ?? '',
        $customer['store_id']
    ];
    
    $stmt->bind_param("ssssssi", ...$customerParams);

    $execStart = microtime(true);
    if (!$stmt->execute()) {

        throw new Exception("Customer insert failed: " . $stmt->error, 500);
    }
    $response['debug']['timing']['customer_insert'] = microtime(true) - $execStart;

    $customer_id = $conn->insert_id;
    $stmt->close();
    $response['debug']['customer_id'] = $customer_id;
    $response['debug']['customer_insert'] = [
        'id' => $customer_id,
        'params' => $customerParams,
        'execution_time' => $response['debug']['timing']['customer_insert']
    ];


    // 2. Process measurements with detailed logging and enhanced error handling
    $measurement_ids = [];
    foreach ($data['measurements'] as $index => $measurement) {
        $measurementStart = microtime(true);
       
        
        if (empty($measurement['name'])) {
            throw new Exception("Measurement #" . ($index + 1) . " name is required", 400);
        }

        $stmt = $conn->prepare("INSERT INTO measurements (
            customer_id, name, details, length, shoulder, arm,
            left_sleeve_length, left_sleeve_width, left_sleeve_arms,
            right_sleeve_length, right_sleeve_width, right_sleeve_arms,
            upper_body, middle_body, waist, dot_point, top_length,
            pant_length, hip, seat, thigh, maxi_length, maxi_height,
            skirt_length, skirt_height, others
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        if (!$stmt) {
            $prepareError = $conn->error;
           
            throw new Exception("Measurement prepare failed: " . $prepareError, 500);
        }

        // Prepare parameters with proper type casting and null handling
        $measurementParams = [
            (int)$customer_id,
            (string)$measurement['name'],
            (string)($measurement['details'] ?? ''),
            (float)($measurement['length'] ?? 0),
            (float)($measurement['shoulder'] ?? 0),
            (float)($measurement['arm'] ?? 0),
            (float)($measurement['left_sleeve_length'] ?? 0),
            (float)($measurement['left_sleeve_width'] ?? 0),
            (float)($measurement['left_sleeve_arms'] ?? 0),
            (float)($measurement['right_sleeve_length'] ?? 0),
            (float)($measurement['right_sleeve_width'] ?? 0),
            (float)($measurement['right_sleeve_arms'] ?? 0),
            (float)($measurement['upper_body'] ?? 0),
            (float)($measurement['middle_body'] ?? 0),
            (float)($measurement['waist'] ?? 0),
            (float)($measurement['dot_point'] ?? 0),
            (float)($measurement['top_length'] ?? 0),
            (float)($measurement['pant_length'] ?? 0),
            (float)($measurement['hip'] ?? 0),
            (float)($measurement['seat'] ?? 0),
            (float)($measurement['thigh'] ?? 0),
            (float)($measurement['maxi_length'] ?? 0),
            (float)($measurement['maxi_height'] ?? 0),
            (float)($measurement['skirt_length'] ?? 0),
            (float)($measurement['skirt_height'] ?? 0),
            (string)($measurement['others'] ?? '')
        ];

        // Verify parameter count matches
        $expectedParamCount = 26;
        $actualParamCount = count($measurementParams);
        $typeString = "issdddddddddddddddddddddds";    // 26 parameters: 1 int, 1 string, 24 floats, 1 string 
        
        if ($actualParamCount !== $expectedParamCount || strlen($typeString) !== $expectedParamCount) {
           
            throw new Exception("Measurement parameter count mismatch. Expected $expectedParamCount, got $actualParamCount", 500);
        }


        $bindResult = $stmt->bind_param($typeString, ...$measurementParams);
        if (!$bindResult) {
            $bindError = $stmt->error;
    
            throw new Exception("Failed to bind measurement parameters: " . $bindError, 500);
        }

        $execStart = microtime(true);
        $executeResult = $stmt->execute();
        $execTime = microtime(true) - $execStart;
        
        if (!$executeResult) {
            $executeError = $stmt->error;
           
            throw new Exception("Measurement insert failed: " . $executeError, 500);
        }

        $measurement_id = $conn->insert_id;
        $measurement_ids[] = $measurement_id;
        $stmt->close();
        
        $response['debug']['measurement_inserts'][] = [
            'id' => $measurement_id,
            'index' => $index,
            'execution_time' => $execTime,
            'affected_rows' => $conn->affected_rows
        ];
        
   

        // Process photos if any
        if (!empty($measurement['photos']) && is_array($measurement['photos'])) {

            
            $photo_dir = '../uploads/measurements/' . $measurement_id . '/';
            if (!file_exists($photo_dir)) {
                if (!mkdir($photo_dir, 0777, true)) {
                    continue;
                }
            }

            foreach ($measurement['photos'] as $photoIndex => $base64Photo) {
                if (!preg_match('/^data:image\/(\w+);base64,/', $base64Photo)) {
                    continue;
                }

                $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $base64Photo));
                if (!$imageData) {
                    continue;
                }

                $filename = 'measurement_' . $measurement_id . '_' . $photoIndex . '_' . time() . '.jpg';
                $filepath = $photo_dir . $filename;

                $writeStart = microtime(true);
                if (file_put_contents($filepath, $imageData)) {
                    $relative_path = 'uploads/measurements/' . $measurement_id . '/' . $filename;
                    $stmt = $conn->prepare("INSERT INTO measurements_photo (measurement_id, photo_path) VALUES (?, ?)");
                    if ($stmt) {
                        $stmt->bind_param("is", $measurement_id, $relative_path);
                        $stmt->execute();
                        $stmt->close();

                    }
                } 
            }
        }
        
        $response['debug']['timing']['measurement_' . $index] = microtime(true) - $measurementStart;
    }

    // 3. Insert purchase record with detailed logging
    $payment = $data['payment'];
    if (empty($payment['total_amount'])) {
        throw new Exception("Total amount is required", 400);
    }

    // Get store code for invoice number
    $store_code = '';
    $stmt = $conn->prepare("SELECT store_code FROM stores WHERE store_id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $customer['store_id']);
        $stmt->execute();
        $stmt->bind_result($store_code);
        $stmt->fetch();
        $stmt->close();
        
        if (empty($store_code)) {
            throw new Exception("Invalid store ID or store code not found", 400);
        }
    } else {
        throw new Exception("Failed to prepare store code query", 500);
    }

    // Generate invoice number: store_code + DDMMYY + customer_id
    $invoice_number = $store_code . date('dmy') . $customer_id;

    $balance = $payment['total_amount'] - ($payment['advance'] ?? 0);
    $stmt = $conn->prepare("INSERT INTO purchase (
        customer_id, total_amount, advance_amount, balance_amount, 
        payment_method, status, invoice_number
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?)");

    if (!$stmt) {

        throw new Exception("Purchase prepare failed: " . $conn->error, 500);
    }

    $purchaseParams = [
        $customer_id,
        (float)$payment['total_amount'],
        (float)($payment['advance'] ?? 0),
        (float)$balance,
        (string)($payment['payment_method'] ?? 'cash'),
        $invoice_number
    ];
    
    $stmt->bind_param("idddss", ...$purchaseParams);

    $execStart = microtime(true);
    if (!$stmt->execute()) {
     
        throw new Exception("Purchase insert failed: " . $stmt->error, 500);
    }
    $execTime = microtime(true) - $execStart;

    $purchase_id = $conn->insert_id;
    $stmt->close();
    $response['debug']['purchase_id'] = $purchase_id;
    $response['debug']['purchase_insert'] = [
        'id' => $purchase_id,
        'params' => $purchaseParams,
        'execution_time' => $execTime
    ];
    $response['invoice_number'] = $invoice_number;

    // 4. Link measurements to purchase with logging
    foreach ($measurement_ids as $measurement_id) {
       
        
        $stmt = $conn->prepare("INSERT INTO purchase_measurements (purchase_id, measurement_id) VALUES (?, ?)");
        if (!$stmt) {
         
            throw new Exception("Purchase measurements prepare failed: " . $conn->error, 500);
        }
        
        $stmt->bind_param("ii", $purchase_id, $measurement_id);
        $execResult = $stmt->execute();
        
        if (!$execResult) {
       
            throw new Exception("Failed to link measurement to purchase", 500);
        }
        
        $stmt->close();
    }

    // 5. Process assignments with detailed logging
    if (!empty($data['assignments']) && is_array($data['assignments'])) {
        
        foreach ($data['assignments'] as $index => $assignment) {
            if (empty($assignment['master_id'])) {
                throw new Exception("Assignment #" . ($index + 1) . " master_id is required", 400);
            }

            $stmt = $conn->prepare("INSERT INTO assignments (purchase_id, master_id, in_date, out_date) 
                                  VALUES (?, ?, ?, ?)");
            if (!$stmt) {

                throw new Exception("Assignment prepare failed: " . $conn->error, 500);
            }

            $assignmentParams = [
                $purchase_id,
                (int)$assignment['master_id'],
                (string)($assignment['in_date'] ?? date('Y-m-d')),
                !empty($assignment['out_date']) ? (string)$assignment['out_date'] : null
            ];
            
            $stmt->bind_param("iiss", ...$assignmentParams);

            $execStart = microtime(true);
            $stmt->execute();
            $execTime = microtime(true) - $execStart;
            $stmt->close();
            
            $response['debug']['assignment_inserts'][] = [
                'index' => $index,
                'params' => $assignmentParams,
                'execution_time' => $execTime
            ];
          
        }
    }

    // Commit transaction
    $commitStart = microtime(true);
    $conn->commit();
    $response['debug']['timing']['commit'] = microtime(true) - $commitStart;
    
    $response['success'] = true;
    $response['message'] = 'Purchase created successfully';
    $response['purchase_id'] = $purchase_id;
    $response['invoice_number'] = $invoice_number;
    $response['measurement_ids'] = $measurement_ids;

   
    // Final memory and timing stats
    $response['debug']['memory']['end'] = memory_get_usage(true);
    $response['debug']['memory']['peak'] = memory_get_peak_usage(true);
    $response['debug']['timing']['end'] = microtime(true);
    $response['debug']['timing']['total'] = $response['debug']['timing']['end'] - $response['debug']['timing']['start'];
    
    echo json_encode($response);

} catch (Exception $e) {
    // Rollback transaction if needed
    if (isset($conn) && $conn instanceof mysqli && $conn->ping() && ($response['debug']['transaction_started'] ?? false)) {
        $rollbackResult = $conn->rollback();
       
    }
    $errorMessage = "Error: " . $e->getMessage() . " (Code: " . $e->getCode() . ")";
    $response['message'] = $e->getMessage();
    $response['debug']['error'] = $errorMessage;
    $response['debug']['timing']['end'] = microtime(true);
    $response['debug']['timing']['total'] = $response['debug']['timing']['end'] - $response['debug']['timing']['start'];
    http_response_code($e->getCode() ?: 500);
    echo json_encode($response);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    
}