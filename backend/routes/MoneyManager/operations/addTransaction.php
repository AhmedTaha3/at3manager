<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Decode the incoming JSON request
$data = json_decode(file_get_contents("php://input"));

$operation = $data->operation;
$value = $data->value;
$date = $data->date;
$category = $data->category;
$account = $data->account;

// Prepare the SQL query to insert the transaction
$query = "INSERT INTO money_transactions (operation, value, date, category, account) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);

// Bind parameters: 's' for string, 'd' for double (for float), 's' for date (as string), 's' for string, 's' for string
$stmt->bind_param('sdsss', $operation, $value, $date, $category, $account);

// Execute the query and check the result
if($stmt->execute()) {
    echo json_encode(["message" => "Transaction added successfully"]);
} else {
    echo json_encode(["message" => "Failed to add transaction"]);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>
