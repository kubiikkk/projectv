// ===== STAVOVÉ PROMĚNNÉ =====
let soundsEnabled = true;
let clickerData = { clicks: 0, perClick: 1, autoClick: 0, finished: false };
let snakeGame = { active: false, score: 0, highscore: 0 };
let currentSong = 0;
let songScore = 0;
let highestZ = 1000;

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

document.addEventListener("DOMContentLoaded", () => {
    updateClickerUI(); 
});

window.addEventListener("load", () => {
    let saved = localStorage.getItem("wallpaper") || "defaultwp.jpg";
    setWallpaper(saved);
});

// ===== SOUNDS =====
const sounds = {
    open: new Audio("assets/SOUNDS/open.wav"),
    error: new Audio("assets/SOUNDS/error.wav"),
    success: new Audio("assets/SOUNDS/success.wav"),
    click: new Audio("assets/SOUNDS/click.wav"),

    buy: new Audio("assets/SOUNDS/buy.mp3"),
    win: new Audio("assets/SOUNDS/win.mp3")
};

const clickSFX = new Audio("assets/SOUNDS/clicklucky.mp3");
clickSFX.volume = 1.0;
clickSFX.preload = "auto";
clickSFX.load();

function playSound(name, customVolume = 1.0) {
    if (!soundsEnabled || !sounds[name]) return;

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
    setTimeout(() => { boot.remove(); }, 1300);
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
                }, 400);
            }
        }, 30);
    });
}

// ===== WINDOW SYSTEM =====
function focusWindow(win) {
    highestZ++;
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
function addToTaskbar(name, win) {
    let existing = document.querySelector(`[data-task="${name}"]`);
    if (existing) return;

    const item = document.createElement("div");
    item.className = "task-item";
    item.dataset.task = name;

    // První písmeno velké
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    item.innerHTML = `
        <img src="assets/${name}.gif" style="width:16px" onerror="this.src='assets/default.gif'">
        <span>${capitalizedName}</span>
    `;

    item.onclick = () => {
        win.style.display = (win.style.display === "none") ? "flex" : "none";
        if(win.style.display === "flex") win.style.zIndex = Date.now();
    };

    taskbar.appendChild(item);
}

// CLOSE & MINIMIZE
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close-btn")) {
        const win = e.target.closest(".window");
        const id = win.id.replace("-window", "");
        win.style.display = "none";
        win.classList.add("hidden");
        const task = document.querySelector(`[data-task="${id}"]`);
        if (task) task.remove();
        if (id === "game") snakeGame.active = false; // Stop snake
    }
    if (e.target.classList.contains("min-btn")) {
        e.target.closest(".window").style.display = "none";
    }
});

// ===== 2) SECRET & ERROR BOX =====
function checkSecret() {
    const val = document.getElementById("secret-input").value.trim().toUpperCase();
    if (val === "") return;

    // Tady si nastav svoje heslo
    if (val === "C7LOVE") {
        playSound("success");
        document.getElementById("secret-content").style.display = "block";
        document.getElementById("secret-input").parentElement.style.display = "none";
    } else {
        playSound("error");
        document.getElementById("error-box").classList.remove("hidden");
    }
}

function closeError() {
    const errorBox = document.getElementById("error-box");
    if(errorBox) errorBox.classList.add("hidden");
}

// ===== 5) SETTINGS & SOUNDS =====
function setWallpaper(name) {
    document.getElementById("wallpaper").style.backgroundImage =
        `url(assets/WALLPAPERS/${name})`;

    localStorage.setItem("wallpaper", name);

    document.querySelectorAll(".wp-preview").forEach(el => {
        el.classList.remove("selected");
    });

    document.querySelector(`[data-wallpaper="${name}"]`)
        .classList.add("selected");
}

function toggleAllSounds() {
    soundsEnabled = !soundsEnabled;
    const btn = document.getElementById("sound-toggle-btn");
    if(btn) btn.textContent = soundsEnabled ? "Sounds: ON" : "Sounds: OFF";
}

// ===== 6) SNAKE GAME =====
let canvas = document.getElementById("gameCanvas");
let ctx = canvas ? canvas.getContext("2d") : null;
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 1, dy = 0;

function startSnakeGame() {
    snakeGame.active = true;
    snakeGame.score = 0;
    snake = [{ x: 10, y: 10 }];
    dx = 1; dy = 0;
    document.getElementById("snake-menu").style.display = "none";
    gameLoop();
}

function gameLoop() {
    if (!snakeGame.active) return;

    let head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Wall collision
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        snakeGame.active = false;
        alert("Game Over! Score: " + snakeGame.score);
        document.getElementById("snake-menu").style.display = "block";
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        snakeGame.score++;
        food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
        if (snakeGame.score === 10) {
            alert("Hint: VE ❤️");
        }
    } else {
        snake.pop();
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "lime";
    snake.forEach(s => ctx.fillRect(s.x * 15, s.y * 15, 14, 14));
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 15, food.y * 15, 14, 14);

    setTimeout(gameLoop, 100);
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
        clickSFX.pause();
        clickSFX.currentTime = 0;
        clickSFX.play();
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
    { title: "Mamma Mia", file: "assets/SONGS/song1.mp3" },
    { title: "Stayin Alive", file: "assets/SONGS/song2.mp3" }
];

function startSongGame() {
    currentSong = 0;
    songScore = 0;
    showSong();
}

function showSong() {
    const audio = document.getElementById("game-audio");
    audio.src = playlist[currentSong].file;
    document.getElementById("song-play-screen").classList.remove("hidden");
}

function submitSong() {
    const input = document.getElementById("song-input").value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const correct = playlist[currentSong].title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (input === correct) songScore++;
    
    currentSong++;
    if (currentSong < playlist.length) {
        showSong();
    } else {
        const result = (songScore / playlist.length) * 100;
        let msg = `Game Over! Score: ${result}%`;
        if (result >= 80) msg += " - Code part: FOREVER";
        alert(msg);
    }
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
        
        // Výpočet, kde přesně jsme okno chytli
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

    // Nová pozice podle pohybu myši
    let x = e.clientX - offset.x;
    let y = e.clientY - offset.y;

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