<?php
// Enable error logging
file_put_contents('php_error.log', "======== ORDER LIST REQUEST ========\n", FILE_APPEND);
file_put_contents('php_error.log', "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents('php_error.log', "Request time: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents('php_error.log', "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    exit();
}

// Response template
$response = [
    'success' => false,
    'message' => '',
    'orders' => [],
    'total' => 0,
    'errors' => []
];

try {
    require_once '../dbconnect.php';  // Your DB connection file
    file_put_contents('php_error.log', "DB connected\n", FILE_APPEND);

    // Get query parameters
    $params = $_GET;

    // Initialize filters
    $filters = [];
    $whereClauses = [];
    $joinClauses = [];
    $queryParams = [];
    $paramTypes = '';

    // Store filter (multiple stores)
    if (!empty($params['store_ids'])) {
        $storeIds = is_array($params['store_ids']) ? $params['store_ids'] : explode(',', $params['store_ids']);
        $placeholders = implode(',', array_fill(0, count($storeIds), '?'));
        $whereClauses[] = "o.store_id IN ($placeholders)";
        $queryParams = array_merge($queryParams, $storeIds);
        $paramTypes .= str_repeat('i', count($storeIds));
    }

    // Customer name filter
    if (!empty($params['customer_name'])) {
        $whereClauses[] = "c.full_name LIKE ?";
        $queryParams[] = '%' . $params['customer_name'] . '%';
        $paramTypes .= 's';
    }

    // Customer phone filter
    if (!empty($params['customer_phone'])) {
        $whereClauses[] = "c.phone LIKE ?";
        $queryParams[] = '%' . $params['customer_phone'] . '%';
        $paramTypes .= 's';
    }

    // Taken by filter (multiple staff)
    if (!empty($params['taken_by'])) {
        $takenBy = is_array($params['taken_by']) ? $params['taken_by'] : explode(',', $params['taken_by']);
        $placeholders = implode(',', array_fill(0, count($takenBy), '?'));
        $whereClauses[] = "o.order_taken_by IN ($placeholders)";
        $queryParams = array_merge($queryParams, $takenBy);
        $paramTypes .= str_repeat('i', count($takenBy));
    }

    // Assigned to filter (multiple staff)
    if (!empty($params['assigned_to'])) {
        $assignedTo = is_array($params['assigned_to']) ? $params['assigned_to'] : explode(',', $params['assigned_to']);
        $placeholders = implode(',', array_fill(0, count($assignedTo), '?'));
        $whereClauses[] = "o.assigned_to IN ($placeholders)";
        $queryParams = array_merge($queryParams, $assignedTo);
        $paramTypes .= str_repeat('i', count($assignedTo));
    }

    // Date range filters
    if (!empty($params['taken_date_from'])) {
        $whereClauses[] = "o.taken_date >= ?";
        $queryParams[] = $params['taken_date_from'];
        $paramTypes .= 's';
    }

    if (!empty($params['taken_date_to'])) {
        $whereClauses[] = "o.taken_date <= ?";
        $queryParams[] = $params['taken_date_to'];
        $paramTypes .= 's';
    }

    if (!empty($params['delivery_date_from'])) {
        $whereClauses[] = "o.delivery_date >= ?";
        $queryParams[] = $params['delivery_date_from'];
        $paramTypes .= 's';
    }

    if (!empty($params['delivery_date_to'])) {
        $whereClauses[] = "o.delivery_date <= ?";
        $queryParams[] = $params['delivery_date_to'];
        $paramTypes .= 's';
    }

    // Status filter
    if (!empty($params['status'])) {
        $statuses = is_array($params['status']) ? $params['status'] : explode(',', $params['status']);
        $placeholders = implode(',', array_fill(0, count($statuses), '?'));
        $whereClauses[] = "o.status IN ($placeholders)";
        $queryParams = array_merge($queryParams, $statuses);
        $paramTypes .= str_repeat('s', count($statuses));
    }

    // Build the base query
    $baseQuery = "SELECT 
        o.id as order_id,
        o.taken_date,
        o.delivery_date,
        o.special_note,
        o.advance,
        o.total_amount as total,
        o.balance_amount as balance,
        o.status,
        c.full_name as customer_name,
        c.phone as customer_phone,
        c.whatsapp as customer_whatsapp,
        c.address as customer_address,
        c.store_id,
        taken_by.full_name as taken_by_name,
        taken_by.id as taken_by_id,
        assigned_to.full_name as assigned_to_name,
        assigned_to.id as assigned_to_id
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN masters taken_by ON o.order_taken_by = taken_by.id
    JOIN masters assigned_to ON o.assigned_to = assigned_to.id";

    // Add WHERE clauses if any
    $whereClause = '';
    if (!empty($whereClauses)) {
        $whereClause = " WHERE " . implode(" AND ", $whereClauses);
    }

    // Count total records (for pagination)
    $countQuery = "SELECT COUNT(*) as total FROM orders o 
                  JOIN customers c ON o.customer_id = c.id" . $whereClause;
    
    $stmt = $conn->prepare($countQuery);
    if (!empty($queryParams)) {
        $stmt->bind_param($paramTypes, ...$queryParams);
    }
    $stmt->execute();
    $countResult = $stmt->get_result()->fetch_assoc();
    $response['total'] = $countResult['total'];

    // Add sorting and pagination
    $orderBy = " ORDER BY o.taken_date DESC";
    $limit = "";
    
    if (!empty($params['page']) && !empty($params['per_page'])) {
        $page = max(1, (int)$params['page']);
        $perPage = max(1, (int)$params['per_page']);
        $offset = ($page - 1) * $perPage;
        $limit = " LIMIT $offset, $perPage";
    }

    // Final query
    $query = $baseQuery . $whereClause . $orderBy . $limit;
    file_put_contents('php_error.log', "Query: $query\n", FILE_APPEND);

    // Execute main query
    $stmt = $conn->prepare($query);
    if (!empty($queryParams)) {
        $stmt->bind_param($paramTypes, ...$queryParams);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch orders
    while ($order = $result->fetch_assoc()) {
        // Get particulars for this order
        $particulars = [];
        $stmtParts = $conn->prepare("
            SELECT op.id, op.description, op.price, op.status 
            FROM order_particulars op 
            WHERE op.order_id = ?
        ");
        $stmtParts->bind_param("i", $order['order_id']);
        $stmtParts->execute();
        $partsResult = $stmtParts->get_result();
        
        while ($part = $partsResult->fetch_assoc()) {
            // Get images for this particular
            $images = [];
            $stmtImages = $conn->prepare("
                SELECT image_url 
                FROM order_images 
                WHERE particular_id = ?
            ");
            $stmtImages->bind_param("i", $part['id']);
            $stmtImages->execute();
            $imagesResult = $stmtImages->get_result();
            
            while ($img = $imagesResult->fetch_assoc()) {
                $images[] = [
                    'url' => $img['image_url']
                ];
            }
            
            $particulars[] = [
                'id' => $part['id'],
                'description' => $part['description'],
                'price' => (float)$part['price'],
                'status' => $part['status'],
                'images' => $images
            ];
        }

        // Get measurements for this order
        $measurements = [];
        $stmtMeas = $conn->prepare("
            SELECT * FROM measurements 
            WHERE order_id = ?
        ");
        $stmtMeas->bind_param("i", $order['order_id']);
        $stmtMeas->execute();
        $measResult = $stmtMeas->get_result();
        
        if ($meas = $measResult->fetch_assoc()) {
            $measurementId = $meas['id'];
            $measurements = [
                'L' => $meas['L'],
                'SH' => $meas['SH'],
                'ARM' => $meas['ARM'],
                'UB' => $meas['UB'],
                'MB' => $meas['MB'],
                'W' => $meas['W'],
                'POINT' => $meas['POINT'],
                'FN' => $meas['FN'],
                'BN' => $meas['BN'],
                'HIP' => $meas['HIP'],
                'SEAT' => $meas['SEAT'],
                'THIGH' => $meas['THIGH'],
                'SL' => [],
                'others' => []
            ];

            // Get SL measurements
            $stmtSL = $conn->prepare("
                SELECT position, L, W, A 
                FROM sl_measurements 
                WHERE measurement_id = ?
                ORDER BY position
            ");
            $stmtSL->bind_param("i", $measurementId);
            $stmtSL->execute();
            $slResult = $stmtSL->get_result();
            
            while ($sl = $slResult->fetch_assoc()) {
                $measurements['SL'][] = [
                    'L' => $sl['L'],
                    'W' => $sl['W'],
                    'A' => $sl['A']
                ];
            }

            // Get custom measurements
            $stmtCustom = $conn->prepare("
                SELECT name, value 
                FROM custom_measurements 
                WHERE measurement_id = ?
            ");
            $stmtCustom->bind_param("i", $measurementId);
            $stmtCustom->execute();
            $customResult = $stmtCustom->get_result();
            
            while ($custom = $customResult->fetch_assoc()) {
                $measurements['others'][] = [
                    'name' => $custom['name'],
                    'value' => $custom['value']
                ];
            }
        }

        // Format the order in the same structure as your input
        $formattedOrder = [
            'order_id' => $order['order_id'],
            'customer' => [
                'fullName' => $order['customer_name'],
                'phone' => $order['customer_phone'],
                'whatsapp' => $order['customer_whatsapp'],
                'address' => $order['customer_address'],
                'storeId' => $order['store_id']
            ],
            'orderTakenBy' => [
                'masterId' => $order['taken_by_id'],
                'name' => $order['taken_by_name']
            ],
            'assignedTo' => [
                'masterId' => $order['assigned_to_id'],
                'name' => $order['assigned_to_name']
            ],
            'dates' => [
                'takenDate' => $order['taken_date'],
                'deliveryDate' => $order['delivery_date']
            ],
            'particulars' => $particulars,
            'measurements' => $measurements,
            'advance' => (float)$order['advance'],
            'total' => (float)$order['total'],
            'balance' => (float)$order['balance'],
            'specialNote' => $order['special_note'],
            'status' => $order['status']
        ];

        $response['orders'][] = $formattedOrder;
    }

    $response['success'] = true;
    $response['message'] = "Orders retrieved successfully";
    http_response_code(200);

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
exit();