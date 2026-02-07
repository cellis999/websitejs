// 1. Initial setup
// pulls the decks from localStorage OR starts with an empty array
let decks = JSON.parse(localStorage.getItem('commanderDecks')) || [];

// 2. Making variables from the HTML elements
const addDeckBtn = document.getElementById('add-deck');
const sidebarList = document.querySelector('.sidebar ul');
const displayDeckName = document.getElementById('deck-name');
const displayCommanderName = document.getElementById('commander-name');

// 3. Rendering of the sidebar, also handles adding new decks
// Makes the sidebar have all the decks in the array and adds click listeners
function renderSidebar() {
    sidebarList.innerHTML = ''; // Clear current list to prevent duplicates
    
    decks.forEach((deck, index) => {
        const list = document.createElement('li');
        list.textContent = deck.name;
        list.style.cursor = "pointer";
        list.style.padding = "5px";
        
        // When a user clicks a deck in the sidebar, it loads that deck's info
        list.addEventListener('click', () => {
            loadDeck(index);
        });
        
        sidebarList.appendChild(list);
    });
}

// 4. Logic for adding a new deck
addDeckBtn.addEventListener('click', () => {
    const name = prompt("Enter your Deck Name:");
    if (!name) return; // Exit if they hit cancel

    const commander = prompt("Enter Commander Name:");

    const newDeck = {
        name: name,
        commander: commander || "No Commander Assigned",
        cards: [] // Future home for our 100 cards
    };

    decks.push(newDeck);
    saveToLocalStorage();
    renderSidebar();
    
    // Automatically load the deck you just created
    loadDeck(decks.length - 1);
});

// 5. Loads a deck
// This updates the main content area when a deck is selected
function loadDeck(index) {
    currentDeckIndex = index;
    const deck = decks[index];
    document.getElementById('deck-name').textContent = deck.name;
    document.getElementById('commander-name').textContent = deck.commander;
    
    renderCardGrid(); // Refresh the grid for this specific deck
}

// 6. Save the data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('commanderDecks', JSON.stringify(decks));
}

renderSidebar();

// Global variable to track which deck is currently active
let currentDeckIndex = null;

// ASYNC FETCH: Get card data from Scryfall
async function fetchCardData(cardName) {
    try {
        const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
        if (!response.ok) throw new Error('Card not found');
        const data = await response.json();
        return data.image_uris.normal; // Return the image URL
    } catch (error) {
        console.error(error);
        alert("Could not find that card!");
        return null;
    }
}

// Add card to the active deck
document.getElementById('add-card-btn').addEventListener('click', async () => {
    const input = document.getElementById('card-input');
    const cardName = input.value.trim();

    if (cardName && currentDeckIndex !== null) {
        // 1. Fetch the image URL
        const imageUrl = await fetchCardData(cardName);
        
        if (imageUrl) {
            decks[currentDeckIndex].cards.push({ name: cardName, image: imageUrl });
            
            // 2. Sync to LocalStorage
            saveToLocalStorage();
            
            // 3. Update UI
            renderCardGrid();
            input.value = '';
        }
    }
});

function renderCardGrid() {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = ''; // Wipe existing cards
    
    const currentCards = decks[currentDeckIndex].cards;

    currentCards.forEach(card => {
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.name;
        img.className = 'card-image';
        grid.appendChild(img);
    });
}