<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$db_host = "localhost";
$db_name = "auth_system";
$db_user = "root";
$db_pass = ""; // Default password is empty for XAMPP/WAMP

// Connect to database
try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit();
}

// Get request data
$data = json_decode(file_get_contents("php://input"));
$action = isset($data->action) ? $data->action : null;

// Process based on action type
if ($action === 'login') {
    // Login process
    if (!isset($data->email) || !isset($data->password) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email and password are required"
        ]);
        exit();
    }
    
    $email = trim($data->email);
    $password = trim($data->password);
    
    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = :email");
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Create session
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            
            // Generate a simple token (in a real app, use JWT or a more secure method)
            $token = bin2hex(random_bytes(32));
            
            // Store token in database
            $stmt = $conn->prepare("UPDATE users SET token = :token, last_login = NOW() WHERE id = :id");
            $stmt->bindParam(":token", $token);
            $stmt->bindParam(":id", $user['id']);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "email" => $user['email']
                ],
                "token" => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid credentials"
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
    }
} elseif ($action === 'register') {
    // Registration process
    if (!isset($data->name) || !isset($data->email) || !isset($data->password) || 
        empty($data->name) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Name, email, and password are required"
        ]);
        exit();
    }
    
    $name = trim($data->name);
    $email = trim($data->email);
    $password = trim($data->password);
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode([
            "success" => false,
            "message" => "Email already in use"
        ]);
        exit();
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare(
        "INSERT INTO users (name, email, password, created_at) 
         VALUES (:name, :email, :password, NOW())"
    );
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $hashed_password);
    
    if ($stmt->execute()) {
        $user_id = $conn->lastInsertId();
        
        // Create session
        session_start();
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        
        // Store token
        $stmt = $conn->prepare("UPDATE users SET token = :token WHERE id = :id");
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        
        http_response_code(201); // Created
        echo json_encode([
            "success" => true,
            "message" => "Registration successful",
            "user" => [
                "id" => $user_id,
                "name" => $name,
                "email" => $email
            ],
            "token" => $token
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Registration failed"
        ]);
    }
} elseif ($action === 'logout') {
    // Logout process
    session_start();
    
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        
        // Invalidate token
        $stmt = $conn->prepare("UPDATE users SET token = NULL WHERE id = :id");
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        
        // Clear session
        session_unset();
        session_destroy();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Logout successful"
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Not logged in"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
}
?>