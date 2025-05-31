<?php
require_once '../dbconnect.php';

file_put_contents('php_errors.log', "\n====== NEW UPDATE REQUEST ======\n", FILE_APPEND);
file_put_contents('php_errors.log', "Time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");


$response = ['success' => false, 'message' => '', 'errors' => []];

$id = $_GET['id'] ?? null;
file_put_contents('php_errors.log', "Received ID: " . var_export($id, true) . "\n", FILE_APPEND);

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    $response['message'] = "Invalid or missing store ID";
    file_put_contents('php_errors.log', "Invalid or missing ID\n", FILE_APPEND);
    echo json_encode($response);
    exit();
}

$json = file_get_contents("php://input");
file_put_contents('php_errors.log', "Raw JSON: $json\n", FILE_APPEND);

$data = json_decode($json);
if (!$data) {
    http_response_code(400);
    $response['message'] = "Invalid JSON input";
    file_put_contents('php_errors.log', "JSON decoding failed\n", FILE_APPEND);
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

    $query = "UPDATE stores SET
        store_name = ?, store_code = ?, phone_number = ?, email = ?, alternate_contact = ?,
        address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, country = ?,
        pincode = ?, store_manager = ?, opening_date = ?, working_hours = ?, status = ?
        WHERE store_id = ?";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    file_put_contents('php_errors.log', "Statement prepared\n", FILE_APPEND);

    $store_name = $data->store_name ?? null;
    $store_code = $data->store_code ?? null;
    $phone_number = $data->phone_number ?? null;
    $email = $data->email ?? null;
    $alternate_contact = $data->alternate_contact ?? null;
    $address_line1 = $data->address_line1 ?? null;
    $address_line2 = $data->address_line2 ?? null;
    $city = $data->city ?? null;
    $district = $data->district ?? null;
    $state = $data->state ?? null;
    $country = $data->country ?? null;
    $pincode = $data->pincode ?? null;
    $store_manager = $data->store_manager ?? null;
    $opening_date = $data->opening_date ?? null;
    $working_hours = $data->working_hours ?? '9:00 AM - 9:00 PM';
    $status = $data->status ?? 'Active';

    $stmt->bind_param("sssssssssssssssssi",
        $store_name, $store_code, $phone_number, $email, $alternate_contact,
        $address_line1, $address_line2, $city, $district, $state, $country,
        $pincode, $store_manager, $opening_date, $working_hours, $status, $id
    );
    file_put_contents('php_errors.log', "Parameters bound\n", FILE_APPEND);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Store updated successfully";
        file_put_contents('php_errors.log', "Query executed successfully. Store updated.\n", FILE_APPEND);
    } else {
        $response['message'] = "Failed to update store";
        file_put_contents('php_errors.log', "Execution failed: " . $stmt->error . "\n", FILE_APPEND);
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
