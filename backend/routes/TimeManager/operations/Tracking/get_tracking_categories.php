<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$query = "
    SELECT 
        c.id AS category_id, c.name AS category_name, 
        a.id AS activity_id, a.name AS activity_name, 
        t.id AS task_id, t.name AS task_name, t.deadline, t.estimated_time, t.worked_time
    FROM categories c
    LEFT JOIN activities a ON c.id = a.category_id
    LEFT JOIN tasks t ON a.id = t.activity_id
    WHERE t.deadline = CURDATE() OR t.deadline IS NULL
";

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
        
        $activityId = $row['activity_id'];
        if ($activityId && !isset($categories[$categoryId]['activities'][$activityId])) {
            $categories[$categoryId]['activities'][$activityId] = [
                'id' => $activityId,
                'name' => $row['activity_name'],
                'tasks' => []
            ];
        }

        if ($row['task_id']) {
            $categories[$categoryId]['activities'][$activityId]['tasks'][] = [
                'id' => $row['task_id'],
                'name' => $row['task_name'],
                'deadline' => $row['deadline'],
                'estimated_time' => $row['estimated_time'],
                'worked_time' => $row['worked_time']
            ];
        }
    }
}

echo json_encode(array_values($categories));
$conn->close();
?>
