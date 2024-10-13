<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$input = json_decode(file_get_contents('php://input'), true);

$name = isset($input['name']) ? $input['name'] : '';
$start_time = isset($input['start_time']) ? $input['start_time'] : '';
$end_time = isset($input['end_time']) ? $input['end_time'] : '';
$date = isset($input['date']) ? $input['date'] : '';

$sql = "INSERT INTO engagements (name, start_time, end_time, date) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $start_time, $end_time, $date);

if ($stmt->execute()) {
    $id = $stmt->insert_id;
    echo json_encode(["success" => true, "message" => "Engagement added successfully", "id" => $id]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
