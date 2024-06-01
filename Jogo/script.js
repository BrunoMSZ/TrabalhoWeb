let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;
let deckId = '';
let gameInProgress = false;

const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerScoreSpan = document.getElementById('player-score');
const dealerScoreSpan = document.getElementById('dealer-score');
const messageDiv = document.getElementById('message');
const btnHit = document.getElementById('btn-hit');
const btnStand = document.getElementById('btn-stand');

document.getElementById('btn-start').addEventListener('click', startGame);
btnHit.addEventListener('click', hit);
btnStand.addEventListener('click', stand);

async function startGame() {
    messageDiv.textContent = '';
    playerCards = [];
    dealerCards = [];
    playerScore = 0;
    dealerScore = 0;
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';
    playerScoreSpan.textContent = 0;
    dealerScoreSpan.textContent = 0;

    const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await response.json();
    deckId = data.deck_id;

    await drawInitialCards();

    gameInProgress = true;
    toggleButtonState(true);
}

async function drawInitialCards() {
    await drawCard(playerCards);
    await drawCard(dealerCards);
    await drawCard(playerCards);
    await drawCard(dealerCards);

    updateScores();
    renderCards();
}

async function drawCard(hand) {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await response.json();
    hand.push(data.cards[0]);
}

function updateScores() {
    playerScore = calculateScore(playerCards);
    dealerScore = calculateScore(dealerCards);
    playerScoreSpan.textContent = playerScore;
    dealerScoreSpan.textContent = dealerScore;
}

function calculateScore(cards) {
    let score = 0;
    let aceCount = 0;
    for (let card of cards) {
        if (card.value === 'JACK' || card.value === 'QUEEN' || card.value === 'KING') {
            score += 10;
        } else if (card.value === 'ACE') {
            score += 11;
            aceCount++;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function renderCards() {
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';

    for (let card of playerCards) {
        playerCardsDiv.appendChild(createCardElement(card.image));
    }
    for (let card of dealerCards) {
        dealerCardsDiv.appendChild(createCardElement(card.image));
    }
}

function createCardElement(imageUrl) {
    const cardImg = document.createElement('img');
    cardImg.src = imageUrl;
    cardImg.style.width = '100px';
    cardImg.style.marginRight = '10px';
    return cardImg;
}

async function hit() {
    if (!gameInProgress) return;

    await drawCard(playerCards);
    updateScores();
    renderCards();

    if (playerScore > 21) {
        endGame('Você perdeu!');
    }
}

async function stand() {
    if (!gameInProgress) return;

    while (dealerScore < 17) {
        await drawCard(dealerCards);
        updateScores();
        renderCards();
    }

    if (dealerScore > 21 || playerScore > dealerScore) {
        endGame('Você ganhou!');
    } else if (playerScore === dealerScore) {
        endGame('Empate!');
    } else {
        endGame('Você perdeu!');
    }
}

function endGame(message) {
    messageDiv.textContent = message;
    gameInProgress = false;
    toggleButtonState(false);
}

function toggleButtonState(enabled) {
    btnHit.disabled = !enabled;
    btnStand.disabled = !enabled;
}