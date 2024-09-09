<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php'; // include your DB connection file
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Check if the input data is valid
if (isset($input['id'])) {
    $id = $input['id'];

    // Prepare and execute the SQL statement
    $stmt = $conn->prepare("DELETE FROM timeManager WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Record deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Error: Missing input data"]);
}

$conn->close();
?>
