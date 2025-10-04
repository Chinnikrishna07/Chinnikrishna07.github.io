// Get references to HTML elements by their IDs
const playerGoButton = document.getElementById('player-go'); // Button for player to choose 'Go'
const playerStopButton = document.getElementById('player-stop'); // Button for player to choose 'Stop'
const computerChoiceDisplay = document.getElementById('computer-choice').querySelector('.choice-display'); // Span to display computer's choice
const gameResultDisplay = document.getElementById('game-result'); // Paragraph to display game result message
const playerPayoffDisplay = document.getElementById('player-payoff').querySelector('.payoff-display'); // Span to display player's payoff
const computerPayoffDisplay = document.getElementById('computer-payoff').querySelector('.payoff-display'); // Span to display computer's payoff

// Define the payoff matrix for the Stoplight Game
// Structure: payoffs[PlayerChoice][ComputerChoice] = [PlayerPayoff, ComputerPayoff]
// Choices are represented as 0 for 'Go' and 1 for 'Stop'
const PAYOFFS = {
    // Player chooses 'Go' (0)
    0: {
        // Computer chooses 'Go' (0) -> Both Go (Accident)
        0: [-10, -10],
        // Computer chooses 'Stop' (1) -> Player Go, Computer Stop (Player wins)
        1: [4, -1]
    },
    // Player chooses 'Stop' (1)
    1: {
        // Computer chooses 'Go' (0) -> Player Stop, Computer Go (Computer wins)
        0: [-1, 4],
        // Computer chooses 'Stop' (1) -> Both Stop (Delay)
        1: [-3, -3]
    }
};

// Function to simulate the computer's choice
function getComputerChoice() {
    // Math.random() generates a float between 0 (inclusive) and 1 (exclusive)
    // Multiplying by 2 gives a range [0, 2)
    // Math.floor() rounds down to the nearest integer, resulting in either 0 or 1
    // 0 represents 'Go', 1 represents 'Stop'
    return Math.floor(Math.random() * 2);
}

// Function to convert numerical choice back to a string for display
function choiceToString(choice) {
    // Returns "Go" if choice is 0, otherwise returns "Stop"
    return choice === 0 ? 'Go' : 'Stop';
}

// Function to play a round of the game
function playGame(playerChoice) {
    // Get the computer's random choice
    const computerChoice = getComputerChoice();

    // Determine the payoffs based on both players' choices using the PAYOFFS matrix
    const [playerPayoff, computerPayoff] = PAYOFFS[playerChoice][computerChoice];

    // Update the UI with the computer's choice
    computerChoiceDisplay.textContent = choiceToString(computerChoice);
    // Update the UI with the player's calculated payoff
    playerPayoffDisplay.textContent = playerPayoff;
    // Update the UI with the computer's calculated payoff
    computerPayoffDisplay.textContent = computerPayoff;

    // Determine and display the game result message
    if (playerChoice === 0 && computerChoice === 0) {
        // If both choose 'Go'
        gameResultDisplay.textContent = "Both chose GO! It's an accident! (-10, -10)";
        gameResultDisplay.style.color = '#dc3545'; // Set text color to red
    } else if (playerChoice === 1 && computerChoice === 1) {
        // If both choose 'Stop'
        gameResultDisplay.textContent = "Both chose STOP! You waited for nothing. (-3, -3)";
        gameResultDisplay.style.color = '#ffc107'; // Set text color to orange
    } else if (playerChoice === 0 && computerChoice === 1) {
        // If player chooses 'Go' and computer chooses 'Stop'
        gameResultDisplay.textContent = "You chose GO, Computer chose STOP! You passed safely! (4, -1)";
        gameResultDisplay.style.color = '#28a745'; // Set text color to green
    } else { // playerChoice === 1 && computerChoice === 0
        // If player chooses 'Stop' and computer chooses 'Go'
        gameResultDisplay.textContent = "You chose STOP, Computer chose GO! Computer passed safely. (-1, 4)";
        gameResultDisplay.style.color = '#28a745'; // Set text color to green
    }
}

// Add event listeners to the player's buttons
playerGoButton.addEventListener('click', () => playGame(0)); // When 'Go' button is clicked, play game with player choice 0
playerStopButton.addEventListener('click', () => playGame(1)); // When 'Stop' button is clicked, play game with player choice 1