<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));

$name = $data->name;
$balance = $data->balance;

$query = "INSERT INTO money_accounts (name, balance) VALUES (?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param('sd', $name, $balance);

if($stmt->execute()) {
    echo json_encode(["message" => "Account added successfully"]);
} else {
    echo json_encode(["message" => "Failed to add account"]);
}

$stmt->close();
$conn->close();
?>
