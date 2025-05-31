<?php
// Enable detailed logging
file_put_contents('php_error.log', "======== NEW REQUEST ========\n", FILE_APPEND);
file_put_contents('php_error.log', "Request method: ".$_SERVER['REQUEST_METHOD']."\n", FILE_APPEND);
file_put_contents('php_error.log', "Request time: ".date('Y-m-d H:i:s')."\n", FILE_APPEND);

// Strict error reporting and output buffering
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ob_start();

// Headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");



// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents('php_error.log', "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    ob_end_clean();
    exit();
}

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => [],
    'store_id' => null
];

try {
    file_put_contents('php_error.log', "Initiating main try block\n", FILE_APPEND);
    
    // Include database connection
    require_once '../dbconnect.php';
    file_put_contents('php_error.log', "DB connect file included\n", FILE_APPEND);
    
    // Get input data
    $json = file_get_contents("php://input");
    file_put_contents('php_error.log', "Raw input: ".substr($json, 0, 200)."\n", FILE_APPEND);
    
    if ($json === false) {
        throw new Exception("Failed to read input data");
    }
    
    $data = json_decode($json);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }
    
    file_put_contents('php_error.log', "JSON decoded successfully\nData: ".print_r($data, true)."\n", FILE_APPEND);

    // Validate required fields
    $required = [
        'store_name' => 'Store Name',
        'store_code' => 'Store Code',
        'address_line1' => 'Address Line 1',
        'city' => 'City',
        'state' => 'State',
        'country' => 'Country',
        'pincode' => 'Pincode'
    ];
    
    $errors = [];
    foreach ($required as $field => $name) {
        if (!isset($data->$field) || empty(trim($data->$field))) {
            $errors[$field] = "$name is required";
        }
    }

    // Validate email format if provided
    if (!empty($data->email)) {
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Invalid email format";
        }
    }

    // Validate phone number if provided
    if (!empty($data->phone_number)) {
        if (!preg_match('/^[0-9]{10,15}$/', $data->phone_number)) {
            $errors['phone_number'] = "Invalid phone number format";
        }
    }

    if (!empty($errors)) {
        file_put_contents('php_error.log', "Validation errors: ".print_r($errors, true)."\n", FILE_APPEND);
        $response['message'] = "Validation failed";
        $response['errors'] = $errors;
        http_response_code(400);
        echo json_encode($response);
        ob_end_clean();
        exit();
    }

    // Get DB connection
    file_put_contents('php_error.log', "Getting DB connection\n", FILE_APPEND);
    $conn = getDBConnection();
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    file_put_contents('php_error.log', "DB connection established\n", FILE_APPEND);

    // Prepare the insert statement
    $query = "INSERT INTO stores (
        store_name, store_code, phone_number, email, alternate_contact,
        address_line1, address_line2, city, district, state, country,
        pincode, store_manager, opening_date, working_hours, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    file_put_contents('php_error.log', "Preparing query: ".$query."\n", FILE_APPEND);
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }
    file_put_contents('php_error.log', "Query prepared successfully\n", FILE_APPEND);

    // Format data with defaults
    $opening_date = !empty($data->opening_date) ? $data->opening_date : null;
    $working_hours = !empty($data->working_hours) ? $data->working_hours : '9:00 AM - 9:00 PM';
    $status = !empty($data->status) ? $data->status : 'Active';

    // Log parameter values
    $params = [
        $data->store_name,
        $data->store_code,
        $data->phone_number ?? null,
        $data->email ?? null,
        $data->alternate_contact ?? null,
        $data->address_line1,
        $data->address_line2 ?? null,
        $data->city,
        $data->district ?? null,
        $data->state,
        $data->country,
        $data->pincode,
        $data->store_manager ?? null,
        $opening_date,
        $working_hours,
        $status
    ];
    
    file_put_contents('php_error.log', "Parameters to bind: ".print_r($params, true)."\n", FILE_APPEND);

    // Bind parameters
    file_put_contents('php_error.log', "Binding parameters\n", FILE_APPEND);
    $bindResult = $stmt->bind_param(
        "ssssssssssssssss",
        ...$params
    );
    
    if (!$bindResult) {
        throw new Exception("Failed to bind parameters: ".$stmt->error);
    }
    file_put_contents('php_error.log', "Parameters bound successfully\n", FILE_APPEND);

    // Execute the statement
    file_put_contents('php_error.log', "Executing statement\n", FILE_APPEND);
    if ($stmt->execute()) {
        $store_id = $stmt->insert_id;
        file_put_contents('php_error.log', "Store added successfully, ID: ".$store_id."\n", FILE_APPEND);
        
        $response['success'] = true;
        $response['message'] = "Store added successfully";
        $response['store_id'] = $store_id;
        
        http_response_code(201);
        echo json_encode($response);
    } else {
        file_put_contents('php_error.log', "Execute failed: ".$stmt->error."\n", FILE_APPEND);
        
        // Check for duplicate store_code
        if ($conn->errno == 1062) {
            $response['message'] = "Store code already exists";
            $response['errors']['store_code'] = "This store code is already in use";
            http_response_code(409);
        } else {
            $response['message'] = "Database error occurred";
            $response['errors']['database'] = $stmt->error;
            http_response_code(500);
        }
        
        echo json_encode($response);
    }
} catch (Exception $e) {
    file_put_contents('php_error.log', "Exception caught: ".$e->getMessage()."\n", FILE_APPEND);
    file_put_contents('php_error.log', "Stack trace: ".$e->getTraceAsString()."\n", FILE_APPEND);
    
    $response['message'] = "Server error occurred";
    $response['errors']['server'] = $e->getMessage();
    
    http_response_code(500);
    echo json_encode($response);
} finally {
    if (isset($stmt)) {
        file_put_contents('php_error.log', "Closing statement\n", FILE_APPEND);
        $stmt->close();
    }
    if (isset($conn)) {
        file_put_contents('php_error.log', "Closing connection\n", FILE_APPEND);
        $conn->close();
    }
    ob_end_flush();
    file_put_contents('php_error.log', "Script completed\n\n", FILE_APPEND);
}
