// ===== STAVOVÉ PROMĚNNÉ =====
let soundsEnabled = true;
let clickerData = { clicks: 0, perClick: 1, autoClick: 0, finished: false };
let snakeGame = { active: false, score: 0, highscore: 0 };
let highestZ = 1000;
let secretUnlocked = false;

let fartMode = false;

let trashClicks = 0;

let clickerState = {
    clicks: 0,
    totalClicks: 0,
    perClick: 1,
    autoCPS: 0,
    multiplier: 1,
    upgradesBought: 0,
    goal: 1500000,
    isFreeMode: false,
    costs: { 
        clickupg: 20, 
        cpsupg: 150, 
        multupg: 1000, 
        cpsupg2: 5000, 
        clickupg2: 15000, 
        multupg2: 50000, 
        clickupg3: 150000, 
        cpsupg3: 400000, 
        multupg3: 800000 
    }
};

let currentSongIdx = 0;
let songScore = 0;
const gameAudio = document.getElementById("game-audio");

document.addEventListener("DOMContentLoaded", () => {
    updateClickerUI(); 
});

window.addEventListener("load", () => {
    let saved = localStorage.getItem("wallpaper") || "defaultwp.jpg";
    setWallpaper(saved);
});

document.addEventListener("DOMContentLoaded", () => {
    const taskbar = document.getElementById("taskbar");
    if(taskbar) taskbar.style.display = "none";
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const activeEl = document.activeElement;

        if (activeEl.id === "song-input") {
            checkSongAnswer();
        } 
        
        else if (activeEl.id === "secret-input") {
            checkSecret();
        }
        
    }
});

let snakeState = {
    active: false,
    score: 0,
    highscore: 0,
    isFreeMode: false,
    goal: 15,
    speed: 100,
    items: {
        snakeColor: 'lime',
        foodColor: 'red',
        bgColor: '#000'
    }
};

let ctx;
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let gridSize = 20;
let tileCount = 25;
let snakeInterval;

// ===== SOUNDS =====
const sounds = {
    open: new Audio("assets/SOUNDS/open.wav"),
    error: new Audio("assets/SOUNDS/error.wav"),
    success: new Audio("assets/SOUNDS/success.wav"),
    click: new Audio("assets/SOUNDS/click.wav"),

    buy: new Audio("assets/SOUNDS/buy.mp3"),
    win: new Audio("assets/SOUNDS/win.mp3")
};

const fartSound = new Audio("assets/SOUNDS/fart.mp3");

const clickSFX = new Audio("assets/SOUNDS/clicklucky.mp3");
clickSFX.volume = 1.0;
clickSFX.preload = "auto";
clickSFX.load();

function playSound(name, customVolume = 1.0) {
    if (!soundsEnabled) return;

    if (fartMode) {
        fartSound.volume = customVolume;
        fartSound.currentTime = 0;
        fartSound.play();
        return;
    }

    if (!sounds[name]) return;
    const sfx = sounds[name];
    sfx.volume = customVolume;
    sfx.currentTime = 0;
    sfx.play();
}

// ===== BOOT ANIMATION =====
window.addEventListener("load", () => {
    const boot = document.getElementById("boot-screen");
    const screen = document.querySelector(".wscreen");

    if(!boot) return;

    boot.style.animation = "flash 0.3s ease";
    setTimeout(() => { boot.style.animation = "crt-on 1s ease forwards"; }, 300);
    setTimeout(() => { screen.style.opacity = "1"; }, 800);

    setTimeout(() => {
        boot.remove();
    }, 1300);
});

