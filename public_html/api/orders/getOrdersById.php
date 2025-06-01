<?php
// Log request
file_put_contents('php_error.log', "======== GET ORDER DETAILS REQUEST ========\n", FILE_APPEND);
file_put_contents('php_error.log', "Request time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../dbconnect.php';

$response = [
    'success' => false,
    'message' => '',
    'order' => null,
    'errors' => []
];

try {
    // Get order_id from GET or POST
    $order_id = null;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $order_id = $input['order_id'] ?? null;
    } else {
        $order_id = $_GET['order_id'] ?? null;
    }

    if (!$order_id) {
        throw new Exception("Missing order_id");
    }

    $conn = getDBConnection();

    // 1. Get order and customer info
    $sql = "SELECT o.*, 
                   c.full_name AS customer_name, c.phone AS customer_phone, c.whatsapp, c.address, c.store_id AS customer_store_id,
                   s.store_name, s.store_code,
                   mt.username AS taken_by_name,
                   ma.username AS assigned_to_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN stores s ON o.store_id = s.store_id
            LEFT JOIN users mt ON o.order_taken_by = mt.id
            LEFT JOIN users ma ON o.assigned_to = ma.id
            WHERE o.order_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $orderResult = $stmt->get_result();
    $orderRow = $orderResult->fetch_assoc();
    if (!$orderRow) throw new Exception("Order not found");

    // 2. Get particulars and images
    $sql = "SELECT * FROM order_particulars WHERE order_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $particularsResult = $stmt->get_result();
    $particulars = [];
    while ($p = $particularsResult->fetch_assoc()) {
        // Get images for each particular
        $sqlImg = "SELECT image_url FROM order_images WHERE particular_id = ?";
        $stmtImg = $conn->prepare($sqlImg);
        $stmtImg->bind_param("i", $p['particular_id']);
        $stmtImg->execute();
        $imgResult = $stmtImg->get_result();
        $images = [];
        while ($img = $imgResult->fetch_assoc()) {
            $images[] = $img['image_url'];
        }
        $p['images'] = $images;
        $particulars[] = $p;
    }

    // 3. Get measurements
    $sql = "SELECT * FROM measurements WHERE order_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $measurementsResult = $stmt->get_result();
    $measurements = $measurementsResult->fetch_assoc();

    // 3a. Get SL measurements
    $sl_measurements = [];
    if ($measurements && isset($measurements['measurement_id'])) {
        $sql = "SELECT * FROM sl_measurements WHERE measurement_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $measurements['measurement_id']);
        $stmt->execute();
        $slResult = $stmt->get_result();
        while ($sl = $slResult->fetch_assoc()) {
            $sl_measurements[$sl['position']] = [
                'L' => $sl['L'],
                'W' => $sl['W'],
                'A' => $sl['A']
            ];
        }

        // 3b. Get custom measurements
        $custom_measurements = [];
        $sql = "SELECT * FROM custom_measurements WHERE measurement_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $measurements['measurement_id']);
        $stmt->execute();
        $customResult = $stmt->get_result();
        while ($cm = $customResult->fetch_assoc()) {
            $custom_measurements[] = [
                'name' => $cm['name'],
                'value' => $cm['value']
            ];
        }
    }

    // 4. Build response in the same structure as addCustomer.php expects
    $response['order'] = [
        'order' => [
            'order_id'      => $orderRow['order_id'],
            'invoice'       => $orderRow['invoice'],
            'advance'       => $orderRow['advance'],
            'total_amount'  => $orderRow['total_amount'],
            'balance_amount'=> $orderRow['balance_amount'],
            'taken_by'      => $orderRow['order_taken_by'],
            'assigned_to'   => $orderRow['assigned_to'],
            'taken_date'    => $orderRow['taken_date'],
            'delivery_date' => $orderRow['delivery_date'],
            'special_note'  => $orderRow['special_note'],
            'status'        => $orderRow['status'],
            'store_id'      => $orderRow['store_id'],
        ],
        'customer' => [
            'fullName'  => $orderRow['customer_name'],
            'phone'     => $orderRow['customer_phone'],
            'whatsapp'  => $orderRow['whatsapp'],
            'address'   => $orderRow['address'],
            'storeId'   => $orderRow['customer_store_id'],
        ],
        'particulars' => array_map(function($p) {
            return [
                'particular_id' => $p['particular_id'],
                'description'   => $p['description'],
                'price'         => $p['price'],
                'status'        => $p['status'],
                'images'        => $p['images']
            ];
        }, $particulars),
        'measurements' => $measurements ? [
            'L'     => $measurements['L'],
            'SH'    => $measurements['SH'],
            'ARM'   => $measurements['ARM'],
            'UB'    => $measurements['UB'],
            'MB'    => $measurements['MB'],
            'W'     => $measurements['W'],
            'POINT' => $measurements['POINT'],
            'FN'    => $measurements['FN'],
            'BN'    => $measurements['BN'],
            'HIP'   => $measurements['HIP'],
            'SEAT'  => $measurements['SEAT'],
            'THIGH' => $measurements['THIGH'],
            'SL'    => $sl_measurements,
            'others'=> $custom_measurements ?? []
        ] : null,
        'dates' => [
            'takenDate'     => $orderRow['taken_date'],
            'deliveryDate'  => $orderRow['delivery_date']
        ],
        'orderTakenBy' => [
            'masterId'      => $orderRow['order_taken_by'],
            'name'          => $orderRow['taken_by_name']
        ],
        'assignedTo' => [
            'masterId'      => $orderRow['assigned_to'],
            'name'          => $orderRow['assigned_to_name']
        ],
        'specialNote' => $orderRow['special_note'],
        'advance'     => $orderRow['advance'],
        'total'       => $orderRow['total_amount'],
        'balance'     => $orderRow['balance_amount'],
        'status'      => $orderRow['status'],
        'store'       => [
            'store_id'   => $orderRow['store_id'],
            'store_name' => $orderRow['store_name'],
            'store_code' => $orderRow['store_code']
        ]
    ];

    $response['success'] = true;
    $response['message'] = "Order details fetched successfully";

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    $response['errors'][] = $e->getMessage();
    http_response_code(400);
}

// Log the full response
file_put_contents('php_error.log', "Response: " . json_encode($response, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

echo json_encode($response);
exit();