<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Date');

// Get the date from the header, or use today's date if none provided
$date = isset($_SERVER['HTTP_X_DATE']) ? $_SERVER['HTTP_X_DATE'] : date('Y-m-d');

// Compute Monday and Sunday of the week
$startOfWeek = date('Y-m-d', strtotime('monday this week', strtotime($date)));
$endOfWeek = date('Y-m-d', strtotime('sunday this week', strtotime($date)));

// Prepare the SQL query to sum up the durations grouped by activity
$sql = "
    SELECT 
        activity,
        SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) AS total_duration
    FROM timeManager
    WHERE date BETWEEN ? AND ?
    GROUP BY activity
    ORDER BY activity ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $startOfWeek, $endOfWeek);
$stmt->execute();
$result = $stmt->get_result();

// Create an associative array of the activities with data
$activitiesData = [];
while ($row = $result->fetch_assoc()) {
    $activitiesData[$row['activity']] = $row['total_duration'];
}

// Return the result as JSON
$response = [];
foreach ($activitiesData as $activity => $total_duration) {
    $response[] = [
        'activity' => $activity,
        'total_duration' => $total_duration
    ];
}

echo json_encode([
    'start_of_week' => $startOfWeek,
    'end_of_week' => $endOfWeek,
    'activities' => $response
]);

$stmt->close();
$conn->close();
?>
