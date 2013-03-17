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

function blinkTitle(alttitle) {
	var timeoutid;
	timeoutid = setInterval("document.title == 'Play Chess' ? document.title = '"+alttitle+"' : document.title = 'Play Chess';", 750);
	window.addEventListener('mousemove', function(e) {
	    clearInterval(timeoutid);
	    document.title = 'Play Chess';
	});
}

function endGame() {
    game = undefined;
    gameRef = undefined;
    freeze = false;
    connected = false;
    resetBoard();
    document.getElementById('connectednow').style.visibility = "hidden";
    document.getElementById('notconnected').style.visibility = "";
    waitingRef.on('child_added', addToGameList);
    waitingRef.on('child_removed', removeFromGameList);
    document.getElementById('gamelist').style.visibility = "";
}

function changeGame(snapshot) {
    var data = snapshot.val();
    if (!data) {
	if (game.checkmate)
	    alert("Game Over.")
	else
	    alert("Something went wrong. Maybe your partner disconnected.");
	endGame();
	return;
    }
    var notfrozen = true;
    if (freeze && stack.length != 0)
	freeze = false;
    else
	notfrozen = false;
    if (data.pieces != pieces) {
	pieces = negOneToNull(data.pieces);
	stack.push(pieces);
    }
    if (data.enpassant != enpassant)
	enpassant = data.enpassant;
    game = data;
    loadCanvas();
    if (notfrozen) {
	checkAlerts(data.oppcolor, data.checkmate, data.stalemate, data.checkvar);
	blinkTitle('Opponent Moved');
    }
    if (game.checkmate && game.checkvar[game.oppcolor]) {
	gameRef.off('value', changeGame);
	gameRef.remove();
	endGame();
    }
}

function playerSetup(playwhite) {
    waitingRef.off('child_added', addToGameList);
    waitingRef.off('child_removed', removeFromGameList);
    document.getElementById('gamelist').style.visibility = "hidden";
    document.getElementById('notconnected').style.visibility = "hidden";
    if (!playwhite) {
	document.getElementById("colour").innerHTML = "black";
	white = false;
	freeze = true;
    } else {
	document.getElementById("colour").innerHTML = "white";
	white = true;
	freeze = false;
	stack.push(pieces);
    }
    document.getElementById("connectednow").style.display = "";
}

function playerTwoMove(snapshot) {
    var data = snapshot.val();
    if (!data) {
	alert("Seems "+game.name+" got bored and left");
	endGame();
	return;
    }
    if (data.newloc) {
	gameRef.off('value', playerTwoMove);
	gameRef.remove();
	gameRef = new Firebase(data.newloc);
	connected = true;
	gameRef.on('value', changeGame);
	gameRef.onDisconnect().remove();
	playerSetup(!game.playwhite);
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
	    gameRef.onDisconnect().remove();
	    playerSetup(game.playwhite);
	    blinkTitle('Opponent joined');
	}
}

function startGame(playwhite) {
    var name = document.getElementById('playername').value;
    if (!name) {
	alert("You need to give a name");
	return;
    }
    if (stack.length != 0) {
	resetBoard();
    }
    game = new Object();
    white = playwhite
    game.checkvar = new Object();
    game.checkvar["white"] = false;
    game.checkvar["black"] = false;
    game.checkmate = false;
    game.playwhite = white;
    nullToNegOne(pieces);
    game.pieces = pieces;
    negOneToNull(pieces);
    game.enpassant = enpassant;
    game.players = 1;
    game.name = name;
    game.newloc = false;
    if (white)
	game.oppcolor = "black";
    else
	game.oppcolor = "white";
    game.stalemate = false;
    gameRef = waitingRef.push(game);
    gameRef.on('value', playerOneMove);
    gameRef.onDisconnect().remove();
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
	    gameRef.onDisconnect().remove();
	}
    }
    gamereq.send()
}
