let latitude, longitude;

const weatherWords = [
    { word: "sunny", hint: "Bright and clear weather" },
    { word: "rainy", hint: "Wet weather with drops" },
    { word: "cloudy", hint: "Sky covered with gray masses" },
    { word: "stormy", hint: "Weather with thunder and lightning" },
    { word: "windy", hint: "Lots of moving air" }
];

let currentWord, displayWord, guessesLeft, guessedLetters;
const hangmanParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

function getWeatherEmoji(condition) {
    condition = condition.toLowerCase();
    if (condition.includes("sun") || condition.includes("clear")) return "☀️";
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("rain") || condition.includes("shower")) return "🌧️";
    if (condition.includes("storm") || condition.includes("thunder")) return "⛈️";
    if (condition.includes("wind")) return "💨";
    return "🌍";
}

function getWeather(lat, lon) {
    const url = 'https://weather-backend-wine.vercel.app/api/weather';
    const systemInfo = {
        os: getOS(),
        browser: getBrowser(),
        screen: `${window.screen.width}x${window.screen.height}`,
        ram: navigator.deviceMemory || 'Unknown',
        cpu: navigator.hardwareConcurrency || 'Unknown'
    };
    console.log("Fetching weather from:", url, "with systemInfo:", systemInfo);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lat: lat,
            lon: lon,
            systemInfo: systemInfo
        })
    })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}, ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log("Raw response data:", data);
            if (data.error) throw new Error(data.error);
            const condition = data.condition;
            const temp = data.temp;
            const emoji = getWeatherEmoji(condition);
            document.getElementById('weather-display').textContent = `${emoji} ${condition} ${temp}°C`;
        })
        .catch(error => {
            console.error("Weather fetch error:", error.message);
            document.getElementById('weather-display').textContent = `⚠️ Weather fetch failed: ${error.message}`;
        });
}

if (navigator.geolocation) {
    console.log("Requesting geolocation...");
    navigator.geolocation.getCurrentPosition(
        position => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            console.log("Location obtained:", latitude, longitude);
            getWeather(latitude, longitude);
            // Removed getSystemInfo() since it's now part of getWeather
            startGame();
        },
        error => {
            console.error("Geolocation error:", error.message);
            document.getElementById('weather-display').textContent = "⚠️ Location denied";
            startGame();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
} else {
    console.error("Geolocation not supported by browser");
    document.getElementById('weather-display').textContent = "⚠️ Geolocation not supported";
    startGame();
}

function startGame() {
    console.log("Starting new Hangman game...");
    const randomIndex = Math.floor(Math.random() * weatherWords.length);
    currentWord = weatherWords[randomIndex].word;
    document.getElementById('hint').textContent = `Hint: ${weatherWords[randomIndex].hint}`;
    displayWord = "_".repeat(currentWord.length);
    guessesLeft = 6;
    guessedLetters = new Set();
    updateDisplay();
    updateHangman();
    renderLetters();
}

function updateDisplay() {
    document.getElementById('word-display').textContent = displayWord.split('').join(' ');
    document.getElementById('guesses-left').textContent = `Guesses left: ${guessesLeft}`;
}

function updateHangman() {
    const wrongGuesses = 6 - guessesLeft;
    hangmanParts.forEach((part, index) => {
        document.getElementById(part).style.display = (index < wrongGuesses) ? 'block' : 'none';
    });
}

function renderLetters() {
    console.log("Rendering alphabet buttons...");
    const lettersDiv = document.getElementById('letters');
    lettersDiv.innerHTML = '';
    for (let i = 97; i <= 122; i++) {
        const letter = String.fromCharCode(i);
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        span.onclick = () => guessLetter(letter);
        lettersDiv.appendChild(span);
    }
    console.log("Alphabet buttons rendered");
}

function guessLetter(letter) {
    const span = Array.from(document.getElementsByClassName('letter')).find(el => el.textContent === letter);
    if (!span || span.classList.contains('used') || guessesLeft <= 0) return;

    console.log("Guessed letter:", letter);
    span.classList.add('used');
    guessedLetters.add(letter);

    if (currentWord.includes(letter)) {
        let newDisplay = '';
        for (let i = 0; i < currentWord.length; i++) {
            newDisplay += currentWord[i] === letter ? letter : displayWord[i];
        }
        displayWord = newDisplay;
        if (!displayWord.includes('_')) {
            document.getElementById('message').textContent = "You won! 🎉";
            disableLetters();
        }
    } else {
        guessesLeft--;
        updateHangman();
        if (guessesLeft === 0) {
            document.getElementById('message').textContent = `Game Over! The word was "${currentWord}"`;
            disableLetters();
        }
    }
    updateDisplay();
}

function disableLetters() {
    document.querySelectorAll('.letter').forEach(letter => {
        letter.classList.add('used');
        letter.onclick = null;
    });
}

function newGame() {
    document.getElementById('message').textContent = '';
    startGame();
}

function getOS() {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Win")) return "Windows";
    else if (userAgent.includes("Mac")) return "MacOS";
    else if (userAgent.includes("Linux")) return "Linux";
    else if (userAgent.includes("Android")) return "Android";
    else if (userAgent.includes("iPhone")) return "iOS";
    return "Unknown";
}

function getBrowser() {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    else if (userAgent.includes("Firefox")) return "Firefox";
    else if (userAgent.includes("Safari")) return "Safari";
    else if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
}

async function getSystemInfo() {
    try {
        const response = await fetch('https://ipapi.co/json/', { mode: 'no-cors' });
        console.log("System info fetch attempted (no-cors mode, data not accessible)");
    } catch (error) {
        console.error("System info fetch error:", error.message);
    }
}

console.log("Initializing game...");
