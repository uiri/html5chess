<?php
    require_once("/home/will/chess.conf");
$conn = pg_connect("host=" . $host . " dbname=" . $dbname . " user=" . $user . " password=" . $password)
    or die("Could not connect: " . pg_last_error());

echo "Connected";

$query = "SELECT * FROM games WHERE player1ip = '" . $_SERVER['REMOTE_ADDR'] . "' OR player2ip = '" . $_SERVER['REMOTE_ADDR'] . "';";
$result = pg_query($query) or die("Query error: " . pg_last_error());

if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player1"])) {
    exit();
}

if ($_POST["player2"]) {
    if (!preg_match("/^[A-Za-z0-9 ]+$/", $_POST["player1"])) {
	exit();
    }
}

if (($_POST["white"] != "true" && $_POST["white"] != "true") || ($_POST["kingmovedwhite"] != "true" && $_POST["kingmovedwhite"] != "false") || ($_POST["kingmovedblack"] != "true" && $_POST["kingmovedblack"] != "false")) {
    exit();
}

/*if (pg_fetch_result($result)) {

//} else  */
if (!pg_fetch_result($result)) {
    echo "One";
    $query = "SELECT * FROM games WHERE player2 = NULL;";
    $result = pg_query($query) or die("Query error: " . pg_last_error());
    $resassoc = pg_fetch_assoc($result);
    if ($resassoc != NULL) {
	echo "two";
	$query = "UPDATE games SET player2 = " . $_POST["player1"] . ", player2ip = " . $_SERVER["REMOTE_ADDR"] . "WHERE player1 = " . $resassoc['player1'] . " AND player2 = NULL;";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
    } else {
	echo "three";
	$query = "INSERT INTO games (player1, white, kingmovedwhite, kingmovedblack, board, player1ip) VALUES ('" . $_POST["player1"] . "', 'true', 'false', 'false', '" . $_POST["board"] . "', '" . $_SERVER["REMOTE_ADDR"] . "');";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
	$opponent = FALSE;
	while (!$opponent) {
	    $query = "SELECT * FROM games WHERE player1 = '" . $_POST["player1"] . "' AND player1ip = '" . $_SERVER["REMOTE_ADDR"] . "';";
	    $result = pg_query($query) or die("Query error: " . pg_last_error());
	    $resassoc = pg_fetch_assoc($result);
	    if ($resassoc["player2"] != NULL) {
		$opponent = TRUE;
	    }
	    sleep(1);
	}
	echo "{ 'player1' : '" . $resassoc['player1'] . "', 'player2' : '" . $resassoc['player2'] . "' }";
    }
}

pg_close($conn);
?>
