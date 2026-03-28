<?php
$servername = "127.0.0.1"; // or whatever IP HeidiSQL uses
$username = "root"; // your username from HeidiSQL session
$password = "NZuhairah_3108"; // your password (even if empty)
$database = "pbradatabases"; // your DB name

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
