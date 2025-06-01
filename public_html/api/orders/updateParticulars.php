<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../dbconnect.php';
$conn = getDBConnection();

$data = json_decode(file_get_contents("php://input"));

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate required fields
    if (!isset($data->particular_id) || !isset($data->price) || !isset($data->status)) {
        $response['success'] = false;
        $response['message'] = "Missing required fields (particular_id, price, or status)";
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $particular_id = filter_var($data->particular_id, FILTER_SANITIZE_NUMBER_INT);
    $price = filter_var($data->price, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    $status = filter_var($data->status, FILTER_SANITIZE_STRING);



    try {
        // Prepare the update statement
        $stmt = $conn->prepare("UPDATE order_particulars SET price = ?, status = ? WHERE particular_id = ?");
        
        // Bind parameters
        $stmt->bind_param("dsi", $price, $status, $particular_id);
        
        // Execute the query
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response['success'] = true;
                $response['message'] = "Particular updated successfully";
                http_response_code(200);
            } else {
                $response['success'] = false;
                $response['message'] = "No changes made or particular not found";
                http_response_code(200);
            }
        } else {
            $response['success'] = false;
            $response['message'] = "Error updating particular: " . $stmt->error;
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