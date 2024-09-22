<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));

$id = $data->id;
$name = $data->name;
$balance = $data->balance;

$query = "UPDATE money_accounts SET name = ?, balance = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('sdi', $name, $balance, $id);

if($stmt->execute()) {
    echo json_encode(["message" => "Account updated successfully"]);
} else {
    echo json_encode(["message" => "Failed to update account"]);
}

$stmt->close();
$conn->close();
?>
