<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Helper function to calculate the start of the week (Monday)
// function getStartOfWeekDate($date) {
//     $dayOfWeek = date('N', strtotime($date)); // 'N' returns day of the week (1 = Monday, 7 = Sunday)
//     $startOfWeek = date('Y-m-d', strtotime($date . ' -' . ($dayOfWeek - 1) . ' days'));
//     return $startOfWeek;
// }

// // Get the date passed in the GET parameter or default to the start of the current week
// if (isset($_GET['date']) && !empty($_GET['date'])) {
//     $date = $_GET['date'];
// } else {
//     $date = getStartOfWeekDate(date('Y-m-d'));
// }
// $currentDate = date('Y-m-d'); // Today's date

// SQL query to get time spent for each day and category from the provided date to the current date
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

// Initialize the result array
$totalTimeByCategoryByDay = [];

// Fill data structure with the query results
// while ($row = $result->fetch_assoc()) {
//     $day = $row['day'];
//     $category = $row['category'];
//     $hours = $row['hours'];

//     if (!isset($totalTimeByCategoryByDay[$day])) {
//         $totalTimeByCategoryByDay[$day] = ['TOTAL' => 0]; // Initialize total hours for the day
//     }

//     // Assign the hours for each category on that day
//     $totalTimeByCategoryByDay[$day][$category] = $hours;
//     $totalTimeByCategoryByDay[$day]['TOTAL'] += $hours; // Add to the total hours
// }

// Fill in missing days with zero totals
// $start = new DateTime($date);
// $end = new DateTime($currentDate);
// $interval = new DateInterval('P1D'); // 1 day interval
// $period = new DatePeriod($start, $interval, $end->modify('+1 day')); // Include current date

// foreach ($period as $day) {
//     $formattedDay = $day->format('Y-m-d');
//     // Only fill in days that are missing, without overwriting existing data
//     if (!isset($totalTimeByCategoryByDay[$formattedDay])) {
//         $totalTimeByCategoryByDay[$formattedDay] = ['TOTAL' => 0]; // No activity, so total is 0
//     }
// }

// Sort the data by date before sending (optional)
ksort($totalTimeByCategoryByDay);

// Send the final JSON response
echo json_encode($result);

$stmt->close();
$conn->close();
?>
