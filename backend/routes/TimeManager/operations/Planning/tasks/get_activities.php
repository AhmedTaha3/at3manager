<?php
header('Content-Type: application/json');
include '../../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$sql = "SELECT * FROM activities";
$result = mysqli_query($conn, $sql);

$activities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $activities[] = $row;
}

echo json_encode($activities);

mysqli_close($conn);
?>
