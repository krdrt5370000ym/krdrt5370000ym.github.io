<?php

$url = $_GET['url'];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTPHEADER => [
        "User-Agent: Mozilla/5.0",
        "Referer: https://open.fm/",
        "Origin: https://open.fm"
    ]
]);

$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

curl_close($ch);

header("Content-Type: ".$contentType);
echo $data;
