const albums = [
    // Add your album IDs here
    "2lIZef4lzdvZkiiCzvPKj7",
	"2qK5koEmC0NIKohGdGeqX6",
    // ...more albums
];

function getDailyAlbum() {
    const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const startDate = "2024-01-01"; // Define a start date in YYYY-MM-DD format
    const daysSinceStart = Math.floor((new Date(today) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const albumIndex = daysSinceStart % albums.length; // Cycle through the album list
    return albums[albumIndex];
}

function setSpotifyEmbed() {
    const spotifyEmbedDiv = document.getElementById('spotify-embed');
    const albumID = getDailyAlbum();
    const embedURL = `https://open.spotify.com/embed/album/${albumID}`;
    spotifyEmbedDiv.innerHTML = `<iframe src="${embedURL}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;

    localStorage.setItem('currentAlbum', albumID);
}

const gridSize = 50;
const bubblePositions = new Set();

function getGridPosition(x, y, width, height) {
    const cellX = Math.floor(x / gridSize);
    const cellY = Math.floor(y / gridSize);
    const cellWidth = Math.ceil(width / gridSize);
    const cellHeight = Math.ceil(height / gridSize);

    const occupiedCells = [];
    for (let i = 0; i < cellWidth; i++) {
        for (let j = 0; j < cellHeight; j++) {
            occupiedCells.push(`${cellX + i}-${cellY + j}`);
        }
    }
    return occupiedCells;
}

function isPositionAvailable(left, top, width, height) {
    const cells = getGridPosition(left, top, width, height);
    return cells.every(cell => !bubblePositions.has(cell));
}

function markPositionOccupied(left, top, width, height) {
    const cells = getGridPosition(left, top, width, height);
    cells.forEach(cell => bubblePositions.add(cell));
}

function getBubblePosition(bubbleWidth, bubbleHeight) {
    let left, top;
    let positionAvailable = false;
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
        left = Math.random() * (window.innerWidth - bubbleWidth);
        top = Math.random() * (window.innerHeight - bubbleHeight);

        if (isPositionAvailable(left, top, bubbleWidth, bubbleHeight)) {
            positionAvailable = true;
            break;
        }
    }

    if (!positionAvailable) {
        left = 0;
        top = 0;
    }

    return { left, top };
}

function createBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    const bubbleArea = document.getElementById('bubble-area');
    bubbleArea.appendChild(bubble);

    const bubbleWidth = bubble.clientWidth;
    const bubbleHeight = bubble.clientHeight;

    const { left, top } = getBubblePosition(bubbleWidth, bubbleHeight);

    bubble.style.left = `${left}px`;
    bubble.style.bottom = `${-bubbleHeight}px`;

    markPositionOccupied(left, top, bubbleWidth, bubbleHeight);

    bubble.style.transition = 'transform 10s linear';
    bubble.style.transform = 'translateY(calc(-100vh - 125px))';

    setTimeout(() => {
        bubble.remove();
        const cells = getGridPosition(left, top, bubbleWidth, bubbleHeight);
        cells.forEach(cell => bubblePositions.delete(cell));
    }, 10000);
}

document.getElementById('submit-review').addEventListener('click', () => {
    const reviewInput = document.getElementById('review-input');
    const reviewText = reviewInput.value.trim();

    if (reviewText.length > 0 && reviewText.length <= 100) {
        createBubble(reviewText);
        reviewInput.value = '';
        document.getElementById('submit-review').disabled = true;
    } else {
        alert('Review must be between 1 and 100 characters.');
    }
});

document.getElementById('review-input').addEventListener('input', () => {
    const reviewInput = document.getElementById('review-input');
    const submitButton = document.getElementById('submit-review');

    submitButton.disabled = reviewInput.value.trim().length === 0;
});

document.getElementById('review-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('submit-review').click();
    }
});

// Set an initial album
setSpotifyEmbed();