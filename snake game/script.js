document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 10; // 10x10 board
    const totalCells = boardSize * boardSize;
    const gameBoard = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const diceValueSpan = document.getElementById('dice-value');
    const currentUserPositionSpan = document.getElementById('user-position');
    const currentBotPositionSpan = document.getElementById('bot-position');
    const currentTurnSpan = document.getElementById('current-turn');
    const gameMessage = document.getElementById('game-message');

    let userPosition = 1;
    let botPosition = 1;
    let isUserTurn = true;
    let rolling = false; // To prevent multiple rapid clicks

    // Define Snakes and Ladders
    // Format: { startCell: endCell }
    const snakes = {
        16: 6,
        47: 26,
        49: 11,
        56: 53,
        62: 19,
        64: 60,
        87: 24,
        93: 73,
        95: 75,
        98: 78
    };


    const ladders = {
        1: 38,
        4: 14,
        9: 31,
        21: 42,
        28: 84,
        36: 44,
        51: 67,
        71: 91,
        80: 100
    };

    // Store cell elements for easy access
    const cells = [];

    // Initialize the board
    function createBoard() {
        // Clear existing board
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
        gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 50px)`;


        // Cells are numbered from 1 to 100
        // Rows alternate direction for snake and ladder numbering convention
        for (let i = boardSize - 1; i >= 0; i--) {
            let rowCells = [];
            if ((boardSize - 1 - i) % 2 === 0) { // Even rows (0, 2, 4, ...) go left to right
                for (let j = 0; j < boardSize; j++) {
                    const cellNumber = (i * boardSize) + j + 1;
                    rowCells.push(cellNumber);
                }
            } else { // Odd rows (1, 3, 5, ...) go right to left (descending)
                for (let j = boardSize - 1; j >= 0; j--) {
                    const cellNumber = (i * boardSize) + j + 1;
                    rowCells.push(cellNumber);
                }
            }

            rowCells.forEach(cellNumber => {
                const cell = 

document.createElement('div');
                cell.classList.add('cell');
                cell.id = `cell-${cellNumber}`;
                cell.textContent = cellNumber;
                gameBoard.appendChild(cell);
                cells[cellNumber] = cell; // Store reference to cell element
            });
        }
    }

    // Place players on the board
    let userPlayer, botPlayer;

    function initializePlayers() {
        if (!userPlayer) {
            userPlayer = document.createElement('div');
            userPlayer.classList.add('player', 'user');
            userPlayer.textContent = 'U';
            gameBoard.appendChild(userPlayer);
        }
        if (!botPlayer) {
            botPlayer = 

document.createElement('div');
            botPlayer.classList.add('player', 'bot');
            botPlayer.textContent = 'B';
            gameBoard.appendChild(botPlayer);
        }
        updatePlayerPositions();
    }

    // Update player's visual position
    function updatePlayerPositions() {
        const userCell = cells[userPosition];
        const botCell = cells[botPosition];

        if (userCell) {
            userPlayer.style.left = userCell.offsetLeft + (userCell.offsetWidth / 2) - (userPlayer.offsetWidth / 2) + 'px';
            userPlayer.style.top = userCell.offsetTop + (userCell.offsetHeight / 2) - (userPlayer.offsetHeight / 2) + 'px';
        }
        if (botCell) {
            botPlayer.style.left = botCell.offsetLeft + (botCell.offsetWidth / 2) - (botPlayer.offsetWidth 

/ 2) + 'px';
            botPlayer.style.top = botCell.offsetTop + (botCell
.offsetHeight / 2) - (botPlayer.offsetHeight / 2) + 'px';
        }

        currentUserPositionSpan.textContent = userPosition;
        currentBotPositionSpan.textContent = botPosition;
    }

    // Highlight snakes and ladders (visual only, actual movement handled by JS)
    function highlightSnakesAndLadders() {
        for (const start in snakes) {
            const end = snakes[start];
            cells[start].classList.add('snake-head');
            cells[end].classList.add('snake-tail');
            // For a more complex visual, you'd draw a line/curve between start and end here
            // using SVG or Canvas, but for simplicity we're just coloring the cells.
        }

        for (const start in ladders) {
            const end = ladders[start];
            cells[start].classList.add('ladder-start');
            cells[end].classList.add('ladder-end');
        }
    }

    // Roll the dice
    function rollDice() {
        return Math.floor(Math.random() * 6) + 1; // 1 to 6
    }

    // Move player
    async function movePlayer(player, currentPos, diceRoll) {
        let newPos = currentPos + diceRoll;

        // Ensure player doesn't go beyond 100
        if (newPos > totalCells) {
            newPos = currentPos; // Stay put if roll takes beyond 100
            displayMessage(`${player === userPlayer ? 'User' : 'Bot'} needs exact roll to finish!`, 

'warning');
        }

        // Simulate movement step by step (optional, but makes it look nicer)
        let tempPos = currentPos;
        while (tempPos < newPos) {
            tempPos++;
            if (player === userPlayer) {
                userPosition = tempPos;
            } else {
                botPosition = tempPos;
            }
            updatePlayerPositions();
            await new Promise(resolve => setTimeout(resolve, 150)); // Small delay for visual effect
        }

        // Check for snakes and ladders after final position
        if (snakes[newPos]) {
            displayMessage(`${player === userPlayer ? 'User' : 'Bot'} hit a snake! Slid down to $

