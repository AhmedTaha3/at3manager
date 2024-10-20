<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Date');

// Fetch the date from headers
$date = isset($_SERVER['HTTP_X_DATE']) ? $_SERVER['HTTP_X_DATE'] : null;

if ($date) {
    $sql = "SELECT * FROM tasks WHERE deadline = ? ORDER BY deadline";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $date);
} else {
    $sql = "SELECT * FROM tasks WHERE deadline = CURDATE() ORDER BY deadline";
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();
$tasks = [];

while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

echo json_encode($tasks);
$stmt->close();
mysqli_close($conn);
?>
