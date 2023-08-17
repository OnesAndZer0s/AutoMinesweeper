"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Minesweeper_scale, _Minesweeper_offX, _Minesweeper_offY, _Minesweeper_firstClick, _Minesweeper_ctrlDown, _Minesweeper_lastHoverSpot, _Minesweeper_tilesLeft, _Minesweeper_currentlyDrawing, _Minesweeper_moved, _Minesweeper_gameDone;
const face = document.getElementById('face');
const mines = document.getElementById('mines');
const timer = document.getElementById('timer');
const board = document.getElementById('board');
const ctx = board.getContext('2d');
ctx.imageSmoothingEnabled = false;
const tiles = document.getElementById('tiles');
var TileState;
(function (TileState) {
    TileState[TileState["Normal"] = 0] = "Normal";
    TileState[TileState["Revealed"] = 1] = "Revealed";
    TileState[TileState["Flagged"] = 2] = "Flagged";
    TileState[TileState["Question"] = 3] = "Question";
    TileState[TileState["QuestionRevealed"] = 4] = "QuestionRevealed";
    TileState[TileState["Mine"] = 5] = "Mine";
    TileState[TileState["MineRed"] = 6] = "MineRed";
    TileState[TileState["MineX"] = 7] = "MineX";
    TileState[TileState["One"] = 8] = "One";
    TileState[TileState["Two"] = 9] = "Two";
    TileState[TileState["Three"] = 10] = "Three";
    TileState[TileState["Four"] = 11] = "Four";
    TileState[TileState["Five"] = 12] = "Five";
    TileState[TileState["Six"] = 13] = "Six";
    TileState[TileState["Seven"] = 14] = "Seven";
    TileState[TileState["Eight"] = 15] = "Eight";
})(TileState || (TileState = {}));
class Minesweeper {
    constructor() {
        this.tiles = [];
        this.width = 10;
        this.height = 10;
        this.mines = 10;
        _Minesweeper_scale.set(this, 1);
        _Minesweeper_offX.set(this, 0);
        _Minesweeper_offY.set(this, 0);
        _Minesweeper_firstClick.set(this, true);
        _Minesweeper_ctrlDown.set(this, false);
        _Minesweeper_lastHoverSpot.set(this, { x: -1, y: -1 });
        _Minesweeper_tilesLeft.set(this, -1);
        _Minesweeper_currentlyDrawing.set(this, false);
        _Minesweeper_moved.set(this, false);
        _Minesweeper_gameDone.set(this, false);
        board.width = window.innerWidth - 36;
        board.height = window.innerHeight - 85;
        document.addEventListener("keydown", this.onkeydown.bind(this));
        document.addEventListener("keyup", this.onkeyup.bind(this));
        window.addEventListener("blur", (e) => { __classPrivateFieldSet(this, _Minesweeper_ctrlDown, false, "f"); });
        window.addEventListener("resize", this.onresize.bind(this));
        board.addEventListener("wheel", this.onwheel.bind(this));
        document.addEventListener("mousedown", this.onmousedown.bind(this));
        document.addEventListener("mousemove", this.onmousemove.bind(this));
        document.addEventListener("mouseup", this.onmouseup.bind(this));
        document.addEventListener('contextmenu', event => event.preventDefault());
        document.addEventListener("dragstart", event => event.preventDefault());
    }
    newGame(width, height, mines) {
        __classPrivateFieldSet(this, _Minesweeper_tilesLeft, width * height - mines, "f");
        this.width = width;
        this.height = height;
        this.mines = mines;
        this.tiles = [];
        for (let x = 0; x < width; x++) {
            this.tiles.push([]);
            for (let y = 0; y < height; y++) {
                this.tiles[x].push(new Tile());
            }
        }
        this.placeMines();
        __classPrivateFieldSet(this, _Minesweeper_offX, board.width / 2 - (this.width * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") / 2), "f");
        __classPrivateFieldSet(this, _Minesweeper_offY, board.height / 2 - (this.height * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") / 2), "f");
        var fakeWheel = new WheelEvent("wheel", { deltaX: 0, deltaY: 0 });
        this.onwheel(fakeWheel);
    }
    placeMines() {
        let mines = this.mines;
        while (mines > 0) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (!this.tiles[x][y].mine) {
                this.tiles[x][y].mine = true;
                mines--;
            }
        }
    }
    draw() {
        if (__classPrivateFieldGet(this, _Minesweeper_currentlyDrawing, "f"))
            return;
        __classPrivateFieldSet(this, _Minesweeper_currentlyDrawing, true, "f");
        ctx.clearRect(0, 0, board.width, board.height);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                // haha culling
                if (x * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") + __classPrivateFieldGet(this, _Minesweeper_offX, "f") > board.width)
                    continue;
                if (y * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") + __classPrivateFieldGet(this, _Minesweeper_offY, "f") > board.height)
                    continue;
                this.drawTile(x, y);
            }
        }
        __classPrivateFieldSet(this, _Minesweeper_currentlyDrawing, false, "f");
    }
    drawTile(x, y) {
        const tile = this.tiles[x][y];
        ctx.drawImage(tiles, (tile.state % 8) * 17, 49 + (Math.floor(tile.state / 8) * 17), 16, 16, x * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") + __classPrivateFieldGet(this, _Minesweeper_offX, "f"), // pos x
        y * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") + __classPrivateFieldGet(this, _Minesweeper_offY, "f"), // pos y
        16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f"), // width
        16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f") // height
        );
    }
    onkeydown(e) {
        if (e.ctrlKey) {
            __classPrivateFieldSet(this, _Minesweeper_ctrlDown, true, "f");
        }
    }
    onkeyup(e) {
        if (!e.ctrlKey) {
            __classPrivateFieldSet(this, _Minesweeper_ctrlDown, false, "f");
        }
    }
    onmousedown(e) {
        if (__classPrivateFieldGet(this, _Minesweeper_gameDone, "f"))
            return;
        if (e.target != face) {
            if (e.button === 0) {
                face.classList.add('surprise');
            }
            else if (e.button === 2) {
                __classPrivateFieldSet(this, _Minesweeper_moved, false, "f");
            }
        }
        this.onmousemove(e);
    }
    onmouseup(e) {
        if (__classPrivateFieldGet(this, _Minesweeper_gameDone, "f"))
            return;
        if (e.button === 0) {
            face.classList.remove('surprise');
        }
        if (e.target === board) {
            const x = Math.floor((e.clientX - board.getBoundingClientRect().left - __classPrivateFieldGet(this, _Minesweeper_offX, "f")) / (16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f")));
            const y = Math.floor((e.clientY - board.getBoundingClientRect().top - __classPrivateFieldGet(this, _Minesweeper_offY, "f")) / (16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f")));
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                if (e.button === 0) {
                    if (this.tiles[x][y].state === 1) {
                        if (__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x != -1 && __classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y != -1) {
                            this.reveal(x, y);
                            if (__classPrivateFieldGet(this, _Minesweeper_tilesLeft, "f") === 0) {
                                this.win();
                            }
                            this.draw();
                        }
                    }
                }
                else if (e.button === 2) {
                    if (__classPrivateFieldGet(this, _Minesweeper_moved, "f")) {
                        __classPrivateFieldSet(this, _Minesweeper_moved, false, "f");
                        return;
                    }
                    this.flag(x, y);
                }
            }
        }
    }
    onmousemove(e) {
        if (__classPrivateFieldGet(this, _Minesweeper_gameDone, "f"))
            return;
        if (e.target === board) {
            if (e.buttons === 1) {
                const x = Math.floor((e.clientX - board.getBoundingClientRect().left - __classPrivateFieldGet(this, _Minesweeper_offX, "f")) / (16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f")));
                const y = Math.floor((e.clientY - board.getBoundingClientRect().top - __classPrivateFieldGet(this, _Minesweeper_offY, "f")) / (16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f")));
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    if (__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x != -1 && __classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y != -1 && this.tiles[__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x][__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y].revealed == false)
                        this.tiles[__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x][__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y].state = 0;
                    if (this.tiles[x][y].state == TileState.Normal) {
                        this.tiles[x][y].state = TileState.Revealed;
                        __classPrivateFieldSet(this, _Minesweeper_lastHoverSpot, { x, y }, "f");
                    }
                    this.draw();
                }
                else {
                    if (__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x != -1 && __classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y != -1)
                        this.tiles[__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").x][__classPrivateFieldGet(this, _Minesweeper_lastHoverSpot, "f").y].state = 0;
                    __classPrivateFieldSet(this, _Minesweeper_lastHoverSpot, { x: -1, y: -1 }, "f");
                    this.draw();
                }
            }
            else if (e.buttons == 2) {
                if (e.movementX == 0 && e.movementY == 0)
                    return;
                __classPrivateFieldSet(this, _Minesweeper_moved, true, "f");
                __classPrivateFieldSet(this, _Minesweeper_offX, __classPrivateFieldGet(this, _Minesweeper_offX, "f") + e.movementX, "f");
                __classPrivateFieldSet(this, _Minesweeper_offY, __classPrivateFieldGet(this, _Minesweeper_offY, "f") + e.movementY, "f");
                this.draw();
            }
        }
    }
    onresize(e) {
        board.width = window.innerWidth - 36;
        board.height = window.innerHeight - 85;
        this.draw();
    }
    onwheel(e) {
        if (__classPrivateFieldGet(this, _Minesweeper_ctrlDown, "f")) {
            e.preventDefault();
            var oldScale = __classPrivateFieldGet(this, _Minesweeper_scale, "f");
            __classPrivateFieldSet(this, _Minesweeper_scale, __classPrivateFieldGet(this, _Minesweeper_scale, "f") + e.deltaY * -0.001, "f");
            __classPrivateFieldSet(this, _Minesweeper_scale, Math.min(Math.max(.75, __classPrivateFieldGet(this, _Minesweeper_scale, "f")), 4), "f");
            if (__classPrivateFieldGet(this, _Minesweeper_scale, "f") != oldScale) {
                var mouseX = e.clientX - board.getBoundingClientRect().left;
                var mouseY = e.clientY - board.getBoundingClientRect().top;
                mouseX -= board.width / 2;
                mouseY -= board.height / 2;
                __classPrivateFieldSet(this, _Minesweeper_offX, __classPrivateFieldGet(this, _Minesweeper_offX, "f") - mouseX * e.deltaY * -0.001, "f");
                __classPrivateFieldSet(this, _Minesweeper_offY, __classPrivateFieldGet(this, _Minesweeper_offY, "f") - mouseY * e.deltaY * -0.001, "f");
            }
        }
        else {
            __classPrivateFieldSet(this, _Minesweeper_offX, __classPrivateFieldGet(this, _Minesweeper_offX, "f") - e.deltaX * .1 * __classPrivateFieldGet(this, _Minesweeper_scale, "f"), "f");
            __classPrivateFieldSet(this, _Minesweeper_offY, __classPrivateFieldGet(this, _Minesweeper_offY, "f") - e.deltaY * .1 * __classPrivateFieldGet(this, _Minesweeper_scale, "f"), "f");
        }
        var newOffX = board.width - this.width * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f");
        if (newOffX < 0) {
            __classPrivateFieldSet(this, _Minesweeper_offX, Math.min(Math.max(__classPrivateFieldGet(this, _Minesweeper_offX, "f"), newOffX), 0), "f");
        }
        else {
            __classPrivateFieldSet(this, _Minesweeper_offX, Math.max(Math.min(__classPrivateFieldGet(this, _Minesweeper_offX, "f"), newOffX), 0), "f");
        }
        var newOffY = board.height - this.height * 16 * __classPrivateFieldGet(this, _Minesweeper_scale, "f");
        if (newOffY < 0) {
            __classPrivateFieldSet(this, _Minesweeper_offY, Math.min(Math.max(__classPrivateFieldGet(this, _Minesweeper_offY, "f"), newOffY), 0), "f");
        }
        else {
            __classPrivateFieldSet(this, _Minesweeper_offY, Math.max(Math.min(__classPrivateFieldGet(this, _Minesweeper_offY, "f"), newOffY), 0), "f");
        }
        this.draw();
    }
    reveal(x, y) {
        var _a;
        const tile = this.tiles[x][y];
        if (tile.state == TileState.Flagged)
            return;
        if (tile.revealed == false) {
            tile.revealed = true;
            __classPrivateFieldSet(this, _Minesweeper_tilesLeft, (_a = __classPrivateFieldGet(this, _Minesweeper_tilesLeft, "f"), _a--, _a), "f");
            if (tile.mine) {
                tile.state = TileState.MineRed;
                this.lose();
            }
            else {
                var mCount = this.countMines(x, y);
                if (mCount === 0) {
                    tile.state = TileState.Revealed;
                    this.revealNeighbors(x, y);
                }
                else {
                    tile.state = 7 + mCount;
                }
            }
        }
    }
    revealNeighbors(x, y) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0)
                    continue;
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.tiles[nx][ny].revealed == false) {
                    this.reveal(nx, ny);
                }
            }
        }
    }
    flag(x, y) {
        const tile = this.tiles[x][y];
        if (tile.state === TileState.Normal) {
            tile.state = TileState.Flagged;
        }
        else if (tile.state === TileState.Flagged) {
            tile.state = TileState.Normal;
        }
        this.draw();
    }
    countMines(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0)
                    continue;
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    if (this.tiles[nx][ny].mine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    lose() {
        __classPrivateFieldSet(this, _Minesweeper_gameDone, true, "f");
        face.classList.add('lose');
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tile = this.tiles[x][y];
                if (tile.mine && tile.state === TileState.Normal) {
                    tile.state = TileState.Mine;
                }
                else if (tile.state === TileState.Flagged && !tile.mine) {
                    tile.state = TileState.MineX;
                }
            }
        }
        this.draw();
    }
    win() {
        __classPrivateFieldSet(this, _Minesweeper_gameDone, true, "f");
        face.classList.add('win');
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const tile = this.tiles[x][y];
                if (tile.mine && tile.state === TileState.Normal) {
                    tile.state = TileState.Flagged;
                }
            }
        }
        this.draw();
    }
}
_Minesweeper_scale = new WeakMap(), _Minesweeper_offX = new WeakMap(), _Minesweeper_offY = new WeakMap(), _Minesweeper_firstClick = new WeakMap(), _Minesweeper_ctrlDown = new WeakMap(), _Minesweeper_lastHoverSpot = new WeakMap(), _Minesweeper_tilesLeft = new WeakMap(), _Minesweeper_currentlyDrawing = new WeakMap(), _Minesweeper_moved = new WeakMap(), _Minesweeper_gameDone = new WeakMap();
class Tile {
    constructor() {
        this.state = TileState.Normal;
        this.mine = false;
        this.revealed = false;
    }
}
const game = new Minesweeper();
game.newGame(100, 100, 1000);
