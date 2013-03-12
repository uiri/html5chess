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

function threatenedTotal(samecolor,kx,ky) {
    var c,d,mod, oppcolor;
    var retval=0;
    mod=1;
    if (samecolor == "white")
	oppcolor = "black";
    else
	oppcolor = "white";
    for (c=0;c<8;c++)
	for (d=0;d<8;d++) {
	    if (pieces[c][d].color != null)
		mod = 2;
	    if (Math.abs(c-kx) == 1 || Math.abs(d-ky) == 1)
		mod = 20;
	    if (c == kx && d == ky)
		mod = 30;
	    if (checkCheck(c,d,samecolor) > checkCheck(c,d,oppcolor))
		retval += checkCheck(c,d,samecolor);
	    else if (checkCheck(c,d,samecolor) < checkCheck(c,d,oppcolor))
		retval -= checkCheck(c,d,oppcolor);
	    /*retval += checkCheck(c,d,samecolor)*mod;
	    retval -= checkCheck(c,d,oppcolor)*mod;*/
	    if (pieces[c][d].piece == "king" &&
		pieces[c][d].color != samecolor)
		if (checkCheck(c,d,samecolor))
		    if (checkCheckmate(c,d,samecolor))
			retval += 10000000000;
	}
    return retval;
}

function aiMakeMove(samecolor) {
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
    var oppcolor;
    if (samecolor == "white")
	oppcolor = "black";
    else
	oppcolor = "white";
    var c,d,e,f,u,kx,ky;
    for (c=0;c<8;c++)
	for (d=0;d<8;d++)
	    if (localpieces[c][d].color == oppcolor && 
		localpieces[c][d].piece == "king") {
		kx = c;
		ky = d;
	    }
    var baseline = threatenedTotal(samecolor,kx,ky);
    var checkmateMoves = new Array();
    var bestMoves = new Array();
    var betterMoves = new Array();
    var okMoves = new Array();
    var piecevalues = new Object();
    piecevalues.queen = 9;
    piecevalues.king = 100;
    piecevalues.pawn = 1;
    piecevalues.rook = 5;
    piecevalues.bishop = 3;
    piecevalues.knight = 3;
    function lesserValuePiece(arrayofmoves, least) {
	var retval = null;
	if (arrayofmoves)
	    for (e in arrayofmoves)
		if (e)
		    if (arrayofmoves[e][2] == arrayofmoves[0][2] &&
			arrayofmoves[e][3] == arrayofmoves[0][3])
			if ((least && piecevalues[pieces[arrayofmoves[e][0]][arrayofmoves[e][1]].piece] 
			    < piecevalues[pieces[arrayofmoves[0][0]][arrayofmoves[0][1]].piece]) || 
			    (!(least) && piecevalues[pieces[arrayofmoves[e][0]][arrayofmoves[e][1]].piece] 
			    > piecevalues[pieces[arrayofmoves[0][0]][arrayofmoves[0][1]].piece])) {
			    retval = bestMoves[e];
			    break;
			}
	return retval;
    }
    for (c=0;c<8;c++)
	for (d=0;d<8;d++)
	    if (pieces[c][d].color == samecolor)
		for (e=0;e<8;e++)
		    for (f=0;f<8;f++)
			if (validMove(e,f,c,d,oppcolor)) {
			    var backonepieces = new Array;
			    for (z1=0;z1<8;z1++) {
				backonepieces[z1] = new Array;
				for (z2=0;z2<8;z2++) {
				    backonepieces[z1][z2] = new Object;
				    backonepieces[z1][z2].piece = pieces[z1][z2].piece;
				    backonepieces[z1][z2].color = pieces[z1][z2].color;
				    backonepieces[z1][z2].moved = pieces[z1][z2].moved;
				}
			    }
			    var tknsq = checkCheck(c,d,oppcolor);
			    var tkgapc = false, itsapawn = false;
			    if (pieces[e][f].piece)
				tkgapc = true;
			    if (pieces[c][d].piece == "pawn")
				itsapawn = true;
			    if (makeMove(c,d,e,f,samecolor,true,true)) {
				var tkngsq = checkCheck(e,f,oppcolor);
				var myprotection = checkCheck(e,f,samecolor);
				var move = new Array();
				move.push(c);
				move.push(d);
				move.push(e);
				move.push(f);
				move.push(samecolor);
				move.push(threatenedTotal(samecolor,kx,ky));
				if (move[5] > 10000000000) {
				    checkmateMoves.push(move)
				    checkmateMoves.sort(function (a,b) { return b[5] - a[5];});
				}
				if (myprotection > tkngsq || (tkgapc && (myprotection == tkngsq || itsapawn))) {
				    var addmove;
				    addmove = true;
				    if (tkngsq < tknsq || (tkgapc && (tknsq == tkngsq || itsapawn))) {
					var m;
					var tosplice = new Array();
					for (m in bestMoves)
					    if (bestMoves[m][2] == move[2])
						if (bestMoves[m][3] == move[3]) {
						    var fstval = piecevalues[backonepieces[e][f].piece];
						    var scdval = piecevalues[backonepieces[bestMoves[m][0]][bestMoves[m][1]].piece];
						    if (scdval <= fstval)
							addmove = false;
						    else
							tosplice.push(m)
						}
					if (tosplice.length) {
					    tosplice.reverse();
					    for (m in tosplice)
						bestMoves = bestMoves.splice(tosplice[m],1);
					}
				    }
				    if (addmove) {
					bestMoves.push(move);
					bestMoves.sort(function(a,b) { return b[5] - a[5];});
					bestMoves = bestMoves.slice(0,5);
				    } else {
					betterMoves.push(move);
					betterMoves.sort(function(a,b) { return b[5] - a[5];});
					betterMoves = betterMoves.slice(0,5);
				    }
				} else {
				    okMoves.push(move);
				    okMoves.sort(function (a,b) { return b[5] - a[5];});
				    okMoves = okMoves.slice(0,5);
				}
			    }
			    for (z1=0;z1<8;z1++) {
				pieces[z1] = new Array;
				for (z2=0;z2<8;z2++) {
				    pieces[z1][z2] = new Object;
				    pieces[z1][z2].piece = backonepieces[z1][z2].piece;
				    pieces[z1][z2].color = backonepieces[z1][z2].color;
				    pieces[z1][z2].moved = backonepieces[z1][z2].moved;
				}
			    }
			}
    for (z1=0;z1<8;z1++) {
	pieces[z1] = new Array;
	for (z2=0;z2<8;z2++) {
	    pieces[z1][z2] = new Object;
	    pieces[z1][z2].piece = localpieces[z1][z2].piece;
	    pieces[z1][z2].color = localpieces[z1][z2].color;
	    pieces[z1][z2].moved = localpieces[z1][z2].moved;
	}
    }
    if (checkmateMoves.length)
	return checkmateMoves[0];
    var thebestmove = lesserValuePiece(bestMoves, true);
    if (thebestmove)
	return thebestmove;
    if (bestMoves.length)
	return bestMoves[0];
    thebestmove = lesserValuePiece(betterMoves, false);
    if (thebestmove)
	return thebestmove;
    if (betterMoves.length)
	return betterMoves[0];
    return okMoves[0];
}
