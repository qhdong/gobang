/**
 * Created by dongqh on 4/21/2016.
 */
/* global Gobang */
/* jshint strict: false */


var board = document.getElementById('gobang');
var chess = new Gobang(board);
chess.init();

var $modeBtn = document.getElementById('mode');
$modeBtn.addEventListener('click', function (e) {
    var target = e.target.childNodes[0];
    if (target.nodeValue === 'AI') {
        target.nodeValue = 'VS';
        chess.gameMode = chess.mode.vs;
    } else {
        target.nodeValue = 'AI';
        chess.gameMode = chess.mode.ai;
    }
}, false);
