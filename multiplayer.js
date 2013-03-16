var waitingRef = new Firebase('https://chess.firebaseio.com/waitinglist');
var playingRef = new Firebase('https://chess.firebaseio.com/playinglist');
var gameRef;
var game;
var freeze = false;
var connected = false;

function nullToNegOne(mypieces) {
    for (a in mypieces)
	for (b in mypieces) {
	    if (mypieces[a][b].color == null)
		mypieces[a][b].color = -1;
	    if (mypieces[a][b].piece == null)
		mypieces[a][b].piece = -1;
	}
    return mypieces;
}

function negOneToNull(mypieces) {
    for (a in mypieces)
	for (b in mypieces) {
	    if (mypieces[a][b].color == -1)
		mypieces[a][b].color = null;
	    if (mypieces[a][b].piece == -1)
		mypieces[a][b].piece = null;
	}
    return mypieces;
}

function changeGame(snapshot) {
    var data = snapshot.val();
    if (!data) {
	alert("Something went wrong. Maybe your partner disconnected.");
	game = undefined;
	gameRef = undefined;
	freeze = false;
	connected = false;
	var i;
	for (i=0;i<stack.length;)
	    undo();
	loadCanvas();
	return;
    }
    if (freeze && stack.length != 0)
	freeze = false;
    if (data.pieces != pieces) {
	pieces = negOneToNull(data.pieces);
	stack.push(pieces);
    }
    if (data.enpassant != enpassant)
	enpassant = data.enpassant;
    checkAlerts(data.oppcolor, data.checkmate, data.stalemate, data.checkvar);
    game = data;
    loadCanvas();
}

function blackPlayerSetup(playwhite) {
    if (!playwhite) {
	document.getElementById("colour").innerHTML = "black";
	white = false;
	freeze = true;
    } else {
	white = true;
	freeze = false;
	stack.push(pieces);
    }
    document.getElementById("connectednow").style.display = "";
}

function playerTwoMove(snapshot) {
    var data = snapshot.val();
    if (data.newloc) {
	gameRef.off('value', playerTwoMove);
	gameRef.remove();
	gameRef = new Firebase(data.newloc);
	connected = true;
	gameRef.on('value', changeGame);
	blackPlayerSetup(!game.playwhite)
    }
}

function playerOneMove(snapshot) {
    var data = snapshot.val();
    if (game.players == 1)
	if (data.players == 2) {
	    game = data;
	    var playingGameRef = playingRef.push(game);
	    data.newloc = playingGameRef.toString();
	    gameRef.off('value', playerOneMove);
	    gameRef.set(data);
	    gameRef = playingGameRef;
	    connected = true;
	    gameRef.on('value', changeGame);
	    blackPlayerSetup(game.playwhite);
	}
}

function startGame(playwhite) {
    var name = document.getElementById('playername').value;
    if (!name) {
	alert("You need to give a name");
	return;
    }
    if (stack.length != 0) {
	alert("You can only start new games");
	return;
    }
    game = new Object();
    white = playwhite
    game.checkvar = new Object();
    game.checkvar["white"] = false;
    game.checkvar["black"] = false;
    game.checkmate = false;
    game.playwhite = white;
    game.pieces = nullToNegOne(pieces);
    game.enpassant = enpassant;
    game.players = 1;
    game.name = name;
    game.newloc = false;
    game.stalemate = false;
    gameRef = waitingRef.push(game);
    gameRef.on('value', playerOneMove);
}

function connectGame(refstr) {
    if (gameRef) {
	gameRef.off('value', playerOneMove);
	gameRef.remove();
    }
    gameRef = new Firebase(refstr);
    var gamereq = new XMLHttpRequest();
    gamereq.open("GET", refstr+".json");
    gamereq.onreadystatechange = function(e) {
	if (gamereq.readyState == 4) {
	    game = JSON.parse(gamereq.response);
	    game.players = 2;
	    if (game.playwhite)
		white = false;
	    gameRef.set(game);
	    gameRef.on('value', playerTwoMove);
	}
    }
    gamereq.send()
}
