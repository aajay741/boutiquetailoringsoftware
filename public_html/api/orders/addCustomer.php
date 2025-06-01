<?php
// Enable error logging with timestamps and request info
file_put_contents('php_error.log', "======== NEW ORDER REQUEST ========\n", FILE_APPEND);
file_put_contents('php_error.log', "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents('php_error.log', "Request time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents('php_error.log', "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    exit();
}

// Response template
$response = [
    'success' => false,
    'message' => '',
    'order_id' => null,
    'errors' => []
];

// Upload configuration
$uploadConfig = [
    'upload_dir' => __DIR__ . '/uploads/orders/',
    'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
    'max_size' => 5 * 1024 * 1024, // 5 MB
];

// Ensure upload directory exists
if (!is_dir($uploadConfig['upload_dir'])) {
    if (!mkdir($uploadConfig['upload_dir'], 0777, true)) {
        $response['message'] = "Failed to create upload directory";
        http_response_code(500);
        echo json_encode($response);
        exit();
    }
}

try {

    require_once '../dbconnect.php';  // Your DB connection file
    file_put_contents('php_error.log', "DB connected\n", FILE_APPEND);

    // Get raw input
    $jsonInput = file_get_contents("php://input");

    // Parse input data
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        // Multipart form-data (file uploads)
        $data = $_POST;

        // Decode JSON-encoded subfields if they exist
        $jsonFields = ['particulars', 'measurements', 'customer', 'order', 'dates', 'totals'];
        foreach ($jsonFields as $field) {
            if (isset($data[$field])) {
                if (is_string($data[$field])) {
                    $data[$field] = json_decode($data[$field], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new Exception("Invalid JSON in field '$field': " . json_last_error_msg());
                    }
                }
            }
        }
    } else {
        // Application/json raw input
        $data = json_decode($jsonInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON input: " . json_last_error_msg());
        }
    }

    // Transform data structure to match expected format
    if (isset($data['order'])) {
        $orderData = $data['order'];
        $data['orderTakenBy'] = ['masterId' => $orderData['taken_by'] ?? null];
        $data['assignedTo'] = ['masterId' => $orderData['assigned_to'] ?? null];
        $data['dates'] = [
            'takenDate' => $orderData['taken_date'] ?? null,
            'deliveryDate' => $orderData['delivery_date'] ?? null
        ];
        
        if (isset($data['customer']['name'])) {
            $data['customer']['fullName'] = $data['customer']['name'];
        }
        
        if (isset($data['customer']['store_id'])) {
            $data['customer']['storeId'] = $data['customer']['store_id'];
        }
    }

    // Validate required fields
    $requiredFields = [
        'customer' => ['fullName', 'phone', 'storeId'],
        'orderTakenBy' => ['masterId'],
        'assignedTo' => ['masterId'],
        'dates' => ['takenDate'],
    ];

    $validationErrors = [];
    foreach ($requiredFields as $section => $fields) {
        if (empty($data[$section]) || !is_array($data[$section])) {
            $validationErrors[] = "Missing section: $section";
            continue;
        }
        foreach ($fields as $field) {
            if (empty($data[$section][$field])) {
                $validationErrors[] = "Missing required field: $section.$field";
            }
        }
    }

    if (!empty($validationErrors)) {
        $response['errors'] = $validationErrors;
        throw new Exception("Validation errors detected");
    }

    // Connect to DB and begin transaction
    $conn = getDBConnection();
    $conn->begin_transaction();
    file_put_contents('php_error.log', "Transaction started\n", FILE_APPEND);

    // 1. Find or Insert Customer
$customer = $data['customer'];
$customerId = null;

// Extract all customer data to variables before binding
$fullName = $customer['fullName'];
$phone = $customer['phone'];
$whatsapp = !empty($customer['whatsappSame']) ? $customer['phone'] : ($customer['whatsapp'] ?? null);
$address = $customer['address'] ?? '';
$storeId = $customer['storeId'];

$stmt = $conn->prepare("INSERT INTO customers (full_name, phone, whatsapp, address, store_id) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

$stmt->bind_param("ssssi", $fullName, $phone, $whatsapp, $address, $storeId);

if (!$stmt->execute()) {
    throw new Exception("Insert customer failed: " . $stmt->error);
}
$customerId = $conn->insert_id;
file_put_contents('php_error.log', "Inserted new customer: $customerId\n", FILE_APPEND);




    // 2. Calculate total, advance, balance
    $total = 0.0;
    foreach ($data['particulars'] ?? [] as $particular) {
        $price = floatval($particular['price'] ?? 0);
        $total += $price;
    }
    $advance = floatval($data['advance'] ?? $data['order']['advance'] ?? 0);
    $balance = $total - $advance;

    // 3. Insert order - Extract all values to variables first
    $masterIdTakenBy = $data['orderTakenBy']['masterId'];
    $masterIdAssignedTo = $data['assignedTo']['masterId'];
    $storeId = $customer['storeId'];
    $takenDate = $data['dates']['takenDate'];
    $deliveryDate = $data['dates']['deliveryDate'] ?? null;
    $specialNote = $data['specialNote'] ?? ($data['order']['special_note'] ?? '');
    $status = 'pending';

    $stmt = $conn->prepare("INSERT INTO orders (
        customer_id, order_taken_by, assigned_to, store_id,
        taken_date, delivery_date, special_note,
        advance, total_amount, balance_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

    $stmt->bind_param(
        "iiiisssddds",
        $customerId,
        $masterIdTakenBy,
        $masterIdAssignedTo,
        $storeId,
        $takenDate,
        $deliveryDate,
        $specialNote,
        $advance,
        $total,
        $balance,
        $status
    );

    if (!$stmt->execute()) {
        throw new Exception("Insert order failed: " . $stmt->error);
    }

    $orderId = $conn->insert_id;
    file_put_contents('php_error.log', "Inserted order ID: $orderId\n", FILE_APPEND);
    $response['order_id'] = $orderId;

  

    // Create directories for order uploads
    $orderUploadDir = rtrim($uploadConfig['upload_dir'], '/') . "/$orderId/particulars/";
    if (!is_dir($orderUploadDir)) {
        if (!mkdir($orderUploadDir, 0777, true)) {
            throw new Exception("Failed to create order upload directory");
        }
    }

    // 4. Insert particulars and handle files
    if (!empty($data['particulars'])) {
        foreach ($data['particulars'] as $index => $particular) {
            // Extract particular data to variables
            $desc = $particular['description'] ?? '';
            $price = floatval($particular['price'] ?? 0);
            $particularStatus = $particular['status'] ?? 'pending';

            $stmt = $conn->prepare("INSERT INTO order_particulars (order_id, description, price, status) VALUES (?, ?, ?, ?)");
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

            $stmt->bind_param("isds", $orderId, $desc, $price, $particularStatus);
            if (!$stmt->execute()) {
                throw new Exception("Insert particular failed: " . $stmt->error);
            }

            $particularId = $conn->insert_id;
            file_put_contents('php_error.log', "Inserted particular ID: $particularId\n", FILE_APPEND);

            // Particular upload directory
            $particularUploadDir = $orderUploadDir . $particularId . '/';
            if (!is_dir($particularUploadDir)) {
                if (!mkdir($particularUploadDir, 0777, true)) {
                    throw new Exception("Failed to create particular upload directory");
                }
            }

            // Handle uploaded files - simplified version without image processing
            if (!empty($_FILES['particulars']['name'][$index]['images'])) {
                foreach ($_FILES['particulars']['name'][$index]['images'] as $i => $filename) {
                    if ($_FILES['particulars']['error'][$index]['images'][$i] !== UPLOAD_ERR_OK) {
                        file_put_contents('php_error.log', "Upload error for file $filename: " . $_FILES['particulars']['error'][$index]['images'][$i] . "\n", FILE_APPEND);
                        continue;
                    }

                    // Validate file type and size
                    $fileExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                    if (!in_array($fileExt, $uploadConfig['allowed_types'])) {
                        file_put_contents('php_error.log', "Invalid file type: $fileExt for $filename\n", FILE_APPEND);
                        continue;
                    }
                    
                    if ($_FILES['particulars']['size'][$index]['images'][$i] > $uploadConfig['max_size']) {
                        file_put_contents('php_error.log', "File too large: $filename\n", FILE_APPEND);
                        continue;
                    }

                    // Generate unique filename and save
                    $newFilename = uniqid() . '.' . $fileExt;
                    $filepath = $particularUploadDir . $newFilename;
                    $tmpName = $_FILES['particulars']['tmp_name'][$index]['images'][$i];

                    if (move_uploaded_file($tmpName, $filepath)) {
                        $relativePath = str_replace($uploadConfig['upload_dir'], '', $filepath);

                        $stmt = $conn->prepare("INSERT INTO order_images (particular_id, image_url) VALUES (?, ?)");
                        if (!$stmt) {
                            file_put_contents('php_error.log', "Prepare failed (image insert): " . $conn->error . "\n", FILE_APPEND);
                            continue;
                        }
                        $stmt->bind_param("is", $particularId, $relativePath);
                        if (!$stmt->execute()) {
                            file_put_contents('php_error.log', "Insert image failed: " . $stmt->error . "\n", FILE_APPEND);
                        } else {
                            file_put_contents('php_error.log', "Successfully saved image: $relativePath\n", FILE_APPEND);
                        }
                    } else {
                        file_put_contents('php_error.log', "Failed to move uploaded file: $filename\n", FILE_APPEND);
                    }
                }
            }
        }
    }

    // 5. Insert measurements and related data (unchanged from original)
    if (!empty($data['measurements'])) {
        $m = $data['measurements'];
        
        // Extract all measurement values to variables
        $mL = $m['L'] ?? null;
        $mSH = $m['SH'] ?? null;
        $mARM = $m['ARM'] ?? null;
        $mUB = $m['UB'] ?? null;
        $mMB = $m['MB'] ?? null;
        $mW = $m['W'] ?? null;
        $mPOINT = $m['POINT'] ?? null;
        $mFN = $m['FN'] ?? null;
        $mBN = $m['BN'] ?? null;
        $mHIP = $m['HIP'] ?? null;
        $mSEAT = $m['SEAT'] ?? null;
        $mTHIGH = $m['THIGH'] ?? null;

        $stmt = $conn->prepare("INSERT INTO measurements (
            order_id, L, SH, ARM, UB, MB, W, POINT, FN, BN, HIP, SEAT, THIGH
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

        $stmt->bind_param(
            "issssssssssss",
            $orderId,
            $mL,
            $mSH,
            $mARM,
            $mUB,
            $mMB,
            $mW,
            $mPOINT,
            $mFN,
            $mBN,
            $mHIP,
            $mSEAT,
            $mTHIGH
        );

        if (!$stmt->execute()) {
            throw new Exception("Insert measurements failed: " . $stmt->error);
        }

        $measurementId = $conn->insert_id;
        file_put_contents('php_error.log', "Inserted measurement ID: $measurementId\n", FILE_APPEND);

        // Insert SL measurements if they exist
        if (!empty($m['SL']) && is_array($m['SL'])) {
            $stmt = $conn->prepare("INSERT INTO sl_measurements (measurement_id, L, W, A, position) VALUES (?, ?, ?, ?, ?)");
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            
            foreach ($m['SL'] as $position => $sl) {
                $slL = $sl['L'] ?? null;
                $slW = $sl['W'] ?? null;
                $slA = $sl['A'] ?? null;
                
                $stmt->bind_param("isssi", $measurementId, $slL, $slW, $slA, $position);
                if (!$stmt->execute()) {
                    throw new Exception("Insert SL measurement failed: " . $stmt->error);
                }
            }
        }

        // Insert custom measurements if they exist
        if (!empty($m['others']) && is_array($m['others'])) {
            $stmt = $conn->prepare("INSERT INTO custom_measurements (measurement_id, name, value) VALUES (?, ?, ?)");
            if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
            
            foreach ($m['others'] as $custom) {
                $name = $custom['name'] ?? '';
                $value = $custom['value'] ?? '';
                
                $stmt->bind_param("iss", $measurementId, $name, $value);
                if (!$stmt->execute()) {
                    throw new Exception("Insert custom measurement failed: " . $stmt->error);
                }
            }
        }
    }

    // New code block for invoice number generation
    $stmt = $conn->prepare("SELECT store_code FROM stores WHERE store_id = ?");
    $stmt->bind_param("i", $storeId);
    $stmt->execute();
    $stmt->bind_result($storeCode);
    $stmt->fetch();
    $stmt->close();

    $invoiceNumber = $storeCode . '_' . str_pad($orderId, 4, '0', STR_PAD_LEFT);

    $stmt = $conn->prepare("UPDATE orders SET invoice = ? WHERE order_id = ?");
    $stmt->bind_param("si", $invoiceNumber, $orderId);
    if (!$stmt->execute()) {
        throw new Exception("Failed to update invoice: " . $stmt->error);
    }
    $stmt->close();

    $conn->commit();

    $response['invoiceNumber'] = $invoiceNumber;
    $response['success'] = true;
    $response['message'] = "Order created successfully";
    http_response_code(201);

} catch (Exception $e) {
    if (isset($conn) && $conn->in_transaction) {
        $conn->rollback();
    }
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
exit();