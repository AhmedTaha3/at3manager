<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get the month from headers, default to current month
$month = isset($_SERVER['HTTP_MONTH']) ? $_SERVER['HTTP_MONTH'] : date('m');
$year = date('Y');

// Query to filter and group by category and account
$query = "
    SELECT 
        category, 
        account,
        SUM(value) AS total_flow,
        SUM(CASE WHEN value < 0 THEN value ELSE 0 END) AS total_expenses,
        SUM(CASE WHEN value > 0 THEN value ELSE 0 END) AS total_income
    FROM money_transactions 
    WHERE MONTH(date) = ? AND YEAR(date) = ?
    GROUP BY category, account
";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $month, $year);
$stmt->execute();

$result = $stmt->get_result();
$report = [];

while ($row = $result->fetch_assoc()) {
    $category = $row['category'];

    if (!isset($report[$category])) {
        $report[$category] = [
            'total_expenses' => 0,
            'total_income' => 0,
            'total_flow' => 0,
            'accounts' => []
        ];
    }

    $report[$category]['accounts'][] = [
        'account' => $row['account'],
        'flow' => $row['total_flow']
    ];

    $report[$category]['total_expenses'] += $row['total_expenses'];
    $report[$category]['total_income'] += $row['total_income'];
    $report[$category]['total_flow'] += $row['total_flow'];
}

echo json_encode($report);

$stmt->close();
$conn->close();
?>
