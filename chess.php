<?php
    header("Content-type: application/json");
    require_once("/home/will/chess.conf");
$conn = pg_connect("host=" . $host . " dbname=" . $dbname . " user=" . $user . " password=" . $password)
    or die("Could not connect: " . pg_last_error());

if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player1"])) {
    exit();
}

if ($_POST["player2"]) {
    if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player1"])) {
	exit();
    }
}

if (($_POST["white"] != 1 && $_POST["white"] != 0) || ($_POST["kingmovedwhite"] != 1 && $_POST["kingmovedwhite"] != 0) || ($_POST["kingmovedblack"] != 1 && $_POST["kingmovedblack"] != 0)) {
    exit();
}

$query = "IF SELECT count(*) FROM games WHERE (player1ip = '" . $_SERVER['REMOTE_ADDR'] . "' AND player1 = '" . $_POST["player1"] . "') OR (player2ip = '" . $_SERVER['REMOTE_ADDR'] . "' AND player2 = '" . $_POST["player2"] . "') = 0 THEN IF SELECT count(*) FROM games WHERE player2 = '*waiting*' = 0 THEN INSERT INTO games (player1, player2, white, kingmovedwhite, kingmovedblack, board, player1ip) VALUES ('" . $_POST["player1"] . "', '*waiting*', 'true', 'false', 'false', '" . $_POST["board"] . "', '" . $_SERVER["REMOTE_ADDR"] . "') ELSE UPDATE games SET player2 = " . $_POST["player1"] . ", player2ip = " . $_SERVER["REMOTE_ADDR"] . "WHERE id = SELECT min(id) FROM games WHERE player2 = '*waiting*' ELSE RETURN SELECT * FROM games WHERE (player1ip = '" . $_SERVER['REMOTE_ADDR'] . "' AND player1 = '" . $_POST["player1"] . "') OR (player2ip = '" . $_SERVER['REMOTE_ADDR'] . "' AND player2 = '" . $_POST["player2"] . "');";
$result = pg_query($query) or die("Query error: " . pg_last_error());

pg_close($conn);
?>
