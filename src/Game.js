import React, {Component} from 'react';
import './Game.css'
integratimport ReactGA from 'react-ga';

const trackingId = "UA-179964815-1"; 
ReactGA.initialize(trackingId);
ReactGA.set({
  userId: "sample_user_ID",
})

const CELL_SIZE = 20;
const WIDTH = 800;  
const HEIGHT = 600;

class Cell extends Component {
    render() {
        const {x, y} = this.props;
        return (
            <div className="Cell" 
                style={{
                    left: `${CELL_SIZE * x + 1}px`,
                    top: `${CELL_SIZE * y + 1}px`,
                    width: `${CELL_SIZE - 1}px`,
                    height: `${CELL_SIZE - 1}px`
                }}/>
        );
    }
}


class Game extends Component {
    constructor() {
        super();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;
        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [],
        interval: 100,
        isRunning: false,
    }

    runGame = () => {
        ReactGA.event({
            category: "Controls",
            action: "User pressed the run button.",
            label: "run",
            value: Date.now()
          });
        this.setState({isRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        ReactGA.event({
            category: "Controls",
            action: "User pressed the stop button.",
            label: "stop",
            value: Date.now()
          });
        this.setState({isRunning: false});
        if (this.timeoutHandler){
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    runIteration() {
        console.log("running iteration");
        let newBoard = this.makeEmptyBoard();

        for (let y = 0; y < this.rows; y++){
            for (let x = 0; x < this.cols; x++){
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]){
                    if (neighbors === 2 || neighbors === 3){
                        newBoard[y][x] = true;
                    }
                    else {
                        newBoard[y][x] = false;
                    }
                }
                else {
                    if (!this.board[y][x] && neighbors === 3){
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({cells: this.makeCells()});
        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval)

    }

    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++){
            const dir = dirs[i];
            let y1 = y + dir[0]
            let x1 = x + dir[1]

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }

    handleRandom = () => {
        ReactGA.event({
            category: "Controls",
            action: "User pressed the random button.",
            label: "random",
            value: Date.now()
          });

        for (let y = 0; y < this.rows; y++){
            for (let x = 0; x < this.cols; x++){
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }
        this.setState({cells: this.makeCells()});
    }

    handleClear = () => {
        ReactGA.event({
            category: "Controls",
            action: "User pressed the clear button.",
            label: "clear",
            value: Date.now()
          });

        this.board = this.makeEmptyBoard();
        this.setState({cells: this.makeCells()});
    }

    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++){
            board[y] = []
            for (let x = 0; x < this.cols; x++){
                board[y][x] = false;
            }
        }
        return board;
    }

    makeCells() {
        let cells = []
        for (let y = 0; y < this.rows; y++){
            for (let x = 0; x < this.cols; x++){
                if (this.board[y][x]){
                    cells.push({x, y});
                }
            }
        }
        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;
        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop
        };
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows){
            this.board[y][x] = !this.board[y][x];
            ReactGA.event({
                category: "Cell",
                action: "User pressed the cell (" + x + ', ' + y + ")",
                label: "(" + x + ', ' + y + ")",
                value: Date.now()
              });
        }
        console.log(this.state.cells)
        this.setState({cells: this.makeCells()});
    }

    render() {
        const {cells, interval, isRunning} = this.state;
        return (
            <div>
                <div className="Board" 
                    style={{width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}
                    onClick={this.handleClick}
                    ref={(n) => {this.boardRef = n;}}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x}, ${cell.y}`}/>
                    ))}
                </div>
                <div className="controls">
                    Update every <input value={this.state.interval} onChange={this.handleIntervalChange}/> ms
                    {isRunning ? 
                        <button className="button" onClick={this.stopGame}>Stop</button>  : 
                        <button className="button" onClick={this.runGame}>Run</button>
                    }
                    <button className="button" onClick={this.handleRandom}>Random</button>
                    <button className="button" onClick={this.handleClear}>Clear</button>
                </div>
            </div>
        );
    }
}

export default Game;