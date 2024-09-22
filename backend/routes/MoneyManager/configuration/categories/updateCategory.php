<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));

$id = $data->id;
$name = $data->name;

$query = "UPDATE money_categories SET name = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('si', $name, $id);

if($stmt->execute()) {
    echo json_encode(["message" => "Category updated successfully"]);
} else {
    echo json_encode(["message" => "Failed to update category"]);
}

$stmt->close();
$conn->close();
?>
