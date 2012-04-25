<?php
    require_once("/home/will/chess.conf");
$conn = pg_connect("host=" . $host . " dbname=" . $dbname . " user=" . $user . " password=" . $password)
    or die("Could not connect: " . pg_last_error());

$query = "SELECT * FROM games WHERE player1ip == " . $_SERVER['REMOTE_ADDR'] . " OR player2ip == " . $_SERVER['REMOTE_ADDR'];
$result = pg_query($query) or die("Query error: " . pg_last_error());

header("Contet-type:application/json");

if (pg_fetch_result($result)) {
    
} else {
    $query = "SELECT * FROM games WHERE player2 == NULL";
    $result = pg_query($query) or die("Query error: " . pg_last_error());
    if (pg_fetch_result($result)) {
	$query = "UPDATE games SET player2 = " . $_POST["player1"] . ", player2ip = " . $_SERVER["REMOTE_ADDR"] . "WHERE player1 == " . pg_fetch_assoc($result)['player1'] . " AND player2 == NULL";
	$result = pg_query($query) or die("Query error: " . pg_last_error());
    } else {
	//$query = 
    }
}

pg_close($conn);
?>
