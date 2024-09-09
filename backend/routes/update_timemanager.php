<?php
header('Content-Type: application/json');
include '../database/db_connection.php'; // include your DB connection file
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Check if the input data contains the 'id'
if (isset($input['id'])) {
    $id = $input['id'];

    // Fetch current values
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

    // Use the current values if new values are not provided
    $activity = isset($input['activity']) ? $input['activity'] : $currentActivity;
    $category = isset($input['category']) ? $input['category'] : $currentCategory;
    $startTime = isset($input['startTime']) ? $input['startTime'] : $currentStartTime;
    $endTime = isset($input['endTime']) ? $input['endTime'] : $currentEndTime;
    $duration = isset($input['duration']) ? $input['duration'] : $currentDuration;
    $day = isset($input['day']) ? $input['day'] : $currentDay;
    $date = isset($input['date']) ? $input['date'] : $currentDate;

    // Prepare and execute the SQL statement
    $stmt = $conn->prepare("UPDATE timeManager SET activity=?, category=?, startTime=?, endTime=?, duration=?, day=?, date=? WHERE id=?");
    $stmt->bind_param("sssssssi", $activity, $category, $startTime, $endTime, $duration, $day, $date, $id);

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
