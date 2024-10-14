<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$activity_id = $data['activity_id'];
$deadline = $data['deadline'];
$estimated_time = $data['estimated_time'];
$worked_time = $data['worked_time'];

$sql = "INSERT INTO tasks (name, activity_id, deadline, estimated_time, worked_time) VALUES ('$name', '$activity_id', '$deadline', '$estimated_time', '$worked_time')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(["message" => "Task added successfully"]);
} else {
    echo json_encode(["message" => "Error: " . mysqli_error($conn)]);
}

mysqli_close($conn);  
?>
