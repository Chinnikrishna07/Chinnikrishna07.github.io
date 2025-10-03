// Game state
let uploadedImage = null;
let selectedDifficulty = 0;
let pieces = [];
let boardWidth = 600;
let boardHeight = 400;
let timerInterval = null;
let startTime = null;
let completedPieces = 0;

// DOM elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewContainer = document.getElementById('previewContainer');
const difficultySection = document.getElementById('difficultySection');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const startBtn = document.getElementById('startGame');
const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const puzzleBoard = document.getElementById('puzzleBoard');
const piecesContainer = document.getElementById('piecesContainer');
const showReferenceBtn = document.getElementById('showReference');
const resetBtn = document.getElementById('resetGame');
const referenceModal = document.getElementById('referenceModal');
const congratsModal = document.getElementById('congratsModal');
const referenceImage = document.getElementById('referenceImage');
const timerDisplay = document.getElementById('timer');
const finalTimeDisplay = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgain');
const closeModal = document.querySelector('.close');

// Image upload handler
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImage = new Image();
            uploadedImage.onload = () => {
                imagePreview.src = event.target.result;
                previewContainer.classList.remove('hidden');
                difficultySection.classList.remove('hidden');
            };
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Difficulty selection
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDifficulty = parseInt(btn.dataset.pieces);
        startBtn.classList.remove('hidden');
    });
});

// Start game
startBtn.addEventListener('click', () => {
    if (uploadedImage && selectedDifficulty > 0) {
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        initializeGame();
    }
});

// Initialize game
function initializeGame() {
    // Calculate grid dimensions
    const gridConfig = getGridDimensions(selectedDifficulty);
    const cols = gridConfig.cols;
    const rows = gridConfig.rows;
    
    // Adjust board size to maintain aspect ratio
    const imgAspect = uploadedImage.width / uploadedImage.height;
    if (imgAspect > 1.5) {
        boardWidth = 600;
        boardHeight = boardWidth / imgAspect;
    } else {
        boardHeight = 400;
        boardWidth = boardHeight * imgAspect;
    }
    
    puzzleBoard.style.width = boardWidth + 'px';
    puzzleBoard.style.height = boardHeight + 'px';
    
    const pieceWidth = boardWidth / cols;
    const pieceHeight = boardHeight / rows;
    
    // Clear previous pieces
    pieces = [];
    puzzleBoard.innerHTML = '';
    piecesContainer.innerHTML = '';
    completedPieces = 0;
    
    // Create drop zones
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.style.left = (col * pieceWidth) + 'px';
            dropZone.style.top = (row * pieceHeight) + 'px';
            dropZone.style.width = pieceWidth + 'px';
            dropZone.style.height = pieceHeight + 'px';
            dropZone.dataset.row = row;
            dropZone.dataset.col = col;
            puzzleBoard.appendChild(dropZone);
            
            dropZone.addEventListener('dragover', handleDragOver);
            dropZone.addEventListener('drop', handleDrop);
            dropZone.addEventListener('dragleave', handleDragLeave);
        }
    }
    
    // Create puzzle pieces
    const piecePositions = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            piecePositions.push({ row, col });
        }
    }
    
    // Shuffle pieces
    shuffleArray(piecePositions);
    
    piecePositions.forEach((pos, index) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.draggable = true;
        piece.dataset.correctRow = pos.row;
        piece.dataset.correctCol = pos.col;
        
        piece.style.width = pieceWidth + 'px';
        piece.style.height = pieceHeight + 'px';
        
        // Set background image with correct position
        piece.style.backgroundImage = `url(${uploadedImage.src})`;
        piece.style.backgroundSize = `${boardWidth}px ${boardHeight}px`;
        piece.style.backgroundPosition = `-${pos.col * pieceWidth}px -${pos.row * pieceHeight}px`;
        
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
        
        piecesContainer.appendChild(piece);
        pieces.push(piece);
    });
    
    // Start timer
    startTimer();
    
    // Set reference image
    referenceImage.src = uploadedImage.src;
}

// Get grid dimensions based on difficulty
function getGridDimensions(numPieces) {
    const configs = {
        5: { cols: 2, rows: 2 },  // Actually 4 pieces, close to 5
        20: { cols: 5, rows: 4 },
        40: { cols: 8, rows: 5 },
        80: { cols: 10, rows: 8 },
        100: { cols: 10, rows: 10 }
    };
    return configs[numPieces] || { cols: 5, rows: 4 };
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Drag and drop handlers
let draggedPiece = null;

function handleDragStart(e) {
    if (this.classList.contains('correct')) return;
    draggedPiece = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    this.classList.remove('drag-over');
    
    if (draggedPiece) {
        const dropRow = parseInt(this.dataset.row);
        const dropCol = parseInt(this.dataset.col);
        const correctRow = parseInt(draggedPiece.dataset.correctRow);
        const correctCol = parseInt(draggedPiece.dataset.correctCol);
        
        // Check if correct position
        if (dropRow === correctRow && dropCol === correctCol) {
            // Place piece in correct position
            draggedPiece.style.position = 'absolute';
            draggedPiece.style.left = this.style.left;
            draggedPiece.style.top = this.style.top;
            draggedPiece.classList.add('correct');
            draggedPiece.draggable = false;
            
            // Move from container to board
            puzzleBoard.appendChild(draggedPiece);
            
            completedPieces++;
            
            // Check if puzzle is complete
            if (completedPieces === pieces.length) {
                setTimeout(() => {
                    puzzleComplete();
                }, 300);
            }
        }
    }
    
    return false;
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Puzzle complete
function puzzleComplete() {
    stopTimer();
    finalTimeDisplay.textContent = timerDisplay.textContent;
    congratsModal.classList.add('active');
}

// Show reference modal
showReferenceBtn.addEventListener('click', () => {
    referenceModal.classList.add('active');
});

// Close modals
closeModal.addEventListener('click', () => {
    referenceModal.classList.remove('active');
});

referenceModal.addEventListener('click', (e) => {
    if (e.target === referenceModal) {
        referenceModal.classList.remove('active');
    }
});

congratsModal.addEventListener('click', (e) => {
    if (e.target === congratsModal) {
        congratsModal.classList.remove('active');
    }
});

// Reset game
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    congratsModal.classList.remove('active');
    resetGame();
});

function resetGame() {
    stopTimer();
    gameScreen.classList.remove('active');
    setupScreen.classList.add('active');
    
    // Reset selections
    difficultyBtns.forEach(b => b.classList.remove('selected'));
    startBtn.classList.add('hidden');
    selectedDifficulty = 0;
    
    // Clear timer
    timerDisplay.textContent = '00:00';
}