<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

// Start output buffering
ob_start();

// Headers for CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 3600");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit();
}

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'user' => null
];

try {
    // Log request start
    error_log("======== LOGIN REQUEST START ========");
    
    // Include database connection
    require_once 'dbconnect.php';
    error_log("DB connection file included");
    
    // Get input data
    $json = file_get_contents("php://input");
    if ($json === false) {
        throw new Exception("Failed to read input data");
    }
    
    $data = json_decode($json);
    if ($data === null) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }
    
    error_log("Received login request for email: " . ($data->email ?? ''));
    
    // Validate input
    if (empty($data->email) || empty($data->password)) {
        $response['message'] = "Email and password are required";
        http_response_code(400);
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    $email = trim($data->email);
    $password = $data->password;
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = "Invalid email format";
        http_response_code(400);
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    // Get DB connection
    $conn = getDBConnection();
    
    // Prepare query to get user with password hash
    $stmt = $conn->prepare("SELECT id, username, email, password,role FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Check if user exists
    if ($result->num_rows === 0) {
        $response['message'] = "Invalid email or password";
        http_response_code(401);
        echo json_encode($response);
        ob_end_flush();
        exit();
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password (assuming passwords are stored hashed)
    if (!password_verify($password, $user['password'])) {
        // Password is correct
        unset($user['password']); // Remove password before returning
        
        $response = [
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ];
        
        error_log("Login successful for user: " . $user['email']);
    } else {
        $response['message'] = "Invalid email or password";
        http_response_code(401);
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    $response['message'] = "An error occurred during login";
    http_response_code(500);
    echo json_encode($response);
} finally {
    // Clean up resources
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
    ob_end_flush();
    error_log("======== LOGIN REQUEST END ========\n");
}