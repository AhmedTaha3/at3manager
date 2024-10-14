<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php'; // Adjust the path as necessary
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Check if the input data contains the 'id' and 'task_id'
if (isset($input['id']) && isset($input['task_id'])) {
    $id = $input['id'];
    $task_id = $input['task_id'];

    // Fetch the current values from the timeManager table
    $stmt = $conn->prepare("SELECT activity, category, startTime, endTime, duration, day, date FROM timeManager WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Error: Record not found"]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->bind_result($currentActivity, $currentCategory, $currentStartTime, $currentEndTime, $currentDuration, $currentDay, $currentDate);
    $stmt->fetch();
    $stmt->close();

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
    $task_stmt->close();

    // Use the current values if new values are not provided
    $startTime = isset($input['startTime']) ? $input['startTime'] : $currentStartTime;
    $endTime = isset($input['endTime']) ? $input['endTime'] : $currentEndTime;
    $duration = isset($input['duration']) ? $input['duration'] : $currentDuration;
    $day = isset($input['day']) ? $input['day'] : $currentDay;
    $date = isset($input['date']) ? $input['date'] : $currentDate;

    // Prepare and execute the SQL statement to update timeManager
    $stmt = $conn->prepare("UPDATE timeManager SET activity=?, category=?, task_id=?, startTime=?, endTime=?, duration=?, day=?, date=? WHERE id=?");
    $stmt->bind_param("ssisssssi", $activity, $category, $task_id, $startTime, $endTime, $duration, $day, $date, $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Record updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Error: Missing input data"]);
}

$conn->close();
?>
