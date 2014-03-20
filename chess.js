/* Copyright 2012-2013 Uiri Noyb
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
   You may contact Uiri Noyb via electronic mail with the address uiri
   AT compucrunch dot com
*/ 

var enpassant = new Object;
enpassant.fire = "base";
var pieces = new Array;
var r = 0;
for (r=0;r<8;r++) {
    pieces[r] = new Array;
    var b = 0;
    for (b=0;b<8;b++) {
	pieces[r][b] = new Object;
	pieces[r][b].moved = false;
	if (r < 2) {
	    pieces[r][b].color = "black";
	    if (r == 1) {
		pieces[r][b].piece = "pawn";
	    } else if (b < 1 || b > 6) {
		pieces[r][b].piece = "rook";
	    } else if (b < 2 || b > 5) {
		pieces[r][b].piece = "knight";
	    } else if (b < 3 || b > 4) {
		pieces[r][b].piece = "bishop";
	    } else if (b == 3) {
		pieces[r][b].piece = "queen";
	    } else {
		pieces[r][b].piece = "king";
	    }
	} else if (r > 5) {
	    pieces[r][b].color = "white";
	    if (r == 6) {
		pieces[r][b].piece = "pawn";
	    } else if (b < 1 || b > 6) {
		pieces[r][b].piece = "rook";
	    } else if (b < 2 || b > 5) {
		pieces[r][b].piece = "knight";
	    } else if (b < 3 || b > 4) {
		pieces[r][b].piece = "bishop";
	    } else if (b == 3) {
		pieces[r][b].piece = "queen";
	    } else {
		pieces[r][b].piece = "king";
	    }
	} else {
	    pieces[r][b].color = null;
	    pieces[r][b].piece = null;
	}
    }
}

function promote() { return "queen"; }
function moveThroughRedo(localpieces) {}
function fixRedo(castling) {}

function resetBoard() {
    var i;
    for (i=0;i<stack.length;)
	undo();
    loadCanvas();
}

