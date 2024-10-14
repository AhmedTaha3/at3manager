<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$sql = "SELECT * FROM tasks WHERE deadline = CURDATE() ORDER BY deadline";
$result = mysqli_query($conn, $sql);

$tasks = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}

echo json_encode($tasks);

mysqli_close($conn);
?>
