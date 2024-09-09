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

if ($id) {
    // Delete related activities
    $deleteActivitiesQuery = "DELETE FROM activities WHERE category_id = ?";
    $deleteActivitiesStmt = $conn->prepare($deleteActivitiesQuery);
    $deleteActivitiesStmt->bind_param("i", $id);
    $deleteActivitiesStmt->execute();
    $deleteActivitiesStmt->close();

    // Delete the category
    $deleteCategoryQuery = "DELETE FROM categories WHERE id = ?";
    $deleteCategoryStmt = $conn->prepare($deleteCategoryQuery);
    $deleteCategoryStmt->bind_param("i", $id);

    if ($deleteCategoryStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Category and its activities deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete category"]);
    }

    $deleteCategoryStmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}
?>
