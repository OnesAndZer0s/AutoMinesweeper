const face = document.getElementById( 'face' )!;
const mines = document.getElementById( 'mines' )!;
const timer = document.getElementById( 'timer' )!;
const board: HTMLCanvasElement = document.getElementById( 'board' )! as HTMLCanvasElement;
const ctx = board.getContext( '2d' )!;
ctx.imageSmoothingEnabled = false;

const tiles: HTMLImageElement = document.getElementById( 'tiles' )! as HTMLImageElement;

enum TileState {
  Normal,
  Revealed,
  Flagged,
  Question,
  QuestionRevealed,
  Mine,
  MineRed,
  MineX,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight
}

class Minesweeper {
  tiles: Tile[][] = [];
  width: number = 10;
  height: number = 10;
  mines: number = 10;

  #scale: number = 1;
  #offX: number = 0;
  #offY: number = 0;
  #firstClick: boolean = true;
  #ctrlDown: boolean = false;
  #lastHoverSpot: { x: number, y: number } = { x: -1, y: -1 };
  #tilesLeft: number = -1;
  #currentlyDrawing = false;

  #moved = false;

  #gameDone: boolean = false;


  constructor () {
    board.width = window.innerWidth - 36;
    board.height = window.innerHeight - 85;


    document.addEventListener( "keydown", this.onkeydown.bind( this ) );
    document.addEventListener( "keyup", this.onkeyup.bind( this ) );
    window.addEventListener( "blur", ( e ) => { this.#ctrlDown = false; } );

    window.addEventListener( "resize", this.onresize.bind( this ) );
    board.addEventListener( "wheel", this.onwheel.bind( this ) );

    document.addEventListener( "mousedown", this.onmousedown.bind( this ) );
    document.addEventListener( "mousemove", this.onmousemove.bind( this ) );
    document.addEventListener( "mouseup", this.onmouseup.bind( this ) );

    document.addEventListener( 'contextmenu', event => event.preventDefault() );
    document.addEventListener( "dragstart", event => event.preventDefault() );
  }
  newGame ( width: number, height: number, mines: number ) {
    this.#tilesLeft = width * height - mines;
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.tiles = [];
    for ( let x = 0; x < width; x++ ) {
      this.tiles.push( [] );
      for ( let y = 0; y < height; y++ ) {
        this.tiles[ x ].push( new Tile() );
      }
    }
    this.placeMines();

    this.#offX = board.width / 2 - ( this.width * 16 * this.#scale / 2 );
    this.#offY = board.height / 2 - ( this.height * 16 * this.#scale / 2 );
    var fakeWheel = new WheelEvent( "wheel", { deltaX: 0, deltaY: 0 } );
    this.onwheel( fakeWheel );
  }

  placeMines () {
    let mines = this.mines;
    while ( mines > 0 ) {
      const x = Math.floor( Math.random() * this.width );
      const y = Math.floor( Math.random() * this.height );
      if ( !this.tiles[ x ][ y ].mine ) {
        this.tiles[ x ][ y ].mine = true;
        mines--;
      }
    }
  }

  draw () {
    if ( this.#currentlyDrawing ) return;
    this.#currentlyDrawing = true;
    ctx.clearRect( 0, 0, board.width, board.height );
    for ( let x = 0; x < this.width; x++ ) {
      for ( let y = 0; y < this.height; y++ ) {
        // haha culling
        if ( x * 16 * this.#scale + this.#offX > board.width ) continue;
        if ( y * 16 * this.#scale + this.#offY > board.height ) continue;
        this.drawTile( x, y );
      }
    }
    this.#currentlyDrawing = false;
  }

  drawTile ( x: number, y: number ) {
    const tile = this.tiles[ x ][ y ];
    ctx.drawImage( tiles,
      ( tile.state % 8 ) * 17,
      49 + ( Math.floor( tile.state / 8 ) * 17 ),
      16,
      16,
      x * 16 * this.#scale + this.#offX, // pos x
      y * 16 * this.#scale + this.#offY, // pos y
      16 * this.#scale, // width
      16 * this.#scale // height
    );
  }

  onkeydown ( e: KeyboardEvent ) {
    if ( e.ctrlKey ) {
      this.#ctrlDown = true;
    }
  }

  onkeyup ( e: KeyboardEvent ) {
    if ( !e.ctrlKey ) {
      this.#ctrlDown = false;
    }
  }

  onmousedown ( e: MouseEvent ) {
    if ( this.#gameDone ) return;

    if ( e.target != face ) {
      if ( e.button === 0 ) {
        face.classList.add( 'surprise' );
      }
      else if ( e.button === 2 ) {
        this.#moved = false;
      }
    }

    this.onmousemove( e );
  }

  onmouseup ( e: MouseEvent ) {
    if ( this.#gameDone ) return;

    if ( e.button === 0 ) {
      face.classList.remove( 'surprise' );
    }

    if ( e.target === board ) {
      const x = Math.floor( ( e.clientX - board.getBoundingClientRect().left - this.#offX ) / ( 16 * this.#scale ) );
      const y = Math.floor( ( e.clientY - board.getBoundingClientRect().top - this.#offY ) / ( 16 * this.#scale ) );

      if ( x >= 0 && x < this.width && y >= 0 && y < this.height ) {
        if ( e.button === 0 ) {
          if ( this.tiles[ x ][ y ].state === 1 ) {
            if ( this.#lastHoverSpot.x != -1 && this.#lastHoverSpot.y != -1 ) {
              this.reveal( x, y );
              if ( this.#tilesLeft === 0 ) {
                this.win();
              }

              this.draw();
            }
          }
        }
        else if ( e.button === 2 ) {
          if ( this.#moved ) {
            this.#moved = false;
            return;
          }
          this.flag( x, y );
        }
      }
    }
  }

  onmousemove ( e: MouseEvent ) {
    if ( this.#gameDone ) return;

    if ( e.target === board ) {

      if ( e.buttons === 1 ) {
        const x = Math.floor( ( e.clientX - board.getBoundingClientRect().left - this.#offX ) / ( 16 * this.#scale ) );
        const y = Math.floor( ( e.clientY - board.getBoundingClientRect().top - this.#offY ) / ( 16 * this.#scale ) );
        if ( x >= 0 && x < this.width && y >= 0 && y < this.height ) {
          if ( this.#lastHoverSpot.x != -1 && this.#lastHoverSpot.y != -1 && this.tiles[ this.#lastHoverSpot.x ][ this.#lastHoverSpot.y ].revealed == false )
            this.tiles[ this.#lastHoverSpot.x ][ this.#lastHoverSpot.y ].state = 0;

          if ( this.tiles[ x ][ y ].state == TileState.Normal ) {
            this.tiles[ x ][ y ].state = TileState.Revealed;
            this.#lastHoverSpot = { x, y };
          }
          this.draw();

        } else {
          if ( this.#lastHoverSpot.x != -1 && this.#lastHoverSpot.y != -1 )
            this.tiles[ this.#lastHoverSpot.x ][ this.#lastHoverSpot.y ].state = 0;
          this.#lastHoverSpot = { x: -1, y: -1 };
          this.draw();
        }
      } else if ( e.buttons == 2 ) {
        if ( e.movementX == 0 && e.movementY == 0 ) return;
        this.#moved = true;
        this.#offX += e.movementX;
        this.#offY += e.movementY;
        this.draw();
      }
    }
  }

  onresize ( e: UIEvent ) {
    board.width = window.innerWidth - 36;
    board.height = window.innerHeight - 85;
    this.draw();
  }

  onwheel ( e: WheelEvent ) {
    if ( this.#ctrlDown ) {
      e.preventDefault();
      var oldScale = this.#scale;
      this.#scale += e.deltaY * -0.001;
      this.#scale = Math.min( Math.max( .75, this.#scale ), 4 );

      if ( this.#scale != oldScale ) {
        var mouseX = e.clientX - board.getBoundingClientRect().left;
        var mouseY = e.clientY - board.getBoundingClientRect().top;
        mouseX -= board.width / 2;
        mouseY -= board.height / 2;
        this.#offX -= mouseX * e.deltaY * -0.001;
        this.#offY -= mouseY * e.deltaY * -0.001;
      }
    }
    else {
      this.#offX -= e.deltaX * .1 * this.#scale;
      this.#offY -= e.deltaY * .1 * this.#scale;
    }

    var newOffX = board.width - this.width * 16 * this.#scale;
    if ( newOffX < 0 ) {
      this.#offX = Math.min( Math.max( this.#offX, newOffX ), 0 );
    }
    else {
      this.#offX = Math.max( Math.min( this.#offX, newOffX ), 0 );
    }
    var newOffY = board.height - this.height * 16 * this.#scale;
    if ( newOffY < 0 ) {
      this.#offY = Math.min( Math.max( this.#offY, newOffY ), 0 );
    }
    else {
      this.#offY = Math.max( Math.min( this.#offY, newOffY ), 0 );
    }
    this.draw();
  }

  reveal ( x: number, y: number ) {
    const tile = this.tiles[ x ][ y ];
    if ( tile.state == TileState.Flagged ) return;
    if ( tile.revealed == false ) {
      tile.revealed = true;
      this.#tilesLeft--;

      if ( tile.mine ) {
        tile.state = TileState.MineRed;
        this.lose();
      }
      else {
        var mCount = this.countMines( x, y );
        if ( mCount === 0 ) {
          tile.state = TileState.Revealed;
          this.revealNeighbors( x, y );
        }
        else {
          tile.state = 7 + mCount;
        }
      }
    }
  }

  revealNeighbors ( x: number, y: number ) {
    for ( let i = -1; i <= 1; i++ ) {
      for ( let j = -1; j <= 1; j++ ) {
        if ( i === 0 && j === 0 ) continue;
        const nx = x + i;
        const ny = y + j;
        if ( nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.tiles[ nx ][ ny ].revealed == false ) {
          this.reveal( nx, ny );
        }
      }
    }
  }

  flag ( x: number, y: number ) {
    const tile = this.tiles[ x ][ y ];
    if ( tile.state === TileState.Normal ) {
      tile.state = TileState.Flagged;
    }
    else if ( tile.state === TileState.Flagged ) {
      tile.state = TileState.Normal;
    }
    this.draw();
  }

  countMines ( x: number, y: number ) {
    let count = 0;
    for ( let i = -1; i <= 1; i++ ) {
      for ( let j = -1; j <= 1; j++ ) {
        if ( i === 0 && j === 0 ) continue;
        const nx = x + i;
        const ny = y + j;
        if ( nx >= 0 && nx < this.width && ny >= 0 && ny < this.height ) {
          if ( this.tiles[ nx ][ ny ].mine ) {
            count++;
          }
        }
      }
    }
    return count;
  }

  lose () {
    this.#gameDone = true;
    face.classList.add( 'lose' );

    for ( let x = 0; x < this.width; x++ ) {
      for ( let y = 0; y < this.height; y++ ) {
        const tile = this.tiles[ x ][ y ];
        if ( tile.mine && tile.state === TileState.Normal ) {
          tile.state = TileState.Mine;
        }
        else if ( tile.state === TileState.Flagged && !tile.mine ) {
          tile.state = TileState.MineX;
        }
      }
    }

    this.draw();
  }

  win () {
    this.#gameDone = true;
    face.classList.add( 'win' );

    for ( let x = 0; x < this.width; x++ ) {
      for ( let y = 0; y < this.height; y++ ) {
        const tile = this.tiles[ x ][ y ];
        if ( tile.mine && tile.state === TileState.Normal ) {
          tile.state = TileState.Flagged;
        }
      }
    }
    this.draw();
  }
}


class Tile {
  state: TileState = TileState.Normal;
  mine: boolean = false;
  revealed: boolean = false;
}



const game = new Minesweeper();
game.newGame( 100, 100, 1000 );