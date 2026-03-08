<?php
$url = "https://front-api.grupazprmedia.pl/media/v1/podcast_series_mobile_app/" . $_GET['uid'] . "/?site_uid=" . $_GET['site'];
echo file_get_contents($url);
?>
