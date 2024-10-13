<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? $input['id'] : '';

$fields = [];
$params = [];
$types = '';

if (isset($input['name'])) {
    $fields[] = 'name = ?';
    $params[] = $input['name'];
    $types .= 's';
}
if (isset($input['start_time'])) {
    $fields[] = 'start_time = ?';
    $params[] = $input['start_time'];
    $types .= 's';
}
if (isset($input['end_time'])) {
    $fields[] = 'end_time = ?';
    $params[] = $input['end_time'];
    $types .= 's';
}
if (isset($input['date'])) {
    $fields[] = 'date = ?';
    $params[] = $input['date'];
    $types .= 's';
}

if (empty($fields)) {
    echo json_encode(["success" => false, "message" => "No fields to update"]);
    exit;
}

$params[] = $id;
$types .= 'i';

$sql = "UPDATE engagements SET " . implode(', ', $fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Engagement updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
