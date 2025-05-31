<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Debug Start
file_put_contents('php_errors.log', "====== NEW UPDATE USER REQUEST ======\n", FILE_APPEND);
file_put_contents('php_errors.log', "Time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

try {
    // Include database connection
    require_once 'dbconnect.php';
    file_put_contents('php_errors.log', "Included dbconnect.php\n", FILE_APPEND);

    // Get the input data
    $rawInput = file_get_contents('php://input');
    file_put_contents('php_errors.log', "Raw input: $rawInput\n", FILE_APPEND);
    $data = json_decode($rawInput, true);

    file_put_contents('php_errors.log', "Raw input: " . file_get_contents('php://input') . "\n", FILE_APPEND);

    
    // Validate required fields
    if (!isset($data['id']) || empty($data['id'])) {
        $response['message'] = 'User ID is required';
        file_put_contents('php_errors.log', "Validation failed: User ID is required\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $userId = $data['id'];
    file_put_contents('php_errors.log', "Updating user with ID: $userId\n", FILE_APPEND);

    // Get database connection
    $conn = getDBConnection();
    file_put_contents('php_errors.log', "Database connection established\n", FILE_APPEND);

    // Check if user exists
    $checkUser = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $checkUser->bind_param("i", $userId);
    $checkUser->execute();
    $checkUser->store_result();

    if ($checkUser->num_rows === 0) {
        $response['message'] = 'User not found';
        file_put_contents('php_errors.log', "User with ID $userId not found\n", FILE_APPEND);
        http_response_code(404);
        echo json_encode($response);
        exit();
    }
    file_put_contents('php_errors.log', "User exists. Proceeding to update...\n", FILE_APPEND);
    $checkUser->close();

    // Prepare update fields
    $updateFields = [];
    $updateValues = [];
    $types = '';

    $allowedFields = ['first_name', 'last_name', 'username', 'phone', 'status', 'role'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateFields[] = "$field = ?";
            $updateValues[] = $data[$field];
            $types .= 's';
            file_put_contents('php_errors.log', "Field to update: $field => " . $data[$field] . "\n", FILE_APPEND);
        }
    }

    // If no fields to update
    if (empty($updateFields)) {
        $response['message'] = 'No fields to update';
        file_put_contents('php_errors.log', "No fields provided for update\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    // Add user ID to the values
    $updateValues[] = $userId;
    $types .= 'i';

    // Prepare the update statement
    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    file_put_contents('php_errors.log', "Prepared update query: $query\n", FILE_APPEND);
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$updateValues);

    // Execute the statement
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'User updated successfully';
        file_put_contents('php_errors.log', "User updated successfully.\n", FILE_APPEND);
        http_response_code(200);
    } else {
        throw new Exception("Error updating user: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error occurred';
    $response['errors']['server'] = $e->getMessage();
    error_log("Error in updateUser.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    file_put_contents('php_errors.log', "Exception: " . $e->getMessage() . "\n", FILE_APPEND);
} finally {
    if (isset($conn)) {
        $conn->close();
        file_put_contents('php_errors.log', "DB connection closed\n", FILE_APPEND);
    }

    echo json_encode($response);
    file_put_contents('php_errors.log', "Response sent: " . json_encode($response) . "\n", FILE_APPEND);
    file_put_contents('php_errors.log', "====== REQUEST COMPLETED ======\n\n", FILE_APPEND);
}
