<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Initialize variables
$id = isset($input['id']) ? $input['id'] : '';
$name = isset($input['name']) ? $input['name'] : '';
$activities = isset($input['activities']) && is_array($input['activities']) ? $input['activities'] : [];

if ($id && $name && !empty($activities)) {
    // Update the category name
    $sql = "UPDATE categories SET name = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $name, $id);

    if ($stmt->execute()) {
        // Delete existing activities related to this category
        $deleteQuery = "DELETE FROM activities WHERE category_id = ?";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->bind_param("i", $id);
        $deleteStmt->execute();
        $deleteStmt->close();

        // Add updated activities
        foreach ($activities as $activity) {
            $sql = "INSERT INTO activities (name, category_id) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $activity, $id);
            $stmt->execute();
            $stmt->close();
        }

        echo json_encode(["success" => true, "message" => "Category and activities updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update category"]);
    }

    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}
?>
