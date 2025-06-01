<?php
require_once '../dbconnect.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    'success' => false,
    'message' => '',
    'orders' => [],
    'pagination' => [],
    'errors' => []
];

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

try {
    $conn = getDBConnection();

    // Build search condition
    $where = [];
    $params = [];
    $types = '';

    if (!empty($_GET['customer_name'])) {
        $where[] = "c.full_name LIKE ?";
        $params[] = "%" . $_GET['customer_name'] . "%";
        $types .= 's';
    }
    if (!empty($_GET['phone'])) {
        $where[] = "c.phone LIKE ?";
        $params[] = "%" . $_GET['phone'] . "%";
        $types .= 's';
    }
    if (!empty($_GET['taken_date'])) {
        $where[] = "o.taken_date = ?";
        $params[] = $_GET['taken_date'];
        $types .= 's';
    }
    if (!empty($_GET['delivery_date'])) {
        $where[] = "o.delivery_date = ?";
        $params[] = $_GET['delivery_date'];
        $types .= 's';
    }
    if (!empty($_GET['store'])) {
        $where[] = "o.store_id = ?";
        $params[] = intval($_GET['store']);
        $types .= 'i'; // Correct type for integer
        file_put_contents('php_error.log', "Searched store_id: " . intval($_GET['store']) . "\n", FILE_APPEND);
    }
    if (!empty($_GET['invoice'])) {
        $where[] = "o.invoice LIKE ?";
        $params[] = "%" . $_GET['invoice'] . "%";
        $types .= 's';
    }
    if (!empty($_GET['assigned_to'])) {
        $where[] = "o.assigned_to = ?";
        $params[] = intval($_GET['assigned_to']);
        $types .= 'i';
    }
    if (!empty($_GET['status'])) {
        $where[] = "o.status = ?";
        $params[] = $_GET['status'];
        $types .= 's';
    }

    if (isset($_GET['pendingstatus'])) {
        $where[] = "o.status != ?";
        $params[] = "delivered";
        $types .= 's';
    }

    $whereSql = '';
    if (count($where) > 0) {
        $whereSql = "WHERE " . implode(" AND ", $where);
    }

    // Count total
    $countSql = "SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id $whereSql";
    $countStmt = $conn->prepare($countSql);
    if ($types) {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $countStmt->bind_result($total);
    $countStmt->fetch();
    $countStmt->close();

    // Fetch paginated data
    $sql = "SELECT o.order_id,o.assigned_to, o.invoice, o.taken_date, o.delivery_date, o.status, o.total_amount, o.advance, o.balance_amount, 
                   c.full_name AS customer_name, c.phone, c.address,s.store_name AS storename, u.username AS master_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN stores s ON o.store_id = s.store_id
            LEFT JOIN users u ON o.assigned_to = u.id
            $whereSql
            ORDER BY o.order_id DESC
            LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);

    $bindParams = $params;
    $bindTypes = $types . 'ii';
    $bindParams[] = $limit;
    $bindParams[] = $offset;

    $stmt->bind_param($bindTypes, ...$bindParams);

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'invoice' => $row['invoice'],
            'order_id' => $row['order_id'],
            'customer' => [
                'fullName' => $row['customer_name'],
                'phone' => $row['phone'],
                'address' => $row['address']
            ],
            'taken_date' => $row['taken_date'],
            'delivery_date' => $row['delivery_date'],
            'status' => $row['status'],
            'total_amount' => $row['total_amount'],
            'advance' => $row['advance'],
            'balance_amount' => $row['balance_amount'],
            'store_name' => [$row['storename']],
            'master_name' => $row['master_name'],
             'assigned_to' => $row['assigned_to']

        ];
    }
    $stmt->close();
    $conn->close();

    $response['success'] = true;
    $response['orders'] = $orders;
    $response['pagination'] = [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'pages' => ceil($total / $limit)
    ];
    http_response_code(200);

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
exit();