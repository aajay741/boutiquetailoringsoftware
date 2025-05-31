<?php
require_once '../dbconnect.php';

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'data' => null,
    'pagination' => null
];

try {
    // Get DB connection
    $conn = getDBConnection();
    
    // Get query parameters
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $offset = ($page - 1) * $limit;
    
    // Base query
    $sql = "SELECT 
                p.purchase_id,
                p.invoice_number,
                c.store_id,
                s.store_name,
                c.name AS customer_name,
                c.phone,
                COUNT(pm.measurement_id) AS measurement_count,
                a.in_date,
                a.out_date,
                CASE 
                    WHEN a.out_date IS NULL THEN 'Pending'
                    ELSE 'Completed'
                END AS status,
                p.total_amount,
                p.balance_amount,
                p.advance_amount,
                CONCAT(u.first_name, ' ', u.last_name) AS master_name
            FROM 
                purchase AS p
            JOIN 
                customers AS c ON c.customer_id = p.customer_id
            LEFT JOIN
                stores AS s ON c.store_id = s.store_id
            LEFT JOIN
                purchase_measurements AS pm ON p.purchase_id = pm.purchase_id
            LEFT JOIN
                assignments AS a ON p.purchase_id = a.purchase_id
            LEFT JOIN
                users AS u ON a.master_id = u.id";
    
    // Initialize conditions and parameters
    $where = [];
    $params = [];
    $types = '';
    
    // Add search conditions if provided
    if (!empty($search)) {
        $where[] = "(p.invoice_number LIKE ? OR 
                    c.phone LIKE ? OR 
                    c.name LIKE ? OR 
                    s.store_name LIKE ? OR 
                    a.in_date LIKE ? OR 
                    a.out_date LIKE ? OR
                    CONCAT(u.first_name, ' ', u.last_name) LIKE ?)";
        $searchTerm = "%$search%";
        $params = array_fill(0, 7, $searchTerm);
        $types = str_repeat('s', 7);
    }
    
    // Add status filter if provided
    if (!empty($status) && in_array($status, ['Pending', 'Completed'])) {
        $where[] = "CASE 
                      WHEN a.out_date IS NULL THEN 'Pending'
                      ELSE 'Completed'
                    END = ?";
        $params[] = $status;
        $types .= 's';
    }
    
    // Combine WHERE conditions
    if (!empty($where)) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    
    // Group by purchase details
    $sql .= " GROUP BY p.purchase_id, p.invoice_number, s.store_name, c.name, c.phone, 
              a.in_date, a.out_date, p.total_amount, p.balance_amount, p.advance_amount, 
              u.first_name, u.last_name";
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) AS total FROM ($sql) AS derived";
    $stmt = $conn->prepare($countSql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $countResult = $stmt->get_result();
    $totalRows = $countResult->fetch_assoc()['total'];
    $totalPages = ceil($totalRows / $limit);
    
    // Add pagination to main query
    $sql .= " ORDER BY p.purchase_id DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    // Prepare and execute main query
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $purchases = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates for consistent output
        $row['in_date'] = $row['in_date'] ? date('Y-m-d', strtotime($row['in_date'])) : null;
        $row['out_date'] = $row['out_date'] ? date('Y-m-d', strtotime($row['out_date'])) : null;
        $purchases[] = $row;
    }
    
    // Build successful response
    $response = [
        'success' => true,
        'message' => 'Purchases retrieved successfully',
        'data' => $purchases,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => $totalRows,
            'total_pages' => $totalPages
        ]
    ];
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);