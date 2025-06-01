<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../dbconnect.php';
$conn = getDBConnection();

$data = json_decode(file_get_contents("php://input"));

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate required fields
    if (!isset($data->order_id) || !isset($data->field) || !isset($data->value)) {
        $response['success'] = false;
        $response['message'] = "Missing required fields (order_id, field, or value)";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $order_id = filter_var($data->order_id, FILTER_SANITIZE_NUMBER_INT);
    $field = filter_var($data->field, FILTER_SANITIZE_STRING);
    $value = $field === 'assigned_to' 
        ? filter_var($data->value, FILTER_SANITIZE_NUMBER_INT)
        : filter_var($data->value, FILTER_SANITIZE_STRING);

    // Validate field is allowed to be updated
    $allowedFields = ['assigned_to', 'status'];
    if (!in_array($field, $allowedFields)) {
        $response['success'] = false;
        $response['message'] = "Invalid field specified";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    try {
        // Prepare the update statement
        $stmt = $conn->prepare("UPDATE orders SET $field = ? WHERE order_id = ?");
        $stmt->bind_param("si", $value, $order_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response['success'] = true;
                $response['message'] = "Order updated successfully";
                http_response_code(200);
            } else {
                $response['success'] = false;
                $response['message'] = "No changes made or order not found";
                http_response_code(200);
            }
        } else {
            $response['success'] = false;
            $response['message'] = "Error updating order: " . $stmt->error;
            http_response_code(500);
        }

        $stmt->close();
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = "Database error: " . $e->getMessage();
        http_response_code(500);
    }
} else {
    $response['success'] = false;
    $response['message'] = "Invalid request method";
    http_response_code(405);
}

$conn->close();
echo json_encode($response);
?>