// ===== START BUTTON & LOADING =====
const startButton = document.getElementById("start-button");
if (startButton) {
    startButton.addEventListener("click", () => {
        const startText = document.getElementById("start-text");
        const startIcon = document.getElementById("start-icon");
        const loadingContainer = document.getElementById("loading-container");
        const loadingBar = document.getElementById("loading-bar");
        const mainMenu = document.getElementById("main-menu");

        startIcon.style.display = "none";
        loadingContainer.style.display = "block";
        
        let progress = 0;
        const loadingTexts = ["Loading memories...", "Initializing love.exe", "Syncing hearts...", "Finalizing..."];
        
        const textInterval = setInterval(() => {
            startText.textContent = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
        }, 400);

        const interval = setInterval(() => {
            progress += 2;
            loadingBar.style.width = progress + "%";
            if (progress >= 100) {
                clearInterval(interval);
                clearInterval(textInterval);
                startText.textContent = "Done <3";
                setTimeout(() => {
                    document.querySelector(".wscreen-main").style.display = "none";
                    mainMenu.style.display = "block";
    
                    document.getElementById("taskbar").style.display = "flex"; 
                }, 400);
            }
        }, 30);
    });
}

// ===== WINDOW SYSTEM =====
function focusWindow(win) {
    highestZ++;
    if (highestZ > 999900) {
        highestZ = 1000;
    }
    win.style.zIndex = highestZ;
}

let taskbar;
document.addEventListener("DOMContentLoaded", () => {
    taskbar = document.getElementById("taskbar-items");
    
    // Desktop icons listener
    document.addEventListener("click", (e) => {
        const icon = e.target.closest(".desktop-icon");
        if (icon) openWindow(icon.dataset.window);
    });
});

function openWindow(name) {
    const win = document.getElementById(name + "-window");
    if (!win) return;

    playSound("open");
    win.style.display = "flex";
    win.classList.remove("hidden");

    if (!win.style.top || win.style.top === "" || win.style.top === "0px") {
        win.style.top = (100 + Math.random() * 50) + "px";
        win.style.left = (150 + Math.random() * 100) + "px";
    }

    focusWindow(win);
    addToTaskbar(name, win);
}

document.addEventListener("mousedown", (e) => {
    const win = e.target.closest(".window");
    if (win) {
        focusWindow(win);
    }
});

// 1) TASKBAR FIX (Left align + Capitalize)
function addToTaskbar(name, win, customIcon = null) {
    let existing = document.querySelector(`[data-task="${name}"]`);
    if (existing) return;

    const item = document.createElement("div");
    item.className = "task-item";
    item.dataset.task = name;

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const iconSrc = customIcon ? customIcon : `assets/${name}.gif`;

    item.innerHTML = `
        <img src="${iconSrc}" style="width:16px" onerror="this.src='assets/default.gif'">
        <span>${capitalizedName}</span>
    `;

    item.onclick = () => {
        win.style.display = (win.style.display === "none") ? "flex" : "none";
        if(win.style.display === "flex") focusWindow(win);
    };

    taskbar.appendChild(item);
}

// CLOSE & MINIMIZE
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close-btn")) {
        const win = e.target.closest(".window");
        if (!win) return;

        const id = win.id.replace("-window", "");

        if (id === "guessthesong") {
            closeSongWindow();
        }
        if (id === "gallery") {
            closeGalleryWindow();
        } 
        else {
            win.style.display = "none";
            win.classList.add("hidden");
            const task = document.querySelector(`.task-item[data-task="${id}"]`);
            if (task) task.remove();
            
            if (id === "game") snakeState.active = false;
        }
    }
    if (e.target.classList.contains("min-btn")) {
        e.target.closest(".window").style.display = "none";
    }
});

// ===== 2) SECRET & ERROR BOX =====
let secretEyeClickCount = 0;

function checkSecret() {
    const input = document.getElementById("secret-input");
    const val = input.value.trim().toUpperCase();
    
    // PASSWORD
    const CORRECT_PASSWORD = "VK4EVER"; 

    if (val === CORRECT_PASSWORD) {
        unlockSecret();
    } else {
        if(typeof playSound === "function") playSound("error");
        switchSecretScreen("secret-error-screen");
        input.value = "";
    }
}

