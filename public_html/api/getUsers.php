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
    'users' => [],
    'message' => ''
];

try {
    // Include database connection
    require_once 'dbconnect.php';
    
    // Get database connection
    $conn = getDBConnection();
    
    // Prepare the query
    $query = "SELECT id, email, username, first_name, last_name, phone, 
              profile_image, status, role, created_at 
              FROM users ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    $response['success'] = true;
    $response['users'] = $users;
    $response['message'] = 'Users fetched successfully';
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error occurred';
    
    // Log the full error
    error_log("Error in getUsers.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
    
    echo json_encode($response);
}