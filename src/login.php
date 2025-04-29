<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Dozwolone są tylko zapytania POST']);
    exit();
}


$inputData = file_get_contents('php://input');
$postData = json_decode($inputData, true);


if (!$postData) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowy format danych JSON']);
    exit();
}


$dbPath = __DIR__ . '/database.sqlite';
$isNewDB = !file_exists($dbPath);

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    

    if ($isNewDB) {
        createTables($db);
        seedDatabase($db); // Dodaj przykładowe dane
    }
    
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Błąd bazy danych: ' . $e->getMessage()]);
    exit();
}


$action = isset($postData['action']) ? $postData['action'] : '';

switch ($action) {
    case 'login':
        handleLogin($db, $postData);
        break;
    
    case 'register':
        handleRegistration($db, $postData);
        break;
        
    case 'social_login':
        handleSocialLogin($db, $postData);
        break;
        
    case 'reset_password':
        handlePasswordReset($db, $postData);
        break;
        
    default:
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Nieznany typ akcji']);
        exit();
}

/**
 * Funkcja tworząca tabele w bazie danych
 */
function createTables($db) {
    // Tabela użytkowników
    $db->exec("CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        social_provider TEXT DEFAULT NULL,
        social_provider_id TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Tabela resetów hasła
    $db->exec("CREATE TABLE password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )");
    
    // Tabela sesji
    $db->exec("CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )");
}

/**
 * Funkcja dodająca przykładowe dane do bazy
 */
function seedDatabase($db) {
    // Dodaj przykładowych użytkowników
    $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    
    // Przykładowy użytkownik 1
    $name = "Jan Kowalski";
    $email = "jan@example.com";
    $password = password_hash("haslo123", PASSWORD_DEFAULT);
    $stmt->execute([$name, $email, $password]);
    
    // Przykładowy użytkownik 2
    $name = "Anna Nowak";
    $email = "anna@example.com";
    $password = password_hash("haslo123", PASSWORD_DEFAULT);
    $stmt->execute([$name, $email, $password]);
}

/**
 * Funkcja obsługująca logowanie użytkownika
 */
function handleLogin($db, $data) {
    // Sprawdzanie czy wymagane pola są obecne
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brak wymaganych pól email lub hasło']);
        exit();
    }
    
    $email = trim($data['email']);
    $password = $data['password'];
    
    // Podstawowa walidacja
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email i hasło są wymagane']);
        exit();
    }
    
    // Przygotowanie i wykonanie zapytania
    $stmt = $db->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowy email lub hasło']);
        exit();
    }
    
    // Weryfikacja hasła
    if (!password_verify($password, $user['password'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowy email lub hasło']);
        exit();
    }
    
    // Generowanie tokenu sesji
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Zapisywanie tokenu sesji
    $stmt = $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $token, $expiresAt]);
    
    // Usuń hasło z danych użytkownika przed zwróceniem
    unset($user['password']);
    
    // Zwróć dane użytkownika wraz z tokenem
    echo json_encode([
        'success' => true,
        'message' => 'Logowanie udane',
        'user' => $user,
        'token' => $token
    ]);
}

/**
 * Funkcja obsługująca rejestrację użytkownika
 */
function handleRegistration($db, $data) {
    // Sprawdzanie czy wymagane pola są obecne
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['confirmPassword'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brak wymaganych pól']);
        exit();
    }
    
    $name = trim($data['name']);
    $email = trim($data['email']);
    $password = $data['password'];
    $confirmPassword = $data['confirmPassword'];
    
    // Podstawowa walidacja
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Wszystkie pola są wymagane']);
        exit();
    }
    
    if ($password !== $confirmPassword) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Hasła nie są zgodne']);
        exit();
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Hasło musi mieć co najmniej 6 znaków']);
        exit();
    }
    
    // Sprawdzanie czy użytkownik już istnieje
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'Użytkownik z tym adresem email już istnieje']);
        exit();
    }
    
    // Haszowanie hasła
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Dodawanie nowego użytkownika
    $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $success = $stmt->execute([$name, $email, $hashedPassword]);
    
    if (!$success) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Błąd podczas rejestracji użytkownika']);
        exit();
    }
    
    $userId = $db->lastInsertId();
    
    // Generowanie tokenu sesji
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Zapisywanie tokenu sesji
    $stmt = $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $token, $expiresAt]);
    
    // Zwróć dane użytkownika wraz z tokenem
    echo json_encode([
        'success' => true,
        'message' => 'Rejestracja udana',
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email
        ],
        'token' => $token
    ]);
}

/**
 * Funkcja obsługująca logowanie przez media społecznościowe
 */
function handleSocialLogin($db, $data) {
    if (!isset($data['provider']) || !isset($data['providerId']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brak wymaganych danych dla logowania społecznościowego']);
        exit();
    }
    
    $provider = $data['provider']; // np. 'google', 'github'
    $providerId = $data['providerId'];
    $email = trim($data['email']);
    $name = isset($data['name']) ? trim($data['name']) : '';
    
    
    $stmt = $db->prepare("SELECT id, name, email FROM users WHERE email = ? OR (social_provider = ? AND social_provider_id = ?)");
    $stmt->execute([$email, $provider, $providerId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Użytkownik istnieje - zaloguj
        
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $token, $expiresAt]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Logowanie społecznościowe udane',
            'user' => $user,
            'token' => $token
        ]);
    } else {
        // Nowy użytkownik - zarejestruj
        $stmt = $db->prepare("INSERT INTO users (name, email, social_provider, social_provider_id) VALUES (?, ?, ?, ?)");
        $success = $stmt->execute([$name, $email, $provider, $providerId]);
        
        if (!$success) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Błąd podczas rejestracji przez media społecznościowe']);
            exit();
        }
        
        $userId = $db->lastInsertId();
        
        
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $token, $expiresAt]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Rejestracja społecznościowa udana',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email
            ],
            'token' => $token
        ]);
    }
}

/**
 * Funkcja obsługująca resetowanie hasła
 */
function handlePasswordReset($db, $data) {
    if (!isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Adres email jest wymagany']);
        exit();
    }
    
    $email = trim($data['email']);
    
   
    $stmt = $db->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        
        echo json_encode([
            'success' => true,
            'message' => 'Jeśli konto istnieje, instrukcje resetowania hasła zostały wysłane na podany adres email'
        ]);
        exit();
    }
    
    
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    
    $stmt = $db->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $resetToken, $expiresAt]);
    
    
    $resetLink = "http://localhost:3000/reset-password?token=$resetToken";
    
    echo json_encode([
        'success' => true, 
        'message' => 'Instrukcje resetowania hasła zostały wysłane na podany adres email',
        'debug_link' => $resetLink 
    ]);
}