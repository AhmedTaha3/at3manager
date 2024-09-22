<?php
header('Content-Type: application/json');
include '../../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$query = "SELECT * FROM money_accounts";
$result = $conn->query($query);

$accounts = [];

while($row = $result->fetch_assoc()) {
    $accounts[] = $row;
}

echo json_encode($accounts);

$conn->close();
?>
