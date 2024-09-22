<?php
header('Content-Type: application/json');
include '../../../database/db_connection.php'; // Inclure le fichier de connexion à la base de données
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Obtenir la date passée en paramètre GET
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d'); // Utilise la date du jour si aucune date n'est fournie

// Requête SQL pour récupérer les éléments par date
$sql = "SELECT * FROM timeManager WHERE DATE(startTime) = ? ORDER BY startTime DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode([]);
}

$stmt->close();
$conn->close();
?>