{snakes[newPos]}`, 'error');
            newPos = snakes[newPos];
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay before final slide
        } else if (ladders[newPos]) {
            displayMessage(`${player === userPlayer ? 'User' : 'Bot'} found a ladder! Climbed up to ${ladders[newPos]}`, 'success');
            newPos = ladders[newPos];
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay before final climb
        }

        if (player === userPlayer) {
            userPosition = newPos;
        } else {
            botPosition = newPos;
        }
        updatePlayerPositions();

        return newPos;
    }


    // Check for win condition
    function checkWin(playerPos, playerName) {
        if (playerPos === totalCells) {
            displayMessage(`${playerName} wins!`, 'win');
            rollDiceBtn.disabled = true;
            return true;
        }
        return false;
    }

    // Display messages
    function displayMessage(msg, type = '') {
        gameMessage.textContent = msg;
        gameMessage.className = `game-message ${type}`;
    }

    // Main game loop / Turn management
    async function handleTurn() {
        if (rolling) return; // Prevent double roll
        rolling = true;
        rollDiceBtn.disabled = true;


        const dice = rollDice();
        diceValueSpan.textContent = dice;
        displayMessage(''); // Clear previous message

        if (isUserTurn) {
            currentTurnSpan.textContent = 'User';
            displayMessage(`User rolled a ${dice}!`);
            const newPos = await movePlayer(userPlayer, userPosition, dice);
            if (checkWin(newPos, 'User')) {
                return;
            }
        } else {
            currentTurnSpan.textContent = 'Bot';
            displayMessage(`Bot rolled a ${dice}!`);
            const newPos = await movePlayer(botPlayer, botPosition, dice);
            if (checkWin(newPos, 'Bot')) {
                return;
            }
        }

        // Switch turn
        isUserTurn = !isUserTurn;
        currentTurnSpan.textContent = isUserTurn ? 'User' : 'Bot';

        rolling = false;
        rollDiceBtn.disabled = false;

        // If it's bot's turn, automatically roll after a short delay
        if (!isUserTurn) {
            setTimeout(handleTurn, 1500); // Bot waits 1.5 seconds before rolling
        }
    }

    // Event Listener for dice roll button
    rollDiceBtn.addEventListener('click', handleTurn);

    // Initial setup
    createBoard();
    initializePlayers();
    highlightSnakesAndLadders();

    updatePlayerPositions(); // Set initial player positions
});
