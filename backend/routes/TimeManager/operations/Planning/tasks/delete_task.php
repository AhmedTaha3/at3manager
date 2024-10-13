<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$sql = "DELETE FROM tasks WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["message" => "Task deleted successfully"]);
} else {
    echo json_encode(["message" => "Error: " . mysqli_error($conn)]);
}

mysqli_close($conn);
?>
