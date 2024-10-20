<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Date');


// Get the date from the header, or use today's date if none provided
$date = isset($_SERVER['HTTP_X_DATE']) ? $_SERVER['HTTP_X_DATE'] : date('Y-m-d');

// Calculate Monday and Sunday of the same week
$dayOfWeek = date('N', strtotime($date));
$monday = date('Y-m-d', strtotime("-" . ($dayOfWeek - 1) . " days", strtotime($date)));
$sunday = date('Y-m-d', strtotime("+" . (7 - $dayOfWeek) . " days", strtotime($date)));

// Query the database
$sql = "SELECT * FROM timeManager WHERE date BETWEEN '$monday' AND '$sunday' ORDER BY date";
$result = $conn->query($sql);

$response = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $response[] = $row;
    }
}

echo json_encode($response);

$conn->close();
