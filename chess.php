<?php
    require_once("/home/will/chess.conf");
$conn = pg_connect("host=" . $host . " dbname=" . $dbname . " user=" . $user . " password=" . $password)
    or die("Could not connect: " . pg_last_error());

if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player1"])) {
    $player1 = pg_escape_string($_POST["player1"]);
    exit();
}

if ($_POST["player2"]) {
    if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player2"])) {
	exit();
    } else {
	$player2 = pg_escape_string($_POST["player2"]);
    }
}

$board = pg_escape_string($_POST["board"]);

if (($_POST["white"] != 1 && $_POST["white"] != 0) || ($_POST["kingmovedwhite"] != 1 && $_POST["kingmovedwhite"] != 0) || ($_POST["kingmovedblack"] != 1 && $_POST["kingmovedblack"] != 0)) {
    exit();
} else {
    if ($_POST["white"] == 1)
	$white = "true";
    else
	$white = "false";
    if ($_POST["kingmovedwhite"] == 1)
	$kmw = "true";
    else
	$kmw = "false";
    if ($_POST["kingmovedblack"] == 1)
	$kmb = "true";
    else
	$kmb = "false";
}

if ($player2) {
    $query = "SELECT * FROM games WHERE player1 = '" . $player1 . "' AND player2 = '" . $player2 . "' AND (player1ip = '" . $_SERVER["REMOTE_ADDR"] . "' OR player2ip = '" . $_SERVER["REMOTE_ADDR"] . "');";
    $result = pg_query($query) or die("Query error: " . pg_last_error());
    echo pg_fetch_row($result);
} else {
    $query = "SELECT count(id) FROM games WHERE player2 = '*waiting*';";
    $result = pg_query($query) or die("Query error: " . pg_last_error());
    if (pg_fetch_row($result)[0] == 0) {
	$query = "INSERT INTO games (player1, player2, white, kingmovedwhite, kingmovedblack, board, player1ip) VALUES ('" . $player1 . "', '*waiting*', '" . $white . "', '" . $kmw . "', '" . $kmb . "', '" . $board . "', " . $_SERVER["REMOTE_ADDR"] . "');";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
	echo "ohai\n";
	echo pg_fetch_row($result);
    } else {
	$query = "SELECT min(id) FROM games WHERE player2 = '*waiting*'";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
	$rowid = pg_fetch_row($result);
	$query = "UPDATE games SET player2 = '" . $player1 . "', player2ip = '" . $_SERVER["REMOTE_ADDR"] . "' WHERE id = " . $rowid[0] . ";";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
	echo pg_fetch_row($result);
	//$query = "SELECT * FROM games WHERE id = " . $rowid . ";";
    }
}

pg_close($conn);
?>
