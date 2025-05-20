<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$requestLog = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'time' => date('Y-m-d H:i:s'),
    'raw_input' => file_get_contents('php://input')
];
file_put_contents('request_log.txt', json_encode($requestLog) . "\n", FILE_APPEND);


$host = 'localhost';
$username = 'root';
$password = '';
$database = 'auth_system';

try {
    $conn = new mysqli($host, $username, $password, $database);

    if ($conn->connect_error) {
        throw new Exception('Błąd połączenia z bazą danych: ' . $conn->connect_error);
    }

    // Set character set to UTF-8
    $conn->set_charset('utf8mb4');
} catch (Exception $e) {
    sendResponse(false, $e->getMessage(), 500);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_data = file_get_contents('php://input');
    $input = json_decode($raw_data, true);
    if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Nieprawidłowe dane JSON: ' . json_last_error_msg() . '. Raw data: ' . substr($raw_data, 0, 100), 400);
        exit();
    }
} else {
    $input = $_GET;
}

if (empty($input)) {
    sendResponse(false, 'Brak danych wejściowych. Metoda: ' . $_SERVER['REQUEST_METHOD'], 400);
    exit();
}

$action = isset($input['action']) ? $input['action'] : '';

switch ($action) {
    case 'login':
        handleLogin($conn, $input);
        break;
    case 'register':
        handleRegister($conn, $input);
        break;
    case 'forgotpassword':
        handleForgotPassword($conn, $input);
        break;
    default:
        sendResponse(false, 'Nieprawidłowa akcja: ' . $action, 400);
        break;
}

$conn->close();

function handleLogin($conn, $data) {
    // For debugging - log login attempt
    file_put_contents('login_attempts.txt', json_encode($data) . "\n", FILE_APPEND);

    // Validate required fields
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(false, 'Email i hasło są wymagane', 400);
        return;
    }
    $stmt = $conn->prepare("SELECT id, name, email, password, active FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(false, 'Nieprawidłowy email lub hasło', 401);
        return;
    }

    $user = $result->fetch_assoc();
    $stmt->close();
    if (!$user['active']) {
        sendResponse(false, 'Twoje konto jest nieaktywne. Skontaktuj się z administratorem.', 403);
        return;
    }

    if (!password_verify($data['password'], $user['password'])) {
        file_put_contents('failed_logins.txt', 
            "Failed login for {$data['email']} - Password verification failed\n", 
            FILE_APPEND);
            
        sendResponse(false, 'Nieprawidłowy email lub hasło', 401);
        return;
    }

    $token = bin2hex(random_bytes(32));
    $updateStmt = $conn->prepare("UPDATE users SET token = ?, last_login = NOW() WHERE id = ?");
    $updateStmt->bind_param("si", $token, $user['id']);
    $updateStmt->execute();
    $updateStmt->close();

    $userData = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ];

    sendResponse(true, 'Zalogowano pomyślnie', 200, $userData, $token);
}

function handleRegister($conn, $data) {
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(false, 'Wszystkie pola są wymagane', 400);
        return;
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'Nieprawidłowy format adresu email', 400);
        return;
    }
    if (strlen($data['password']) < 8) {
        sendResponse(false, 'Hasło musi mieć co najmniej 8 znaków', 400);
        return;
    }
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $data['email']);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        sendResponse(false, 'Użytkownik z tym adresem email już istnieje', 409);
        return;
    }
    $checkStmt->close();

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $token = bin2hex(random_bytes(32));

    // Insert new user
    $insertStmt = $conn->prepare("INSERT INTO users (name, email, password, token, created_at) VALUES (?, ?, ?, ?, NOW())");
    $insertStmt->bind_param("ssss", $data['name'], $data['email'], $hashedPassword, $token);
    
    if (!$insertStmt->execute()) {
        sendResponse(false, 'Błąd podczas rejestracji: ' . $insertStmt->error, 500);
        return;
    }
    
    $userId = $insertStmt->insert_id;
    $insertStmt->close();
    $userData = [
        'id' => $userId,
        'name' => $data['name'],
        'email' => $data['email']
    ];

    sendResponse(true, 'Rejestracja zakończona pomyślnie', 201, $userData, $token);
}

function handleForgotPassword($conn, $data) {
    if (empty($data['email'])) {
        sendResponse(false, 'Adres email jest wymagany', 400);
        return;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(true, 'Jeśli podany adres email istnieje w naszej bazie, wysłaliśmy link do resetowania hasła', 200);
        return;
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $stmt->close();

    // Generate reset token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $deleteStmt = $conn->prepare("DELETE FROM reset_tokens WHERE user_id = ?");
    $deleteStmt->bind_param("i", $userId);
    $deleteStmt->execute();
    $deleteStmt->close();

    $insertStmt = $conn->prepare("INSERT INTO reset_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())");
    $insertStmt->bind_param("iss", $userId, $token, $expires);
    
    if (!$insertStmt->execute()) {
        sendResponse(false, 'Wystąpił błąd podczas generowania tokenu resetowania', 500);
        return;
    }
    $insertStmt->close();

    // In a real application, I would send an email with a reset link
    // For this school project, I'll just return a success message
    
    sendResponse(true, 'Jeśli podany adres email istnieje w naszej bazie, wysłaliśmy link do resetowania hasła', 200);
}

function sendResponse($success, $message, $statusCode = 200, $user = null, $token = null) {
    http_response_code($statusCode);
    
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($user !== null) {
        $response['user'] = $user;
    }
    
    if ($token !== null) {
        $response['token'] = $token;
    }
    
    // For debugging
    file_put_contents('response_log.txt', 
        date('Y-m-d H:i:s') . " - Status: $statusCode - " . json_encode($response) . "\n", 
        FILE_APPEND);
    
    echo json_encode($response);
    exit();
}

?>