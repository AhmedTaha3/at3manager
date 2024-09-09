<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Initialize variables
$name = isset($input['name']) ? $input['name'] : '';
$activities = isset($input['activities']) && is_array($input['activities']) ? $input['activities'] : [];

if ($name && !empty($activities)) {
    // Prepare and execute the SQL statement for category
    $sql = "INSERT INTO categories (name) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $name);

    if ($stmt->execute()) {
        $categoryId = $stmt->insert_id; // Get the inserted category ID
        $stmt->close();

        foreach ($activities as $activity) {
            $sql = "INSERT INTO activities (name, category_id) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $activity, $categoryId);
            $stmt->execute();
            $stmt->close();
        }

        echo json_encode(["success" => true, "message" => "Category and activities added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to add category"]);
    }

    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}
?>
