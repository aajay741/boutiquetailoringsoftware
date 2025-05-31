<?php
require_once '../dbconnect.php';

file_put_contents('php_errors.log', "====== NEW DELETE REQUEST ======\n", FILE_APPEND);
file_put_contents('php_errors.log', "Time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$response = ['success' => false, 'message' => ''];

$id = $_GET['id'] ?? null;
file_put_contents('php_errors.log', "Received ID: " . var_export($id, true) . "\n", FILE_APPEND);

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    $response['message'] = "Invalid or missing ID";
    file_put_contents('php_errors.log', "Invalid or missing ID\n", FILE_APPEND);
    echo json_encode($response);
    exit();
}

try {
    file_put_contents('php_errors.log', "Attempting DB connection\n", FILE_APPEND);
    $conn = getDBConnection();

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    file_put_contents('php_errors.log', "DB connected successfully\n", FILE_APPEND);

    $stmt = $conn->prepare("DELETE FROM stores WHERE store_id = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    file_put_contents('php_errors.log', "Statement prepared\n", FILE_APPEND);

    $stmt->bind_param("i", $id);
    file_put_contents('php_errors.log', "Parameter bound: ID = $id\n", FILE_APPEND);

    if ($stmt->execute()) {
        file_put_contents('php_errors.log', "Query executed\n", FILE_APPEND);

        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = "Store deleted successfully.";
            file_put_contents('php_errors.log', "Store deleted successfully\n", FILE_APPEND);
        } else {
            // Idempotent success: store was already deleted or does not exist
            $response['success'] = true;
            $response['message'] = "Store already deleted or not found.";
            file_put_contents('php_errors.log', "No rows affected – store not found (treated as success)\n", FILE_APPEND);
        }
    } else {
        $response['message'] = "Error deleting store.";
        file_put_contents('php_errors.log', "Execute failed: " . $stmt->error . "\n", FILE_APPEND);
    }

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = "Server error";
    $response['error'] = $e->getMessage();
    file_put_contents('php_errors.log', "Exception caught: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode($response);
} finally {
    file_put_contents('php_errors.log', "Closing DB resources\n", FILE_APPEND);
    $stmt?->close();
    $conn?->close();
    file_put_contents('php_errors.log', "Request completed\n\n", FILE_APPEND);
}