function makeMove(x1, y1, x2, y2, oppcolor, sym, ai) {
    var localpieces = new Array;
    var z1, z2;
    for (z1=0;z1<8;z1++) {
	localpieces[z1] = new Array;
	for (z2=0;z2<8;z2++) {
	    localpieces[z1][z2] = new Object;
	    localpieces[z1][z2].piece = pieces[z1][z2].piece;
	    localpieces[z1][z2].color = pieces[z1][z2].color;
	    localpieces[z1][z2].moved = pieces[z1][z2].moved;
	}
    }
    var oldpiece = new Object;
    oldpiece.color = pieces[x2][y2].color;
    oldpiece.piece = pieces[x2][y2].piece;
    pieces[x2][y2].color = pieces[x1][y1].color;
    pieces[x2][y2].piece = pieces[x1][y1].piece;
    pieces[x1][y1].color = null;
    pieces[x1][y1].piece = null;
    pieces[x2][y2].moved = true;
    var blackkingcoord = new Array;
    var whitekingcoord = new Array;
    var i, j;
    for (i=0;i<8;i++)
	for (j=0;j<8;j++)
	    if (pieces[i][j].piece == "king")
		if (pieces[i][j].color == "white") {
		    whitekingcoord[0] = i;
		    whitekingcoord[1] = j;
		} else {
		    blackkingcoord[0] = i;
		    blackkingcoord[1] = j;
		}
    if (pieces[x2][y2].piece == "pawn") {
	var k;
	if (oppcolor == "white") {
	    if (x2 == 0)
		if (!sym && !ai) {
		    pieces[x2][y2].piece = promote();
		} else
		    pieces[x2][y2].piece = "queen";
	    k=1;
	} else {
	    if (x2 == 7)
		if (!sym && !ai) {
		    pieces[x2][y2].piece = promote();
		} else
		    pieces[x2][y2].piece = "queen";
	    k=-1;
	}
	if (y1 in enpassant && y2 == enpassant[y1]) {
	    pieces[x2+k][y2].piece = null;
	    pieces[x2+k][y2].color = null;
	}
	enpassant = new Object;
	enpassant.fire = "base";
	if (Math.abs(x2 - x1) == 2) {
	    if (0 < y2)
		if (pieces[x2][y2-1].piece == "pawn")
		    enpassant[y2-1] = y2;
	    if (y2 < 7)
		if (pieces[x2][y2+1].piece == "pawn")
		    enpassant[y2+1] = y2;
	}
    }
    var checkvar = new Object();
    checkvar["black"] = false;
    checkvar["white"] = false;
    var checkmate = false;
    var stalemate = false;
    if (checkCheck(blackkingcoord[0], blackkingcoord[1], "white")) {
	checkvar["black"] = true;
    }
    if (checkCheck(whitekingcoord[0], whitekingcoord[1], "black")) {
	checkvar["white"] = true;
    }
    var oldking = new Object();
    oldking.color = pieces[blackkingcoord[0]][blackkingcoord[1]].color;
    oldking.piece = pieces[blackkingcoord[0]][blackkingcoord[1]].piece;
    pieces[blackkingcoord[0]][blackkingcoord[1]].color = null;
    pieces[blackkingcoord[0]][blackkingcoord[1]].piece = null;
    if (checkCheckmate(blackkingcoord[0], blackkingcoord[1], "white"))
	checkmate = true;
    if (!checkvar["black"] && checkmate)
	stalemate = true;
    pieces[blackkingcoord[0]][blackkingcoord[1]].piece = oldking.piece;
    pieces[blackkingcoord[0]][blackkingcoord[1]].color = oldking.color;
    if (!checkmate) {
	var oldking = new Object();
	oldking.color = pieces[whitekingcoord[0]][whitekingcoord[1]].color;
	oldking.piece = pieces[whitekingcoord[0]][whitekingcoord[1]].piece;
	pieces[whitekingcoord[0]][whitekingcoord[1]].color = null;
	pieces[whitekingcoord[0]][whitekingcoord[1]].piece = null;
	if (checkCheckmate(whitekingcoord[0], whitekingcoord[1], "black"))
	    checkmate = true;
	pieces[whitekingcoord[0]][whitekingcoord[1]].piece = oldking.piece;
	pieces[whitekingcoord[0]][whitekingcoord[1]].color = oldking.color;
    }
    if (!checkvar["white"] && checkmate && !stalemate)
	stalemate = true;
    if (pieces[x2][y2].piece == "king")
	if (Math.abs(y2-y1) == 2) {
	    var i;
	    if (oppcolor == "black")
		oppcolor = "white";
	    else
		oppcolor = "black";
	    if (y2 < y1) {
		for (i=y2;i<y1;i++)
		    if (checkCheck(x2, i, oppcolor))
			checkvar[oppcolor] = true;
	    } else {
		for (i=y1;i<y2;i++)
		    if (checkCheck(x2, i, oppcolor))
			checkvar[oppcolor] = true;			    
	    }
	}
    if (checkvar[oppcolor]) {
	if (!sym)
	    alert("You can't do that, that's check");
	pieces[x1][y1].color = pieces[x2][y2].color;
	pieces[x1][y1].piece = pieces[x2][y2].piece;
	pieces[x2][y2].piece = oldpiece.piece;
	pieces[x2][y2].color = oldpiece.color;
	return false;
    }
    if (!sym)
	moveThroughRedo(localpieces);
    var castling = false;
    if (pieces[x2][y2].piece == "king" && !(pieces[x1][y1].moved)) {
	if (Math.abs(y2-y1) == 2 && !checkCheck(x1,y1,oppcolor)) {
	    if (y2 - y1 == -2) {
		if (makeMove(x1, y2-2, x2, y2+1,oppcolor,sym,ai))
		    castling = true;
		else {
		    if (!sym)
			alert("You can't do that, that's check");
		    pieces[x1][y1].color = pieces[x2][y2].color;
		    pieces[x1][y1].piece = pieces[x2][y2].piece;
		    pieces[x2][y2].piece = oldpiece.piece;
		    pieces[x2][y2].color = oldpiece.color;
		    return false;
		}
	    } else if (y1 - y2 == -2) {
		if (makeMove(x1, y2+1, x2, y2-1,oppcolor,sym,ai))
		    castling = true;
		else {
		    if (!sym)
			alert("You can't do that, that's check");
		    pieces[x1][y1].color = pieces[x2][y2].color;
		    pieces[x1][y1].piece = pieces[x2][y2].piece;
		    pieces[x2][y2].piece = oldpiece.piece;
		    pieces[x2][y2].color = oldpiece.color;
		    return false;		    
		}
	    }
	}
    }
    if (!sym)
	fixRedo(castling);
    if (oppcolor == "white")
	oppcolor = "black";
    else
	oppcolor = "white";
    if (!sym) {
	checkAlerts(oppcolor, checkmate, stalemate, checkvar);
    }
    if (connected) {
	game.checkvar = checkvar;
	game.checkmate = checkmate;
	game.stalemate = stalemate;
	game.oppcolor = oppcolor;
    }
    return true;
}

