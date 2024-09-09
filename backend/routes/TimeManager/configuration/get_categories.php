<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$query = "SELECT c.id AS category_id, c.name AS category_name, a.id AS activity_id, a.name AS activity_name 
          FROM categories c LEFT JOIN activities a ON c.id = a.category_id";

$result = $conn->query($query);

$categories = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categoryId = $row['category_id'];
        if (!isset($categories[$categoryId])) {
            $categories[$categoryId] = [
                'id' => $categoryId,
                'name' => $row['category_name'],
                'activities' => []
            ];
        }
        if ($row['activity_id']) {
            $categories[$categoryId]['activities'][] = [
                'id' => $row['activity_id'],
                'name' => $row['activity_name']
            ];
        }
    }
}

echo json_encode(array_values($categories));

$conn->close();
?>
