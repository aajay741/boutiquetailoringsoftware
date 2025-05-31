<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'user_id' => null,
    'errors' => []
];

try {
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Script started\n", FILE_APPEND);

    // Include database connection
    require_once 'dbconnect.php';
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Included dbconnect.php\n", FILE_APPEND);

    // Get the input data
    $data = $_POST;
    $files = $_FILES;
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Received POST data and FILES\n", FILE_APPEND);

    // Validate required fields
    $requiredFields = ['email', 'password', 'first_name', 'last_name'];
    $missingFields = [];

    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        $response['message'] = 'Required fields are missing';
        foreach ($missingFields as $field) {
            $response['errors'][$field] = 'This field is required';
        }
        http_response_code(400);
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Missing fields: " . implode(', ', $missingFields) . "\n", FILE_APPEND);
        echo json_encode($response);
        exit();
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Invalid email format';
        $response['errors']['email'] = 'Please provide a valid email address';
        http_response_code(400);
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Invalid email format: " . $data['email'] . "\n", FILE_APPEND);
        echo json_encode($response);
        exit();
    }

    // Validate password strength
    if (strlen($data['password']) < 8) {
        $response['message'] = 'Password too weak';
        $response['errors']['password'] = 'Password must be at least 8 characters';
        http_response_code(400);
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Weak password provided\n", FILE_APPEND);
        echo json_encode($response);
        exit();
    }

    // Hash the password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Password hashed\n", FILE_APPEND);

    // Get database connection
    $conn = getDBConnection();
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Database connection established\n", FILE_APPEND);

    // Check if email already exists
    $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if (!$checkEmail) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $checkEmail->bind_param("s", $data['email']);
    $checkEmail->execute();
    $checkEmail->store_result();
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Checked existing email in DB\n", FILE_APPEND);

    if ($checkEmail->num_rows > 0) {
        $response['message'] = 'Email already exists';
        $response['errors']['email'] = 'This email is already registered';
        http_response_code(409);
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Email already exists: " . $data['email'] . "\n", FILE_APPEND);
        echo json_encode($response);
        exit();
    }
    $checkEmail->close();

    // Handle file upload if exists
    $profileImagePath = null;
    if (!empty($files['profile_image']['name'])) {
        $uploadDir = 'uploads/profile_images/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
            file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Created upload directory\n", FILE_APPEND);
        }

        $fileExtension = pathinfo($files['profile_image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($files['profile_image']['tmp_name'], $targetPath)) {
            $profileImagePath = $targetPath;
            file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Profile image uploaded: $targetPath\n", FILE_APPEND);
        } else {
            file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Failed to upload profile image\n", FILE_APPEND);
            throw new Exception("Failed to upload profile image");
        }
    } else {
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] No profile image uploaded\n", FILE_APPEND);
    }

    // Prepare the insert statement
    $stmt = $conn->prepare("INSERT INTO users (
        email, 
        password, 
        username, 
        first_name, 
        last_name, 
        phone, 
        profile_image, 
        status, 
        role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    // Set default values for optional fields
    $username = $data['username'] ?? null;
    $phone = $data['phone'] ?? null;
    $status = $data['status'] ?? 'active';
    $role = $data['role'] ?? 'user';

    $stmt->bind_param(
        "sssssssss", 
        $data['email'],
        $hashedPassword,
        $username,
        $data['first_name'],
        $data['last_name'],
        $phone,
        $profileImagePath,
        $status,
        $role
    );

    // Execute the statement
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;

        $response['success'] = true;
        $response['message'] = 'User created successfully';
        $response['user_id'] = $user_id;

        http_response_code(201);
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] User inserted successfully with ID: $user_id\n", FILE_APPEND);
    } else {
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Insert failed: " . $stmt->error . "\n", FILE_APPEND);
        throw new Exception("Error creating user: " . $stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error occurred';
    $response['errors']['server'] = $e->getMessage();

    // Log the full error
    error_log("Error in addMaster.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] Exception caught: " . $e->getMessage() . "\n", FILE_APPEND);
} finally {
    if (isset($conn)) {
        $conn->close();
        file_put_contents('php_errors.log', "[" . date('Y-m-d H:i:s') . "] DB connection closed\n", FILE_APPEND);
    }

    echo json_encode($response);
}