function checkAlerts(oppcolor, checkmate, stalemate, checkvar) {
    if (checkmate && checkvar["white"])
	alert("Checkmate. Black wins.");
    else if (checkmate && checkvar["black"])
	alert("Checkmate. White wins.");
    else if (stalemate && cantMove(oppcolor))
	alert("Stalemate");
    else if (checkvar[oppcolor])
	alert(oppcolor[0].toUpperCase()+oppcolor.slice(1)+" is in check");
}

function cantMove(color) {
    var a,b, colorpieces;
    colorpieces = new Array();
    for (a=0;a<8;a++)
	for (b=0;b<8;b++)
	    if (pieces[a][b].color == color)
		colorpieces.push([a, b]);
    if (colorpieces.length == 1)
	return true;
    else {
	for (colorpiece in colorpieces) {
	    var c = colorpieces[colorpiece][0];
	    var d = colorpieces[colorpiece][1];
	    if (pieces[c][d].piece != "king") {
		if (pieces[c][d].piece != "pawn")
		    return false;
		if ((color == "black" && pieces[c+1][d].piece != null) ||
		    (color == "white" && pieces[c-1][d].piece != null))
		    return true;
	    }
	}	
    }
    return false;
}

function validMove(x,y,a,b,oppcolor) {
    if (b != -1) {
	if (pieces[a][b].color != null && pieces[a][b].color != oppcolor) {
	    if (pieces[x][y].color == null || pieces[x][y].color == oppcolor) {
		switch (pieces[a][b].piece) {
		case "knight":
		    var n = Math.abs(x-a);
		    var o = Math.abs(y-b);
		    if (n+o == 3 && o != 0 && n != 0) {
			return true;
		    }
		    break;
		case "queen":
		case "rook":
		    if (a == x || b == y) {
			if (a != x && b == y) {
			    if (a < x) {
				for (x--;a<x;x--) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				}
			    } else if (a > x) {
				for (x++;a>x;x++) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				}
			    }
			} else if (b != y && a == x) {
			    if (b < y) {
				for (y--;b<y;y--) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				}
			    } else if (b > y) {
				for (y++;b>y;y++) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				}
			    }
			}
			return true;
		    }
		    if (pieces[a][b].piece == "rook") {
			break;
		    }
		case "bishop":
		    if (x+y == a+b || 
			x-y == a-b) {
			if (x+y == a+b) {
			    if (x > a) {
				y++;
				for(x--;x!=a;x--) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				    y++;
				}
			    } else if (x < a) {
				y--;
				for(x++;x!=a;x++) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				    y--;
				}
			    }
			}
			if (x-y == a-b) {
			    if (x > a) {
				y--
				for(x--;x!=a;x--) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				    y--;
				}
			    } else if (x < a) {
				y++;
				for(x++;x!=a;x++) {
				    if (pieces[x][y].color != null) {
					return false;
				    }
				    y++;
				}
			    }
			}
			return true;
		    }
		    break;
		case "king":
		    var n = Math.abs(x-a);
		    var o = Math.abs(y-b);
		    if (n < 2 && o < 2) {
			return true;
		    } else {
			if (n == 0 && o == 2 && !(pieces[a][b].moved)) {
			    if ((pieces[x][y-1].piece == null && pieces[x][y+1].piece == "rook" && !(pieces[x][y+1].moved)) || (pieces[x][y-2].piece == "rook" && !(pieces[x][y-2].moved) && pieces[x][y-1].piece == null && pieces[x][y+1].piece == null)) {
				return true;
			    }
			}
		    }
		    break;
		case "pawn":
		    if ((pieces[a][b].color == "white" && a-x == 1 &&
			 ((b == y && pieces[x][y].color == null) ||
			  (Math.abs(y-b) == 1 && pieces[x][y].color == "black"))) ||
			(pieces[a][b].color == "black" && x-a == 1 &&
			 ((b == y && pieces[x][y].color == null) ||
			  (Math.abs(y-b) == 1 && pieces[x][y].color == "white"))))
			return true;
		    if ((pieces[a][b].color == "white" && a-x == 2 &&
			 b == y && pieces[a-1][b].color == null &&
			 a == 6 && pieces[a-2][b].color == null) ||
			(pieces[a][b].color == "black" && x-a == 2 &&
			 b == y && pieces[a+1][b].color == null &&
			 a == 1 && pieces[a+2][b].color == null))
			return true;
		    if (b in enpassant) {
			var acheck, k;
			if (oppcolor == "black") {
			    acheck = 3;
			    k = 1;
			} else {
			    acheck = 4;
			    k = -1;
			}
			if (a == acheck && pieces[x+k][y].piece == "pawn")
			    return true;
		    }
		    break;
		}
	    }
	}
    }
    return false;
}

