/* Copyright 2012 Uiri Noyb
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

function threatenedTotal(samecolor) {
    var c,d,mod;
    var retval=0;
    mod=1;
    for (c=0;c<8;c++)
	for (d=0;d<8;d++) {
	    if (pieces[c][d].piece == "king")
		mod = 2;
	    else
		mod = 1;
	    retval += Math.round(checkCheck(c,d,samecolor))
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
    var c,d,e,f,u;
    var baseline = threatenedTotal(samecolor);
    var bestMoves = new Array();
    var oldBestMoves = new Array();
    for (c=0;c<8;c++)
	for (d=0;d<8;d++)
	    if (pieces[c][d].color == samecolor)
		for (e=0;e<8;e++)
		    for (f=0;f<8;f++)
			if (validMove(e,f,c,d,oppcolor)) {
			    var empty = false;
			    if (pieces[e][f].color == null)
				empty = true;
			    var threatdiff = Math.round(checkCheck(e,f,samecolor)) - Math.round(checkCheck(e,f,oppcolor));
			    if (!empty)
				threatdiff++;
			    if (threatdiff >0) {
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
				if (makeMove(c,d,e,f,samecolor,true)) {
				    var move = new Array();
				    move.push(c);
				    move.push(d);
				    move.push(e);
				    move.push(f);
				    move.push(threatenedTotal(samecolor));
				    bestMoves.push(move);
				    bestMoves.sort(function(a,b) { return b[4]-a[4]; });
				    bestMoves = bestMoves.slice(0,5);
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
    return bestMoves[0];
}