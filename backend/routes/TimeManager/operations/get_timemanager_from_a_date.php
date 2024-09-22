<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Helper function to calculate the start of the week (Monday)
function getStartOfWeekDate($date) {
    $dayOfWeek = date('N', strtotime($date));
    $startOfWeek = date('Y-m-d', strtotime($date . ' -' . ($dayOfWeek - 1) . ' days'));
    return $startOfWeek;
}

// Get the date passed in the GET parameter or default to the start of the current week
$date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : getStartOfWeekDate(date('Y-m-d'));
$currentDate = date('Y-m-d');

// SQL query to get the time spent for each day from the provided date to the current date
$sql = "
    SELECT 
        DATE(startTime) as day, 
        category, 
        SUM(TIMESTAMPDIFF(SECOND, startTime, endTime) / 3600) as hours
    FROM 
        timeManager 
    WHERE 
        DATE(startTime) >= ? AND DATE(startTime) <= ?
    GROUP BY 
        day, category
    ORDER BY 
        day ASC";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $date, $currentDate);
$stmt->execute();
$result = $stmt->get_result();

// Initialize data structure
$data = [];
$totalTimeByCategoryByDay = array();

// Fill data structure with the query results
while ($row = $result->fetch_assoc()) {
    $day = $row['day'];
    $category = $row['category'];
    $hours = $row['hours'];

    if (!isset($totalTimeByCategoryByDay[$day])) {
        $totalTimeByCategoryByDay[$day] = ['TOTAL' => 0];
    }

    $totalTimeByCategoryByDay[$day][$category] = $hours;
    $totalTimeByCategoryByDay[$day]['TOTAL'] += $hours;
}

// Fill in missing days with zero totals
$start = new DateTime($date);
$end = new DateTime($currentDate);
$interval = new DateInterval('P1D');
$period = new DatePeriod($start, $interval, $end->modify('+1 day'));

foreach ($period as $day) {
    $formattedDay = $day->format('Y-m-d');
    if (!isset($totalTimeByCategoryByDay[$formattedDay])) {
        $totalTimeByCategoryByDay[$formattedDay] = ['TOTAL' => 0];
    }
}

// Sort the data by date before sending
ksort($totalTimeByCategoryByDay);

echo json_encode($totalTimeByCategoryByDay);

$stmt->close();
$conn->close();
?>