function checkBlockCheck(x, y, xd, yd, oppcolor) {
    var k,l,stop,cont,kx,ky,z1,z2;
    stop = false;
    cont = false;
    localpieces = new Array();
    for (z1=0;z1<8;z1++) {
	localpieces.push(new Array());
	for (z2=0;z2<8;z2++) {
	    localpieces[z1].push(new Object());
	    localpieces[z1][z2].piece = pieces[z1][z2].piece;
	    localpieces[z1][z2].color = pieces[z1][z2].color;
	    localpieces[z1][z2].moved = pieces[z1][z2].moved;
	}
    }
    k=x;l=y;
    while(!stop) {
	k+=xd;l+=yd;
	if (-1 < k && k < 8 && -1 < l && l < 8) {
	    if (pieces[k][l].color != null) {
		if (pieces[k][l].color != oppcolor && pieces[k][l].piece == "king") {
		    kx = k; ky = l;
		}
		if ((pieces[k][l].piece == "bishop" || pieces[k][l].piece == "rook" || pieces[k][l].piece == "queen") && pieces[k][l].color == oppcolor) {
		    cont = true;
		} else {
		    stop = true;
		}
	    }
	} else {
	    stop = true;
	}
    }
    if (!cont)
	return true;
    var g,h;
    for (g=0;g<8;g++)
	for (h=0;h<8;h++)
	    if (pieces[h][g].color != null &&
		pieces[h][g].color != oppcolor && 
		pieces[h][g].piece != "king") {
		var i,j;
		i=x+xd;j=y+yd;
		while (0<i && 0<j && j<8 && i<8) {
		    if (validMove(i,j,h,g,oppcolor))
			return false;
		    if (pieces[i][j].color != null)
			break;
		    i += xd; j += yd;
		}
	    }
    return true;
}

function checkCheckmate(x, y, oppcolor) {
    var samecolor
    if (oppcolor == "white")
	samecolor = "black";
    else
	samecolor = "white";
    var xd = new Array;
    if (0 < x) {
	if (1 < x)
	    xd.push(-2);
	xd.push(-1);
    }
    xd.push(0)
    if (x < 7) {
	xd.push(1);
	if (x < 6)
	    xd.push(2);
    }
    var yd = new Array;
    if (0 < y) {
	if (1 < y)
	    yd.push(-2);
	yd.push(-1);
    }
    yd.push(0);
    if (y < 7) {
	yd.push(1);
	if (y < 6)
	    yd.push(2);
    }
    var u,v;
    for (u in xd)
	for (v in yd)
	    if (yd[v] != 0 || xd[u] != 0)
		if (Math.abs(xd[u]) + Math.abs(yd[v]) != 4 && 
		    !(Math.abs(xd[u]) + Math.abs(yd[v]) == 3 && 
		      pieces[x+xd[u]][y+yd[v]].piece != "knight") &&
		    !(Math.abs(xd[u]) + Math.abs(yd[v]) == 2 &&
		      (xd[u] == 0 || yd[v] == 0)))
		    if (pieces[x+xd[u]][y+yd[v]].color == null || pieces[x+xd[u]][y+yd[v]].color == oppcolor) {
			var isattacked = checkCheck(x+xd[u], y+yd[v], oppcolor);
			if (isattacked < 2) {
			    if (!isattacked)
				return false;
			    if (!checkBlockCheck(x,y,xd[u],yd[v],oppcolor))
				return false;
			}
			if (pieces[x+xd[u]][y+yd[v]].color == oppcolor &&
			    (((xd[u] == 0 || yd[v] == 0) &&
			      (pieces[x+xd[u]][y+yd[v]].piece == "rook" ||
			       pieces[x+xd[u]][y+yd[v]].piece == "queen")) ||
			     ((xd[u] != 0 && yd[v] != 0) &&
			      (pieces[x+xd[u]][y+yd[v]].piece == "bishops" ||
			       pieces[x+xd[u]][y+yd[v]].piece == "queen"))))
			    if (checkCheck(x+xd[u], y+yd[v], samecolor) > 1)
				return false;
		    } else {
                        return false;
                    }
    return true;
}

