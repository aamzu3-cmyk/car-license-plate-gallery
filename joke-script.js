// Random Joke Generator using Official Joke API

const getJokeBtn = document.getElementById('getJokeBtn');
const jokeText = document.getElementById('jokeText');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const historyList = document.getElementById('historyList');
const categoryFilter = document.getElementById('categoryFilter');

let jokeHistory = [];
let currentJoke = '';
let jokesCounted = {};

// Initialize
function init() {
    loadFromStorage();
    setupEventListeners();
    getRandomJoke();
}

// Setup event listeners
function setupEventListeners() {
    getJokeBtn.addEventListener('click', getRandomJoke);
    copyBtn.addEventListener('click', copyJoke);
    shareBtn.addEventListener('click', shareJoke);
    likeBtn.addEventListener('click', toggleLike);
    categoryFilter.addEventListener('change', getRandomJoke);
}

// Get random joke from API
async function getRandomJoke() {
    try {
        showLoading(true);
        hideError();
        
        const category = categoryFilter.value;
        let apiUrl = 'https://official-joke-api.appspot.com/random_joke';
        
        // Use different endpoints based on category
        if (category === 'programming') {
            apiUrl = 'https://official-joke-api.appspot.com/jokes/programming/random';
        } else if (category === 'knock-knock') {
            apiUrl = 'https://official-joke-api.appspot.com/jokes/knock-knock/random';
        } else if (category === 'general') {
            apiUrl = 'https://official-joke-api.appspot.com/random_joke';
        }

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();
        
        // Handle both single joke and array format
        const joke = Array.isArray(data) ? data[0] : data;
        
        // Format joke text
        if (joke.setup && joke.punchline) {
            currentJoke = `${joke.setup}\n\n${joke.punchline}`;
        } else {
            currentJoke = joke.joke || 'Could not load joke';
        }
        
        jokeText.textContent = currentJoke;
        addToHistory(currentJoke);
        resetLikes();
        showLoading(false);
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Failed to load joke. Please check your internet connection and try again.');
        showLoading(false);
        jokeText.textContent = 'Oops! Could not load a joke. Please try again.';
    }
}

// Copy joke to clipboard
async function copyJoke() {
    try {
        await navigator.clipboard.writeText(currentJoke);
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="icon">✓</span> Copied!';
        copyBtn.style.background = '#4CAF50';
        copyBtn.style.color = 'white';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy to clipboard');
    }
}

// Share joke
async function shareJoke() {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Check out this joke!',
                text: currentJoke
            });
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(currentJoke);
            showError('Joke copied! Share it wherever you like.');
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
}

// Toggle like count
function toggleLike() {
    const jokeKey = currentJoke.substring(0, 20); // Use first 20 chars as key
    
    if (jokesCounted[jokeKey]) {
        jokesCounted[jokeKey]--;
        if (jokesCounted[jokeKey] === 0) {
            delete jokesCounted[jokeKey];
        }
    } else {
        jokesCounted[jokeKey] = (jokesCounted[jokeKey] || 0) + 1;
    }
    
    updateLikeDisplay();
    saveToStorage();
}

// Reset likes for new joke
function resetLikes() {
    const jokeKey = currentJoke.substring(0, 20);
    likeCount.textContent = jokesCounted[jokeKey] || 0;
}

// Update like display
function updateLikeDisplay() {
    const jokeKey = currentJoke.substring(0, 20);
    const count = jokesCounted[jokeKey] || 0;
    likeCount.textContent = count;
    
    if (count > 0) {
        likeBtn.style.background = '#f5576c';
        likeBtn.style.color = 'white';
    } else {
        likeBtn.style.background = '';
        likeBtn.style.color = '';
    }
}

// Add joke to history
function addToHistory(joke) {
    const historyItem = {
        joke: joke,
        timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    jokeHistory.unshift(historyItem);
    
    // Keep only last 10 jokes
    if (jokeHistory.length > 10) {
        jokeHistory.pop();
    }
    
    renderHistory();
    saveToStorage();
}

// Render history
function renderHistory() {
    historyList.innerHTML = '';
    
    if (jokeHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No jokes yet. Generate one to get started!</p>';
        return;
    }
    
    jokeHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <p>${escapeHtml(item.joke)}</p>
            <div class="history-item-time">${item.timestamp}</div>
        `;
        div.addEventListener('click', () => {
            jokeText.textContent = item.joke;
            currentJoke = item.joke;
            resetLikes();
            window.scrollTo(0, 0);
        });
        historyList.appendChild(div);
    });
}

// Show/hide loading spinner
function showLoading(show) {
    if (show) {
        loading.classList.add('show');
        getJokeBtn.disabled = true;
    } else {
        loading.classList.remove('show');
        getJokeBtn.disabled = false;
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Save to local storage
function saveToStorage() {
    localStorage.setItem('jokeHistory', JSON.stringify(jokeHistory));
    localStorage.setItem('jokesCounted', JSON.stringify(jokesCounted));
}

// Load from local storage
function loadFromStorage() {
    const stored = localStorage.getItem('jokeHistory');
    if (stored) {
        jokeHistory = JSON.parse(stored);
        renderHistory();
    }
    
    const counted = localStorage.getItem('jokesCounted');
    if (counted) {
        jokesCounted = JSON.parse(counted);
    }
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', init);