function toggleSecretVisibility() {
    const input = document.getElementById("secret-input");
    const eye = document.getElementById("toggle-password");
    
    secretEyeClickCount++;
    if (secretEyeClickCount === 10) {
        if(typeof playSound === "function") playSound("success");
        switchSecretScreen("secret-hint-screen");
        secretEyeClickCount = 0;
    }

    if (input.type === "password") {
        input.type = "text";
        eye.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        eye.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function closeSecretHint() {
    switchSecretScreen("secret-login-screen");
    document.getElementById("secret-input").focus();
}

function unlockSecret() {
    if(typeof playSound === "function") playSound("win");
    switchSecretScreen("secret-content-screen");

    try {
        if (typeof confetti === "function") {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 9999999,
                colors: ['#9400D3', '#ffffff', '#FF69B4']
            });
        }
    } catch (e) { console.error(e); }
}

function retrySecret() {
    switchSecretScreen("secret-login-screen");
    document.getElementById("secret-input").focus();
}

function closeSecretWindow() {
    secretUnlocked = false;
    secretEyeClickCount = 0;
    document.getElementById("secret-input").value = "";
    document.getElementById("secret-input").type = "password";
    
    const eyeIcon = document.getElementById("toggle-password");
    if(eyeIcon) eyeIcon.classList.replace("fa-eye-slash", "fa-eye");

    const win = document.getElementById("secret-window");
    if (win) {
        win.style.display = "none";
        win.classList.add("hidden");
    }

    const taskItem = document.querySelector('.task-item[data-task="secret"]');
    if (taskItem) {
        taskItem.remove();
    }
    
    secretUnlocked = false;
    document.getElementById("secret-input").value = "";
    switchSecretScreen("secret-login-screen");
}

function switchSecretScreen(screenId) {
    const screens = document.querySelectorAll("#secret-window .secret-screen");
    screens.forEach(s => s.classList.add("hidden"));
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove("hidden");
    } else {
        console.error("Obrazovka s ID " + screenId + " neexistuje!");
    }
}

// ===== 5) SETTINGS & SOUNDS =====
function setWallpaper(name) {
    const wallpaperDiv = document.getElementById("wallpaper");
    const imageUrl = `assets/WALLPAPERS/${name}`;

    const img = new Image();
    img.src = imageUrl;

    img.onload = function() {
        wallpaperDiv.style.backgroundImage = `url(${imageUrl})`;
        
        localStorage.setItem("wallpaper", name);

        document.querySelectorAll(".wp-preview").forEach(el => {
            el.classList.remove("selected");
        });

        const selectedPreview = document.querySelector(`[data-wallpaper="${name}"]`);
        if (selectedPreview) {
            selectedPreview.classList.add("selected");
        }
    };

    img.onerror = function() {
        console.error("Nepodařilo se načíst tapetu: " + imageUrl);
    };
}

function toggleAllSounds() {
    soundsEnabled = !soundsEnabled;
    const btn = document.getElementById("sound-toggle-btn");
    if(btn) btn.textContent = soundsEnabled ? "Sounds: ON" : "Sounds: OFF";
}

// ===== 6) SNAKE GAME =====
function initCanvas() {
    const canvas = document.getElementById("gameCanvas");
    if (canvas && !ctx) {
        ctx = canvas.getContext("2d");
    }
}

document.addEventListener("keydown", (e) => {
    if (!snakeState.active) return;
    
    const key = e.key.toLowerCase();
    
    if ((key === "w" || e.key === "ArrowUp") && dy === 0) {
        dx = 0; dy = -1;
    }
    else if ((key === "s" || e.key === "ArrowDown") && dy === 0) {
        dx = 0; dy = 1;
    }
    else if ((key === "a" || e.key === "ArrowLeft") && dx === 0) {
        dx = -1; dy = 0;
    }
    else if ((key === "d" || e.key === "ArrowRight") && dx === 0) {
        dx = 1; dy = 0;
    }
});

