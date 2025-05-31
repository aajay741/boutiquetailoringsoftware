<?php
require_once '../dbconnect.php';

file_put_contents('php_errors.log', "====== NEW GET STORES REQUEST ======\n", FILE_APPEND);
file_put_contents('php_errors.log', "Time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$response = ['success' => false, 'message' => '', 'stores' => []];

try {
    file_put_contents('php_errors.log', "Attempting DB connection...\n", FILE_APPEND);
    $conn = getDBConnection();

    if ($conn->connect_error) {
        file_put_contents('php_errors.log', "Connection failed: " . $conn->connect_error . "\n", FILE_APPEND);
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    file_put_contents('php_errors.log', "DB connection successful.\n", FILE_APPEND);

    $query = "SELECT * FROM stores ORDER BY store_name ASC";
    file_put_contents('php_errors.log', "Executing query: $query\n", FILE_APPEND);
    $result = $conn->query($query);

    if ($result === false) {
        file_put_contents('php_errors.log', "Query execution failed: " . $conn->error . "\n", FILE_APPEND);
        throw new Exception("Query failed: " . $conn->error);
    }

    if ($result->num_rows > 0) {
        $stores = [];
        while ($row = $result->fetch_assoc()) {
            $stores[] = $row;
        }
        $response['success'] = true;
        $response['stores'] = $stores;
        file_put_contents('php_errors.log', "Stores fetched: " . count($stores) . "\n", FILE_APPEND);
    } else {
        $response['message'] = "No stores found.";
        file_put_contents('php_errors.log', "No stores found.\n", FILE_APPEND);
    }

    echo json_encode($response);
    file_put_contents('php_errors.log', "Response sent successfully.\n", FILE_APPEND);
} catch (Exception $e) {
    $response['message'] = "Error occurred";
    $response['error'] = $e->getMessage();
    echo json_encode($response);
    file_put_contents('php_errors.log', "Exception caught: " . $e->getMessage() . "\n", FILE_APPEND);
} finally {
    $conn?->close();
    file_put_contents('php_errors.log', "DB connection closed.\n", FILE_APPEND);
    file_put_contents('php_errors.log', "Request completed\n\n", FILE_APPEND);
}
