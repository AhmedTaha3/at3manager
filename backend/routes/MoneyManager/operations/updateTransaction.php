<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;

// Create an array to hold columns that need updating
$updateFields = [];
$updateValues = [];

// Check each field to see if it was provided in the request, if so, add it to the update array
if (isset($data->operation)) {
    $updateFields[] = "operation = ?";
    $updateValues[] = $data->operation;
}
if (isset($data->value)) {
    $updateFields[] = "value = ?";
    $updateValues[] = $data->value;
}
if (isset($data->date)) {
    $updateFields[] = "date = ?";
    $updateValues[] = $data->date;
}
if (isset($data->category)) {
    $updateFields[] = "category = ?";
    $updateValues[] = $data->category;
}
if (isset($data->account)) {
    $updateFields[] = "account = ?";
    $updateValues[] = $data->account;
}

// Ensure we have fields to update
if (count($updateFields) > 0) {
    // Add the ID at the end of the values array for the WHERE clause
    $updateValues[] = $id;

    $query = "UPDATE money_transactions SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $conn->prepare($query);

    // Dynamically bind the parameters
    $stmt->bind_param(str_repeat('s', count($updateFields)) . 'i', ...$updateValues);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Transaction updated successfully"]);
    } else {
        echo json_encode(["message" => "Failed to update transaction"]);
    }
} else {
    echo json_encode(["message" => "No fields to update"]);
}

$stmt->close();
$conn->close();
?>