function startSnakeGame() {
    if (snakeInterval) clearInterval(snakeInterval);
    
    initCanvas();

    const savedHigh = localStorage.getItem("snake_highscore") || 0;
    snakeState.highscore = parseInt(savedHigh);
    document.getElementById("snake-highscore").textContent = snakeState.highscore;

    snakeState.active = true;
    snakeState.score = 0;
    document.getElementById("snake-score").textContent = "0";

    snake = [
        { x: 12, y: 12 },
        { x: 11, y: 12 },
        { x: 10, y: 12 }
    ];
    
    dx = 1; dy = 0;
    
    spawnFood();
    switchSnakeScreen("snake-play-screen");
    draw();

    setTimeout(() => {
        if (snakeState.active) {
            snakeInterval = setInterval(gameLoop, snakeState.speed);
        }
    }, 500);
}

function gameLoop() {
    if (!snakeState.active) return;
    update();
    draw();
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return endGame();
    }

    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return endGame();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        snakeState.score++;
        document.getElementById("snake-score").textContent = snakeState.score;
        
        if (snakeState.score > snakeState.highscore) {
            snakeState.highscore = snakeState.score;
            document.getElementById("snake-highscore").textContent = snakeState.highscore;
            localStorage.setItem("snake_highscore", snakeState.highscore);
        }

        spawnFood();
        if (snakeState.score === snakeState.goal && !snakeState.isFreeMode) {
            unlockSnakeHint();
        }
    } else {
        snake.pop();
    }
}

function draw() {
    if (!ctx) return;

    // CLEAR BG
    ctx.fillStyle = snakeState.items.bgColor || "#000";
    ctx.fillRect(0, 0, 500, 500);

    // GRID
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, 500);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(500, i * gridSize);
        ctx.stroke();
    }

    // FOOD
    ctx.fillStyle = snakeState.items.foodColor || "red";
    ctx.shadowBlur = 5;
    ctx.shadowColor = snakeState.items.foodColor || "red";
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
    ctx.shadowBlur = 0;

    // SNAKE
    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? "#ffffff" : (snakeState.items.snakeColor || "lime");
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

function spawnFood() {
    let newX, newY;
    let isOccupied = true;
    let attempts = 0;

    while (isOccupied && attempts < 100) {
        newX = Math.floor(Math.random() * tileCount);
        newY = Math.floor(Math.random() * tileCount);
        
        isOccupied = snake.some(segment => segment.x === newX && segment.y === newY);
        attempts++;
    }

    food = { x: newX, y: newY };
}

function unlockSnakeHint() {
    snakeState.active = false;
    clearInterval(snakeInterval);
    playSound("win");
    switchSnakeScreen("snake-hint-screen");
}

function activateSnakeFreeMode() {
    snakeState.isFreeMode = true;
    snakeState.active = true;
    switchSnakeScreen("snake-play-screen");
    snakeInterval = setInterval(gameLoop, snakeState.speed);
}

function endGame() {
    snakeState.active = false;
    clearInterval(snakeInterval);
    playSound("error");
    
    document.getElementById("snake-final-score").textContent = snakeState.score;
    switchSnakeScreen("snake-gameover-screen");
}

function restartSnakeGame() {
    startSnakeGame();
}

