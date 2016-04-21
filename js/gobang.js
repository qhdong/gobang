/**
 * Created by dongqh on 4/21/2016.
 */
/* jshint strict: false */

var Gobang = function (board) {
    this.canvas = board;
    this.context = board.getContext('2d');
    this.chessBoard = {
        row: 15,
        col: 15,
        margin: 15,
        width: 450,
        height: 450,
        grid: 30,
        chessmanSize: 13
    };
    this.chessman = {
        empty: 0,
        white: 1,
        black: 2
    };
    this.chessBoardModel = [];
    this.judgeModel = {
        winsModel: [],
        whiteWins: [],
        blackWins: [],
        winsCount: 0
    };
    this.player = this.chessman.black;
    this.winner = null;
    this.mode = {
        vs: 'VS',
        ai: 'AI'
    };
    this.gameMode = this.mode.ai;
};

Gobang.prototype = {
    constructor: Gobang,

    renderChessBoard: function() {
        var index = 0;
        for (; index < this.chessBoard.row; index++) {
            this.context.moveTo(this.chessBoard.margin, this.chessBoard.margin + index * this.chessBoard.grid);
            this.context.lineTo(this.chessBoard.width - this.chessBoard.margin, this.chessBoard.margin + index * this.chessBoard.grid);
            this.context.stroke();
            this.context.moveTo(this.chessBoard.margin + index * this.chessBoard.grid, this.chessBoard.margin);
            this.context.lineTo(this.chessBoard.margin + index * this.chessBoard.grid, this.chessBoard.width - this.chessBoard.margin);
            this.context.stroke();
        }
    },

    buildChessBoard: function () {
        for (var i = 0; i < this.chessBoard.row; i++) {
            this.chessBoardModel[i] = [];
            for (var j = 0; j < this.chessBoard.col; j++) {
                this.chessBoardModel[i][j] = this.chessman.empty;
            }
        }
    },

    buildJudgeModel: function () {
        var i = 0,
            j = 0,
            k = 0,
            count = 0;

        for (i = 0; i < this.chessBoard.row; i++) {
            this.judgeModel.winsModel[i] = [];
            for (j = 0; j < this.chessBoard.col; j++) {
                this.judgeModel.winsModel[i][j] = [];
            }
        }

        // row wins
        for (i = 0; i < this.chessBoard.row; i++) {
            for (j = 0; j < this.chessBoard.row - 4; j++) {
                for (k = 0; k < 5; k++) {
                    this.judgeModel.winsModel[i][j+k][count] = true;
                }
                count++;
            }
        }

        // col wins
        for (i = 0; i < this.chessBoard.row; i++) {
            for (j = 0; j < this.chessBoard.row - 4; j++) {
                for (k = 0; k < 5; k++) {
                    this.judgeModel.winsModel[j+k][i][count] = true;
                }
                count++;
            }
        }

        for (i = 0; i < this.chessBoard.row - 4; i++) {
            for (j = 0; j < this.chessBoard.row - 4; j++) {
                for (k = 0; k < 5; k++) {
                    this.judgeModel.winsModel[i+k][j+k][count] = true;
                }
                count++;
            }
        }

        for (i = 0; i < this.chessBoard.row - 4; i++) {
            for (j = this.chessBoard.row - 1; j > 3; j--) {
                for (k = 0; k < 5; k++) {
                    this.judgeModel.winsModel[i+k][j-k][count] = true;
                }
                count++;
            }
        }

        this.judgeModel.winsCount = count;

        for (i = 0; i < count; i++) {
            this.judgeModel.blackWins[i] = 0;
            this.judgeModel.whiteWins[i] = 0;
        }
    },

    drawChessman: function (x, y, chessman) {
        this.context.beginPath();
        this.context.arc(
            this.chessBoard.margin + x * this.chessBoard.grid,
            this.chessBoard.margin + y * this.chessBoard.grid,
            this.chessBoard.chessmanSize,
            0,
            2 * Math.PI
        );
        this.context.closePath();
        var gradient = this.context.createRadialGradient(
            this.chessBoard.margin + x * this.chessBoard.grid + 2,
            this.chessBoard.margin + y * this.chessBoard.grid - 2,
            this.chessBoard.chessmanSize,
            this.chessBoard.margin + x * this.chessBoard.grid + 2,
            this.chessBoard.margin + y * this.chessBoard.grid - 2,
            0
        );
        if (chessman === this.chessman.black) {
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(1, '#636766');
        } else {
            gradient.addColorStop(0, '#d1d1d1');
            gradient.addColorStop(1, '#f9f9f9');
        }
        this.context.fillStyle = gradient;
        this.context.fill();
    },

    togglePlayer: function () {
        if (this.player === this.chessman.black) {
            this.player = this.chessman.white;
            if (this.gameMode === this.mode.ai) {
                this.computerAI();
            }
        } else {
            this.player = this.chessman.black;
        }
    },

    go: function (x, y) {
        if (this.winner) {
            return;
        }

        var k = 0;
        if (this.chessBoardModel[x][y] === this.chessman.empty) {
            if (this.player === this.chessman.black) {
                this.chessBoardModel[x][y] = this.chessman.black;
                this.drawChessman(x, y, this.chessman.black);

                for (k = 0; k < this.judgeModel.winsCount; k++) {
                    if (this.judgeModel.winsModel[x][y][k]) {
                        this.judgeModel.blackWins[k]++;
                        this.judgeModel.whiteWins[k] = 6;
                    }
                }
            } else {
                this.chessBoardModel[x][y] = this.chessman.white;
                this.drawChessman(x, y, this.chessman.white);
                for (k = 0; k < this.judgeModel.winsCount; k++) {
                    if (this.judgeModel.winsModel[x][y][k]) {
                        this.judgeModel.blackWins[k] = 6;
                        this.judgeModel.whiteWins[k]++;
                    }
                }
            }

            if (!this.judge()) {
                this.togglePlayer();
            } else {
                if (this.winner === this.chessman.black) {
                    window.alert('Black wins!');
                } else {
                    window.alert('White wins!');
                }
            }
        }
    },

    computerAI: function () {
        var whiteScore = [],
            blackScore = [],
            i = 0,
            j = 0,
            k = 0,
            max = 0,
            u = 0,
            v = 0;

        for (i = 0; i < this.chessBoard.row; i++) {
            whiteScore[i] = [];
            blackScore[i] = [];
            for (j = 0; j < this.chessBoard.col; j++) {
                whiteScore[i][j] = 0;
                blackScore[i][j] = 0;
            }
        }

        for (i = 0; i < this.chessBoard.row; i++) {
            for (j = 0; j < this.chessBoard.col; j++) {
                if (this.chessBoardModel[i][j] === this.chessman.empty) {
                    for (k = 0; k < this.judgeModel.winsCount; k++) {
                        if (this.judgeModel.winsModel[i][j][k]) {
                            if (this.judgeModel.blackWins[k] === 1) {
                                blackScore[i][j] += 200;
                            } else if (this.judgeModel.blackWins[k] === 2) {
                                blackScore[i][j] += 400;
                            } else if (this.judgeModel.blackWins[k] === 3) {
                                blackScore[i][j] += 2000;
                            } else if (this.judgeModel.blackWins[k] === 4) {
                                blackScore[i][j] += 10000;
                            }

                            if (this.judgeModel.whiteWins[k] === 1) {
                                whiteScore[i][j] += 220;
                            } else if (this.judgeModel.whiteWins[k] === 2) {
                                whiteScore[i][j] += 420;
                            } else if (this.judgeModel.whiteWins[k] === 3) {
                                whiteScore[i][j] += 2100;
                            } else if (this.judgeModel.whiteWins[k] === 4) {
                                whiteScore[i][j] += 20000;
                            }
                        }
                    }
                    if (blackScore[i][j] > max) {
                        max = blackScore[i][j];
                        u = i;
                        v = j;
                    } else if (blackScore[i][j] === max) {
                        if (whiteScore[i][j] > whiteScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }

                    if (whiteScore[i][j] > max) {
                        max = whiteScore[i][j];
                        u = i;
                        v = j;
                    } else if (whiteScore[i][j] === max) {
                        if (blackScore[i][j] > blackScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                }
            }
        }

        this.go(u, v);
    },

    judge: function () {
        var k = 0,
            winsModel;
        if (this.player === this.chessman.black) {
            winsModel = this.judgeModel.blackWins;
        } else {
            winsModel = this.judgeModel.whiteWins;
        }

        for (; k < this.judgeModel.winsCount; k++) {
            if (winsModel[k] === 5) {
                this.winner = this.player;
                return true;
            }
        }

        return false;
    },

    bindEvents: function () {
        var that = this;
        this.canvas.addEventListener('click', function (ev) {
            var x = ev.offsetX,
                y = ev.offsetY,
                i = Math.floor(x / that.chessBoard.grid),
                j = Math.floor(y / that.chessBoard.grid);
            that.go(i, j);
        }, false);
    },

    init: function () {
        this.buildJudgeModel();
        this.buildChessBoard();
        this.renderChessBoard();
        this.bindEvents();
    }
};