<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Initialize response array
$response = [
    'success' => false,
    'user' => null,
    'message' => ''
];

try {
    // Include database connection
    require_once 'dbconnect.php';
    
    // Check if ID is provided
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        $response['message'] = 'User ID is required';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }
    
    $userId = $_GET['id'];
    
    // Get database connection
    $conn = getDBConnection();
    
    // Prepare the query
    $query = "SELECT id, email, username, first_name, last_name, phone, 
              profile_image, status, role, created_at 
              FROM users WHERE id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $response['success'] = true;
        $response['user'] = $result->fetch_assoc();
        $response['message'] = 'User fetched successfully';
    } else {
        $response['message'] = 'User not found';
        http_response_code(404);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error occurred';
    
    // Log the full error
    error_log("Error in getUser.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
    
    echo json_encode($response);
}