<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the month from headers, default to current month
$month = isset($_SERVER['HTTP_MONTH']) ? $_SERVER['HTTP_MONTH'] : date('m');
$year = date('Y');

// Query to filter transactions by the specified month
$query = "SELECT * FROM money_transactions WHERE MONTH(date) = ? AND YEAR(date) = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $month, $year);
$stmt->execute();

$result = $stmt->get_result();
$transactions = [];

while ($row = $result->fetch_assoc()) {
    $transactions[] = $row;
}

echo json_encode($transactions);

$stmt->close();
$conn->close();
?>
