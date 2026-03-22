<?php
header('Content-Type: application/json');

// Pobieramy parametry z adresu URL (np. search.php?term=disco&offset=0)
$searchTerm = $_GET['term'] ?? '';
$offset = $_GET['offset'] ?? 0;

if (empty($searchTerm)) {
    echo json_encode(['error' => 'Brak frazy wyszukiwania']);
    exit;
}

$url = "https://shazam.p.rapidapi.com/v2/search?term=" . urlencode($searchTerm) . "&locale=pl-PL&offset=" . $offset . "&limit=5";

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => [
        "X-RapidAPI-Host: shazam.p.rapidapi.com",
        "X-RapidAPI-Key: 688268f4d0msh69176cddbc5ed7bp1008d5jsn1f63b7d6afe9" // Tutaj Twój klucz jest bezpieczny
    ], // key api: ea4a4a09c7msh91f54f4cc2e9531p160042jsn3a91d4fdbb5e
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo json_encode(['error' => 'Błąd połączenia: ' . $err]);
} else {
    echo $response; // Przesyłamy surowe dane z Shazam do JS
}
