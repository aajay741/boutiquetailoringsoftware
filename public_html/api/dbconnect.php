<?php
function getDBConnection() {
    // Add logging
    file_put_contents('php_errors.log', "Attempting DB connection\n", FILE_APPEND);
    
    $conn = new mysqli("localhost", "root", '', "sarrahh");
    
    if ($conn->connect_error) {
        $error = "Connection failed: " . $conn->connect_error;
        file_put_contents('php_error.log', $error."\n", FILE_APPEND);
        throw new Exception($error);
    }
    
    file_put_contents('php_errors.log', "DB connected successfully\n", FILE_APPEND);
    return $conn;
}