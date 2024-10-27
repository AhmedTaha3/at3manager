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

// Prepare the SQL query to sum up the durations grouped by date
$sql = "
    SELECT 
        date, 
        SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as total_duration
    FROM timeManager
    WHERE date BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $startOfWeek, $endOfWeek);
$stmt->execute();
$result = $stmt->get_result();

// Create an associative array of the dates with data
$daysData = [];
while ($row = $result->fetch_assoc()) {
    $daysData[$row['date']] = $row['total_duration'];
}

// Initialize the response with all dates of the week set to 0 by default
$response = [];
$period = new DatePeriod(
    new DateTime($startOfWeek),
    new DateInterval('P1D'), // 1-day interval
    new DateTime($endOfWeek . ' +1 day') // Include the end of the week
);

foreach ($period as $date) {
    $currentDate = $date->format('Y-m-d');
    $response[] = [
        'date' => $currentDate,
        'total_duration' => isset($daysData[$currentDate]) ? $daysData[$currentDate] : '00:00:00'
    ];
}

// Return the result as JSON
echo json_encode([
    'start_of_week' => $startOfWeek,
    'end_of_week' => $endOfWeek,
    'days' => $response
]);

$stmt->close();
$conn->close();
?>
