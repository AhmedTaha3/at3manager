<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Date');

// Get the date from the header, or use today's date if none provided
$date = isset($_SERVER['HTTP_X_DATE']) ? $_SERVER['HTTP_X_DATE'] : date('Y-m-d');

// Compute the first and last day of the month
$startOfMonth = date('Y-m-01', strtotime($date));
$endOfMonth = date('Y-m-t', strtotime($date)); // 't' gives the last day of the month

// Prepare the SQL query to sum up the durations grouped by activity
$sql = "
    SELECT 
        activity, 
        SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as total_duration
    FROM timeManager
    WHERE date BETWEEN ? AND ?
    GROUP BY activity
    ORDER BY activity ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $startOfMonth, $endOfMonth);
$stmt->execute();
$result = $stmt->get_result();

// Create an associative array of the activities with data
$activityData = [];
while ($row = $result->fetch_assoc()) {
    $activityData[$row['activity']] = $row['total_duration'];
}

// Initialize the response with activities and their total durations
$response = [];
foreach ($activityData as $activity => $duration) {
    $response[] = [
        'activity' => $activity,
        'total_duration' => $duration
    ];
}

// Return the result as JSON
echo json_encode([
    'start_of_month' => $startOfMonth,
    'end_of_month' => $endOfMonth,
    'activities' => $response
]);

$stmt->close();
$conn->close();
?>