function closeSnakeWindow() {
    snakeState.active = false;
    if (snakeInterval) clearInterval(snakeInterval);
    
    const win = document.getElementById("snake-window");
    if (win) {
        win.style.display = "none";
        win.classList.add("hidden");
    }
    
    const taskItem = document.querySelector('.task-item[data-task="snake"]');
    if (taskItem) {
        taskItem.remove();
    }

    switchSnakeScreen("snake-menu-screen");
}
function switchSnakeScreen(id) {
    document.querySelectorAll(".snake-screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// === SETTINGS FOR SNAKE ===
function setSnakeColor(color, btnElement) {
    snakeState.items.snakeColor = color;
    
    btnElement.parentElement.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
        playSound("click");
}

function setSnakeFoodItem(type, btnElement) {
    if (type === 'apple') snakeState.items.foodColor = 'red';
    else if (type === 'mouse') snakeState.items.foodColor = '#888';
    
    btnElement.parentElement.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    playSound("click");
}
function setSnakeBgColor(color) {
    snakeState.items.bgColor = color;
    playSound("click");
}

// ===== 7) LUCKY CLICKER =====
const clickTarget = document.getElementById('click-target');
if (clickTarget) {
    clickTarget.addEventListener('mousedown', (e) => {
        const value = clickerState.perClick * clickerState.multiplier;
        clickerState.clicks += value;
        clickerState.totalClicks += value;
        
        updateClickerUI();
        spawnFloatingNumber(e.clientX, e.clientY, value);
        if (fartMode) {
            fartSound.currentTime = 0;
            fartSound.play();
        } else {
            clickSFX.pause();
            clickSFX.currentTime = 0;
            clickSFX.play();
        }
        checkGoal();
    });
}

function buyClickerUpgrade(type) {
    const cost = Math.floor(clickerState.costs[type]);
    
    if (clickerState.clicks >= cost) {
        clickerState.clicks -= cost;
        clickerState.upgradesBought++;
        
        // --- LOGIKA UPGRADŮ ---
        if (type === 'clickupg') clickerState.perClick += 1;
        else if (type === 'cpsupg') clickerState.autoCPS += 3;
        else if (type === 'multupg') clickerState.multiplier *= 1.25;
        else if (type === 'cpsupg2') clickerState.autoCPS += 15;
        else if (type === 'clickupg2') clickerState.perClick += 60;
        else if (type === 'multupg2') clickerState.multiplier *= 1.75;
        else if (type === 'clickupg3') clickerState.perClick += 250;
        else if (type === 'cpsupg3') clickerState.autoCPS += 150;
        else if (type === 'multupg3') clickerState.multiplier *= 3;

        clickerState.costs[type] *= 1.55; 
        
        updateClickerUI();
        
        playSound('buy', 0.4); 
    } else {
        playSound('error', 0.5);
    }
}

function updateClickerUI() {
    const clickEl = document.getElementById('click-count');
    const upEl = document.getElementById('upgrades-count');
    if(clickEl) clickEl.textContent = Math.floor(clickerState.clicks).toLocaleString();
    if(upEl) upEl.textContent = clickerState.upgradesBought;

    Object.keys(clickerState.costs).forEach(key => {
        const currentCost = Math.floor(clickerState.costs[key]);
        const costDisplay = document.getElementById(`cost-${key}`);
        const btn = document.querySelector(`button[onclick*="'${key}'"]`);

        if (costDisplay) {
            costDisplay.innerHTML = `${currentCost.toLocaleString()} <img src="assets/LC/currency.png" class="lcurrency" style="width:14px;">`;
        }

        if (btn) {
            if (clickerState.clicks < currentCost) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        }
    });

    const progBar = document.getElementById('clicker-progress');
    const progTxt = document.getElementById('progress-text');
    if(progBar) progBar.style.width = Math.min((clickerState.totalClicks / clickerState.goal) * 100, 100) + '%';
    if(progTxt) progTxt.textContent = `${Math.floor(clickerState.totalClicks).toLocaleString()} / ${clickerState.goal.toLocaleString()}`;
}

function checkUpgradeAvailability(type, cost) {
    const btn = document.querySelector(`button[onclick*="'${type}'"]`);
    if (btn) {
        if (clickerState.clicks < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    }
}

// Loop pro auto-klikání (každou vteřinu)
setInterval(() => {
    if (clickerState.autoCPS > 0) {
        const value = (clickerState.autoCPS * clickerState.multiplier) / 10;
        clickerState.clicks += value;
        clickerState.totalClicks += value;
        updateClickerUI();
        if (clickerState.totalClicks >= clickerState.goal) checkGoal();
    }
}, 100);

function checkGoal() {
    if (clickerState.totalClicks >= clickerState.goal && !clickerState.isFreeMode) {
        playSound('win');
        const winScreen = document.getElementById('clicker-win-screen');
        if(winScreen) winScreen.classList.remove('hidden');
    }
}

function activateFreeMode() {
    clickerState.isFreeMode = true;
    const winScreen = document.getElementById('clicker-win-screen');
    if(winScreen) winScreen.classList.add('hidden');
    clickerState.goal = 999999999; 
    updateClickerUI();
}

// Efekt +1 u myši
function spawnFloatingNumber(x, y, val) {
    const el = document.createElement('div');
    el.className = 'floating-num';
    el.innerHTML = `+${Math.floor(val)}<img src="assets/LC/currency.png" style="width:18px; margin-left:4px;">`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// ===== 8) GUESS THE SONG =====
const playlist = [
    { title: "Nirvana", artist: "PANOPTIKO", date: "2025", file: "assets/GUESSTHESONG/AUDIOS/Nirvana.wav", cover: "assets/GUESSTHESONG/COVERS/NirvanaCover.jpg" },
    { title: "Myslivecky Ples", artist: "Kabat", date: "2015", file: "assets/GUESSTHESONG/AUDIOS/MysliveckyPles.wav", cover: "assets/GUESSTHESONG/COVERS/MysliveckyPles.jpg" },
    { title: "Racks Blue", artist: "Nine Vicious", date: "2026", file: "assets/GUESSTHESONG/AUDIOS/RacksBlue.wav", cover: "assets/GUESSTHESONG/COVERS/RacksBlue.jpg" },
    { title: "Sukat Psa Do Prdele", artist: "Vyebaney Robot", date: "2024", file: "assets/GUESSTHESONG/AUDIOS/SukatPsaDoPrdele.wav", cover: "assets/GUESSTHESONG/COVERS/SukatPsaDoPrdele.jpg" },
    { title: "Viva Moldova", artist: "Satoshi", date: "2026", file: "assets/GUESSTHESONG/AUDIOS/VivaMoldova.wav", cover: "assets/GUESSTHESONG/COVERS/VivaMoldova.jpg" },
    { title: "Totes Fleisch", artist: "Miss Construction", date: "2008", file: "assets/GUESSTHESONG/AUDIOS/TotesFleisch.wav", cover: "assets/GUESSTHESONG/COVERS/TotesFleisch.jpg" },
    { title: "Loco", artist: "Yeat", date: "2025", file: "assets/GUESSTHESONG/AUDIOS/Loco.wav", cover: "assets/GUESSTHESONG/COVERS/Loco.jpg" },
    { title: "Mozartovy Kule", artist: "PANOPTIKO", date: "2023", file: "assets/GUESSTHESONG/AUDIOS/MozartovyKule.wav", cover: "assets/GUESSTHESONG/COVERS/MozartovyKule.jpg" },
    { title: "Noc v Abbey Road", artist: "PANOPTIKO", date: "2025", file: "assets/GUESSTHESONG/AUDIOS/NocVAbbeyRoad.wav", cover: "assets/GUESSTHESONG/COVERS/NirvanaCover.jpg" },
    { title: "BFM", artist: "asteria, Britney Manson, kets4eki", date: "2024", file: "assets/GUESSTHESONG/AUDIOS/BFM.wav", cover: "assets/GUESSTHESONG/COVERS/BFM.jpg" }
];

function startSongGame() {
    currentSongIdx = 0;
    songScore = 0;
    switchSongScreen("song-play-screen");
    loadCurrentSong();
}

function loadCurrentSong() {
    const s = playlist[currentSongIdx];
    gameAudio.src = s.file;
    gameAudio.load();
    
    document.getElementById("current-song-num").textContent = currentSongIdx + 1;
    document.getElementById("song-input").value = "";
    document.getElementById("song-progress-bar").style.width = "0%";
    
    document.getElementById("time-current").textContent = "0:00";
    
    gameAudio.onloadedmetadata = () => {
        document.getElementById("time-total").textContent = formatTime(gameAudio.duration);
    };
}

function toggleAudio() {
    const playBtn = document.getElementById("play-btn");
    
    if (gameAudio.paused) {
        gameAudio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        gameAudio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

gameAudio.ontimeupdate = () => {
    const pct = (gameAudio.currentTime / gameAudio.duration) * 100;
    document.getElementById("song-progress-bar").style.width = pct + "%";
    document.getElementById("time-current").textContent = formatTime(gameAudio.currentTime);
};

gameAudio.onended = () => {
    document.getElementById("play-btn").innerHTML = '<i class="fa-solid fa-play"></i>';
};

function checkSongAnswer() {
    const input = document.getElementById("song-input").value.trim().toLowerCase();
    const correct = playlist[currentSongIdx].title.toLowerCase();

    if (input === correct) {
        songScore++;
        playSound("success");
        showRevealScreen();
    } else {
        playSound("error");
        showRevealScreen(false); 
    }
}

function showRevealScreen(isCorrect = true) {
    gameAudio.pause();
    const s = playlist[currentSongIdx];
    
    document.getElementById("reveal-title").textContent = s.title;
    document.getElementById("reveal-artist").textContent = s.artist;
    document.getElementById("reveal-date").textContent = s.date;
    document.getElementById("reveal-cover").src = s.cover;
    
    const h2 = document.querySelector("#song-reveal-screen h2");
    h2.textContent = isCorrect ? "CORRECT!" : "WRONG...";
    h2.style.color = isCorrect ? "lime" : "red";

    if (currentSongIdx === playlist.length - 1) {
        document.getElementById("next-song-btn").textContent = "Finish";
    } else {
        document.getElementById("next-song-btn").textContent = "Next";
    }

    switchSongScreen("song-reveal-screen");
}

function nextSong() {
    if (currentSongIdx < playlist.length - 1) {
        currentSongIdx++;
        switchSongScreen("song-play-screen");
        loadCurrentSong();
    } else {
        showEndScreen();
    }
}

function showEndScreen() {
    const pct = Math.floor((songScore / playlist.length) * 100);
    document.getElementById("result-bar-fill").style.width = pct + "%";
    document.getElementById("result-percent-text").textContent = pct + "%";
    
    const msg = document.getElementById("result-message");
    const retryBtn = document.getElementById("retry-btn");

    if (pct >= 80) {
        playSound("win");
        msg.innerHTML = `GREAT JOB! 🎉<br><br><span style="color: gold;">3. HINT: 4</span>`;
        retryBtn.classList.add("hidden");
    } else {
        playSound("error");
        msg.textContent = "That's not enough (you need at least 80%). Try it again!";
        retryBtn.classList.remove("hidden");
    }
    switchSongScreen("song-end-screen");
}

function restartSongGame() {
    startSongGame();
}

function switchSongScreen(id) {
    document.querySelectorAll(".song-screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function closeSongWindow() {
    if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
        gameAudio.src = ""; 
    }
    
    const win = document.getElementById("guessthesong-window");
    if (win) {
        win.style.display = "none";
        win.classList.add("hidden");
    }
    
    const taskItem = document.querySelector('.task-item[data-task="guessthesong"]');
    if (taskItem) {
        taskItem.remove();
    }

    currentSongIdx = 0;
    songScore = 0;
    
    const songInput = document.getElementById("song-input");
    if (songInput) songInput.value = "";
    
    const playBtn = document.getElementById("play-btn");
    if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

    switchSongScreen("song-start-screen");
}

// ===== DRAG WINDOWS =====
let isDragging = false;
let currentWindow = null;
let offset = { x: 0, y: 0 };

document.addEventListener("mousedown", (e) => {
    const header = e.target.closest(".window-header");
    if (header) {
        isDragging = true;
        currentWindow = header.closest(".window");
        
        const rect = currentWindow.getBoundingClientRect();
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        
        focusWindow(activeWindow);
        currentWindow.style.zIndex = Date.now();
        header.style.cursor = "grabbing";
    }
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging || !currentWindow) return;

    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const winWidth = currentWindow.offsetWidth;
    const winHeight = currentWindow.offsetHeight;

    let x = e.clientX - offset.x;
    let y = e.clientY - offset.y;

    if (x < 0) x = 0;
    if (x + winWidth > maxWidth) x = maxWidth - winWidth;

    if (y < 0) y = 0;
    if (y + winHeight > maxHeight - 40) y = maxHeight - winHeight - 40; 

    currentWindow.style.left = x + "px";
    currentWindow.style.top = y + "px";
});

document.addEventListener("mouseup", () => {
    if (currentWindow) {
        const header = currentWindow.querySelector(".window-header");
        if(header) header.style.cursor = "grab";
    }
    isDragging = false;
    currentWindow = null;
});

document.addEventListener("mouseup", () => { isDragging = false; activeWindow = null; });

// ===== FART MODE =====
function toggleFartMode() {
    fartMode = !fartMode;
    const btn = document.getElementById("fart-toggle-btn");
    if(btn) btn.textContent = fartMode ? "Fart Mode: ON" : "Fart Mode: OFF";
    playSound("click");
}

// ===== STATS =====
setInterval(() => {
    const statsEl = document.getElementById("system-stats");
    if(statsEl) {
        const date = new Date().toLocaleString("cs-CZ");
        statsEl.innerHTML = `System Time: ${date}<br><br>Lines of code: 2963`;
    }
}, 1000);

// ===== TRASH BIN =====
function openTrash() {
    playSound("open");
    trashClicks = 0;
    document.getElementById("trash-photo").style.transform = "scale(1)";
    document.getElementById("trash-hint").classList.add("hidden");
    document.getElementById("trash-easteregg").classList.remove("hidden");
}

function clickTrashYes() {
    trashClicks++;
    playSound("error");
    
    const scale = 1 + (trashClicks * 0.15);
    document.getElementById("trash-photo").style.transform = `scale(${scale})`;
    
    if (trashClicks >= 8) {
        playSound("win");
        document.getElementById("trash-hint").classList.remove("hidden");
    }
}

// ===== SECRET CHEAT CODE =====
const secretCode = "2410";
let currentInput = "";

// Najdeme všechny bannery
document.querySelectorAll('.hint-banner').forEach(banner => {
    banner.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        currentInput += id;

        if (!secretCode.startsWith(currentInput)) {
            currentInput = id;
            
            if (!secretCode.startsWith(currentInput)) {
                currentInput = "";
            }
        }

        if (currentInput === secretCode) {
            showSecretHint();
            currentInput = "";
        }
    });
});

function showSecretHint() {
    const hintDiv = document.getElementById("secret-hint-display");
    hintDiv.style.display = "block";
    playSound("success");
    
    setTimeout(() => {
        hintDiv.style.display = "none";
    }, 5000);
}

// MOBILE BLOCKER
function checkDevice() {
    const blocker = document.getElementById('mobile-blocker');
    if (window.innerWidth <= 1024) {
        if (blocker) blocker.style.display = 'flex';
    } else {
        if (blocker) blocker.style.display = 'none';
    }
}

window.addEventListener('load', checkDevice);
window.addEventListener('resize', checkDevice);

// SECRET GALLERY
function openGallery() {
    console.log("Funkce openGallery byla spuštěna!"); 
    
    const win = document.getElementById("gallery-window");
    
    if (!win) {
        console.error("Okno gallery-window neexistuje!");
        return;
    }

    win.classList.remove("hidden");

    win.style.display = "flex";

    if (typeof highestZ !== 'undefined') {
        highestZ++;
        win.style.zIndex = highestZ;
    } else {
        win.style.zIndex = 999999; 
    }

    if (!win.style.top || win.style.top === "0px") {
        win.style.top = "150px";
        win.style.left = "200px";
    }

    if (typeof playSound === "function") playSound("open");

    if (typeof addToTaskbar === "function") {
        addToTaskbar("gallery", win, "assets/key.gif");
    }
}

function closeGalleryWindow() {
    const win = document.getElementById("gallery-window");
    if (win) {
        win.style.display = "none";
        win.classList.add("hidden");
    }
    
    const taskItem = document.querySelector('.task-item[data-task="gallery"]');
    if (taskItem) {
        taskItem.remove();
    }
}