document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const imageInput = document.getElementById('image-input');
    const difficultySelect = document.getElementById('difficulty-select');
    const startButton = document.getElementById('start-button');
    const puzzleContainer = document.getElementById('puzzle-container');
    const piecesContainer = document.getElementById('pieces-container');
    const winMessage = document.getElementById('win-message');

    let pieces = [];
    let pieceWidth, pieceHeight;
    let rows, cols;

    // Event listener for the start button
    startButton.addEventListener('click', () => {
        const file = imageInput.files[0];
        if (!file) {
            alert('Please select an image first!');
            return;
        }

        const pieceCount = parseInt(difficultySelect.value);
        const gridSizes = { 5: { r: 1, c: 5 }, 20: { r: 4, c: 5 }, 40: { r: 5, c: 8 }, 80: { r: 8, c: 10 }, 100: { r: 10, c: 10 }};
        rows = gridSizes[pieceCount].r;
        cols = gridSizes[pieceCount].c;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                createPuzzle(img, rows, cols);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    function createPuzzle(img, r, c) {
        // Clear previous puzzle state
        puzzleContainer.innerHTML = '';
        piecesContainer.innerHTML = '';
        winMessage.classList.add('hidden'); // Ensures win message is hidden
        pieces = [];

        // Set image and piece dimensions
        const imgWidth = 500;
        const imgHeight = (img.height / img.width) * imgWidth;
        puzzleContainer.style.width = `${imgWidth}px`;
        puzzleContainer.style.height = `${imgHeight}px`;
        piecesContainer.style.height = `${imgHeight}px`;

        pieceWidth = imgWidth / c;
        pieceHeight = imgHeight / r;

        // Set up CSS Grid for puzzle board
        puzzleContainer.style.gridTemplateRows = `repeat(${r}, 1fr)`;
        puzzleContainer.style.gridTemplateColumns = `repeat(${c}, 1fr)`;

        // Create puzzle pieces and slots
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                const piece = document.createElement('div');
                const pieceId = `piece-${i}-${j}`;
                piece.id = pieceId;
                piece.classList.add('puzzle-piece');
                piece.draggable = true;
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundImage = `url(${img.src})`;
                piece.style.backgroundSize = `${imgWidth}px ${imgHeight}px`;
                piece.style.backgroundPosition = `-${j * pieceWidth}px -${i * pieceHeight}px`;
                piece.dataset.id = pieceId;
                pieces.push(piece);

                const slot = document.createElement('div');
                slot.classList.add('puzzle-slot');
                slot.dataset.id = pieceId;
                puzzleContainer.appendChild(slot);

                slot.addEventListener('dragover', (e) => e.preventDefault());
                slot.addEventListener('drop', onDrop);
            }
        }

        // Shuffle pieces and add to pieces container
        shuffleArray(pieces).forEach(piece => {
            piecesContainer.appendChild(piece);
            piece.addEventListener('dragstart', onDragStart);
        });
    }
    
    // Drag and Drop Handlers
    function onDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
        setTimeout(() => event.target.classList.add('dragging'), 0);
    }
    
    function onDrop(event) {
        event.preventDefault();
        const pieceId = event.dataTransfer.getData('text/plain');
        const draggedPiece = document.getElementById(pieceId);
        const dropZone = event.target;
        
        // Make sure draggedPiece exists before trying to access it
        if (!draggedPiece) return;

        draggedPiece.classList.remove('dragging');

        if (dropZone.classList.contains('puzzle-slot') && dropZone.dataset.id === draggedPiece.dataset.id) {
            dropZone.appendChild(draggedPiece);
            draggedPiece.draggable = false;
            checkWinCondition();
        }
    }

    function checkWinCondition() {
        if (piecesContainer.children.length === 0) {
            winMessage.classList.remove('hidden');
        }
    }
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});