<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php'; // Adjust the path as necessary
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Initialize variables with default values
$task_id = isset($input['task_id']) ? $input['task_id'] : '';
$startTime = isset($input['startTime']) ? $input['startTime'] : '';
$endTime = isset($input['endTime']) ? $input['endTime'] : '';
$duration = isset($input['duration']) ? $input['duration'] : '';
$day = isset($input['day']) ? $input['day'] : '';
$date = isset($input['date']) ? $input['date'] : '';

// Fetch activity and category based on task_id
$task_query = "
    SELECT t.id AS task_id, t.name AS task_name, 
           a.id AS activity_id, a.name AS activity_name, 
           c.id AS category_id, c.name AS category_name
    FROM tasks t
    LEFT JOIN activities a ON t.activity_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE t.id = ?
";

$task_stmt = $conn->prepare($task_query);
$task_stmt->bind_param("i", $task_id);
$task_stmt->execute();
$task_result = $task_stmt->get_result();
$task_row = $task_result->fetch_assoc();

$activity = $task_row['activity_name'];
$category = $task_row['category_name'];

// Prepare and execute the SQL statement to insert into timeManager
$sql = "INSERT INTO timeManager (activity, category, task_id, startTime, endTime, duration, day, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssss", $activity, $category, $task_id, $startTime, $endTime, $duration, $day, $date);

if ($stmt->execute()) {
    $id = $stmt->insert_id; // Get the last inserted ID
    echo json_encode(["success" => true, "message" => "Record added successfully", "id" => $id]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$task_stmt->close();
$stmt->close();
$conn->close();
?>
