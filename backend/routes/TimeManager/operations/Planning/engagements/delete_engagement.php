<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? $input['id'] : '';

$sql = "DELETE FROM engagements WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Engagement deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
