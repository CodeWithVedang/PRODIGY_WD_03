const cells = document.querySelectorAll('.cell');
const turnInfo = document.getElementById('turn-info');
const gameStatus = document.getElementById('game-status');
const gameModeSelect = document.getElementById('game-mode');
const difficultySelect = document.getElementById('difficulty');
const difficultySelection = document.querySelector('.difficulty-selection');
const startGameButton = document.getElementById('start-game');
const resetGameButton = document.getElementById('reset-game');
const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const closeModalButton = document.getElementById('close-modal');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = 'two-player';
let difficulty = 'easy';

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Event Listeners
gameModeSelect.addEventListener('change', () => {
    gameMode = gameModeSelect.value;
    difficultySelection.style.display = gameMode === 'ai' ? 'block' : 'none';
});

startGameButton.addEventListener('click', startGame);
resetGameButton.addEventListener('click', resetGame);
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    resetGame();
});
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

function startGame() {
    gameMode = gameModeSelect.value;
    difficulty = difficultySelect.value;
    resetGame();
    gameActive = true;
    turnInfo.textContent = `Player X's Turn`;
    gameStatus.textContent = '';
    modal.style.display = 'none';
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    turnInfo.textContent = `Player X's Turn`;
    gameStatus.textContent = '';
    modal.style.display = 'none';
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (board[index] !== '' || !gameActive) return;

    makeMove(index, currentPlayer);

    if (checkWin(currentPlayer)) {
        showModal(`Player ${currentPlayer} Wins!`, `Congratulations! Player ${currentPlayer} has won the game!`);
        gameActive = false;
        return;
    }

    if (board.every(cell => cell !== '')) {
        showModal("It's a Draw!", "The game has ended in a draw. Try again!");
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnInfo.textContent = `Player ${currentPlayer}'s Turn`;

    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
}

function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}

function makeAIMove() {
    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else {
        move = getBestMove();
    }

    if (move !== null) {
        makeMove(move, 'O');

        if (checkWin('O')) {
            showModal('AI Wins!', 'The AI has won the game! Try again!');
            gameActive = false;
            return;
        }

        if (board.every(cell => cell !== '')) {
            showModal("It's a Draw!", "The game has ended in a draw. Try again!");
            gameActive = false;
            return;
        }

        currentPlayer = 'X';
        turnInfo.textContent = `Player X's Turn`;
    }
}

function getRandomMove() {
    const availableMoves = board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)] || null;
}

function getMediumMove() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
        if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
        if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
    }
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
        if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
        if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
    }
    return getRandomMove();
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWin('O')) return 10 - depth;
    if (checkWin('X')) return depth - 10;
    if (board.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}