function checkCheck(x, y, oppcolor) {
    var retval = 0;
    var i = x;
    var j = y;
    if (0 < x) {
	if (0 < y)
	    if (pieces[x-1][y-1].piece == "king" && pieces[x-1][y-1].color == oppcolor)
		retval += 1;
	if (pieces[x-1][y].piece == "king" && pieces[x-1][y].color == oppcolor)
	    retval += 1;
	if (y < 7)
	    if (pieces[x-1][y+1].piece == "king" && pieces[x-1][y+1].color == oppcolor)
		retval += 1;
    }
    if (x < 7) {
	if (0 < y)
	    if (pieces[x+1][y-1].piece == "king" && pieces[x+1][y-1].color == oppcolor)
		retval += 1;
	if (pieces[x+1][y].piece == "king" && pieces[x+1][y].color == oppcolor)
	    retval += 1;
	if (y < 7)
	    if (pieces[x+1][y+1].piece == "king" && pieces[x+1][y+1].color == oppcolor)
		retval += 1;
    }
    if (0 < y)
	if (pieces[x][y-1].color == oppcolor && pieces[x][y-1].piece == "king")
	    retval += 1;
    if (y < 7)
	if (pieces[x][y+1].color == oppcolor && pieces[x][y+1].piece == "king")
	    retval += 1;
    knightmoves = new Array;
    knightmoves[0] = [1,2];knightmoves[1] = [-1,2];knightmoves[2] = [-1,-2];knightmoves[3] = [1,-2];
    knightmoves[4] = [2,1];knightmoves[5] = [-2,1];knightmoves[6] = [-2,-1];knightmoves[7] = [2,-1];
    for (spot in knightmoves)
	if (-1 < x+knightmoves[spot][0] && x+knightmoves[spot][0] < 8 && -1 < y+knightmoves[spot][1] && y+knightmoves[spot][1] < 8) {
	    if (pieces[x+knightmoves[spot][0]][y+knightmoves[spot][1]].color == oppcolor && pieces[x+knightmoves[spot][0]][y+knightmoves[spot][1]].piece == "knight") {
		retval += 1;
	    }
	}
    if (oppcolor == "white" && x+1 < 8) {
	if (y+1 < 8)
	    if (pieces[x+1][y+1].piece == "pawn" && pieces[x+1][y+1].color == oppcolor)
		retval += 1;
	if (-1 < y-1)
	    if (pieces[x+1][y-1].piece == "pawn" && pieces[x+1][y-1].color == oppcolor)
		retval += 1;
    }
    if (oppcolor == "black" && x > 0) {
	if (y+1 < 8)
	    if (pieces[x-1][y+1].piece == "pawn" && pieces[x-1][y+1].color == oppcolor)
		retval += 1;
	if (-1 < y-1)
	    if (pieces[x-1][y-1].piece == "pawn" && pieces[x-1][y-1].color == oppcolor)
		retval += 1;
    }
    i=x+1;
    j=y+1;
    while(-1<i && i<8 && -1<j && j<8) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "bishop" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
	i++;
	j++;
    }
    i=x+1;
    j=y-1;
    while(-1<i && i<8 && -1<j && j<8) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "bishop" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
	i++;
	j--;
    }
    i=x-1;
    j=y+1;
    while(-1<i && i<8 && -1<j && j<8) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "bishop" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
	i--;
	j++;
    }
    i=x-1;
    j=y-1;
    while(-1<i && i<8 && -1<j && j<8) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "bishop" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
	i--;
	j--;
    }
    j=y;
    for (i=x+1;-1<i && i<8;i++) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "rook" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
    }
    j=x;
    for (i=y+1;-1<i && i<8;i++) {
	if (pieces[j][i].color == oppcolor)
	    if (pieces[j][i].piece == "rook" || pieces[j][i].piece == "queen")
		retval += 1;
	if (pieces[j][i].color != null)
	    break;
    }
    j=y;
    for (i=x-1;-1<i && i<8;i--) {
	if (pieces[i][j].color == oppcolor)
	    if (pieces[i][j].piece == "rook" || pieces[i][j].piece == "queen")
		retval += 1;
	if (pieces[i][j].color != null)
	    break;
    }
    j=x;
    for (i=y-1;-1<i && i<8;i--) {
	if (pieces[j][i].color == oppcolor)
	    if (pieces[j][i].piece == "rook" || pieces[j][i].piece == "queen")
		retval += 1;
	if (pieces[j][i].color != null)
	    break;
    }
    return retval;
}

