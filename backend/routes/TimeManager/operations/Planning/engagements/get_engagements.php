<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// SQL query to select only engagements with a date of today or after
$sql = "SELECT * FROM engagements WHERE date >= CURDATE() ORDER BY date";
$result = $conn->query($sql);

$engagements = [];
while ($row = $result->fetch_assoc()) {
    $engagements[] = $row;
}

// Return the engagements in JSON format
echo json_encode($engagements);

$conn->close();
?>
