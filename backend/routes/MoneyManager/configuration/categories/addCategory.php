<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));
$name = $data->name;

$query = "INSERT INTO money_categories (name) VALUES (?)";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $name);

if($stmt->execute()) {
    echo json_encode(["message" => "Category added successfully"]);
} else {
    echo json_encode(["message" => "Failed to add category"]);
}

$stmt->close();
$conn->close();
?>
