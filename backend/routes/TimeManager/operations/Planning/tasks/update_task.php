<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$fields = [];
if (isset($data['name'])) $fields[] = "name = '{$data['name']}'";
if (isset($data['activity_id'])) $fields[] = "activity_id = '{$data['activity_id']}'";
if (isset($data['deadline'])) $fields[] = "deadline = '{$data['deadline']}'";
if (isset($data['estimated_time'])) $fields[] = "estimated_time = '{$data['estimated_time']}'";
if (isset($data['worked_time'])) $fields[] = "worked_time = '{$data['worked_time']}'";

$sql = "UPDATE tasks SET " . implode(", ", $fields) . " WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["message" => "Task updated successfully"]);
} else {
    echo json_encode(["message" => "Error: " . mysqli_error($conn)]);
}

mysqli_close($conn);
?>
