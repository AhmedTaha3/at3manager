<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;

$query = "DELETE FROM money_accounts WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('i', $id);

if($stmt->execute()) {
    echo json_encode(["message" => "Account deleted successfully"]);
} else {
    echo json_encode(["message" => "Failed to delete account"]);
}

$stmt->close();
$conn->close();
?>
