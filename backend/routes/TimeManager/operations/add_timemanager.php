<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php'; // include your DB connection file
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the raw input data
$input = json_decode(file_get_contents('php://input'), true);

// Initialize variables with default values
$activity = isset($input['activity']) ? $input['activity'] : '';
$category = isset($input['category']) ? $input['category'] : '';
$startTime = isset($input['startTime']) ? $input['startTime'] : '';
$endTime = isset($input['endTime']) ? $input['endTime'] : '';
$duration = isset($input['duration']) ? $input['duration'] : '';
$day = isset($input['day']) ? $input['day'] : '';
$date = isset($input['date']) ? $input['date'] : '';

// Prepare and execute the SQL statement
$sql = "INSERT INTO timeManager (activity, category, startTime, endTime, duration, day, date) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $activity, $category, $startTime, $endTime, $duration, $day, $date);

if ($stmt->execute()) {
    $id = $stmt->insert_id; // Get the last inserted ID
    echo json_encode(["success" => true, "message" => "Record added successfully", "id" => $id]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
