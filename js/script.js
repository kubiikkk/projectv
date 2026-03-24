// Starting animation
window.addEventListener("load", () => {
    const boot = document.getElementById("boot-screen");
    const screen = document.querySelector(".wscreen");

    boot.style.animation = "flash 0.3s ease";

    setTimeout(() => {
        boot.style.animation = "crt-on 1s ease forwards";
    }, 300);

    setTimeout(() => {
        screen.style.opacity = "1";
    }, 800);

    setTimeout(() => {
        boot.remove();
    }, 1300);
});

// Loading + main menu
const startButton = document.getElementById("start-button");
const startText = document.getElementById("start-text");
const startIcon = document.getElementById("start-icon");

const loadingContainer = document.getElementById("loading-container");
const loadingBar = document.getElementById("loading-bar");

const bootScreen = document.getElementById("boot-screen");
const mainMenu = document.getElementById("main-menu");

const loadingTexts = [
    "Loading memories...",
    "Initializing love.exe",
    "Syncing hearts...",
    "Decrypting feelings...",
    "Almost there...",
    "Finalizing..."
];

startButton.addEventListener("click", () => {

    startIcon.style.display = "none";
    startText.textContent = "";

    loadingContainer.style.display = "block";

    let progress = 0;

    const textInterval = setInterval(() => {
        const random = Math.floor(Math.random() * loadingTexts.length);
        startText.textContent = loadingTexts[random];
    }, 400);

    const interval = setInterval(() => {
        progress += 2;
        loadingBar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);
            clearInterval(textInterval);

            startText.textContent = "Done <3";

            document.body.style.background = "black";

            setTimeout(() => {
                bootScreen.style.display = "none";
                mainMenu.style.display = "flex";

            }, 400);
        }

    }, 60);
});

// Draggable window
const windowEl = document.getElementById("window");
const header = document.getElementById("window-header");

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    windowEl.style.position = "absolute";
    windowEl.style.left = (e.clientX - offsetX) + "px";
    windowEl.style.top = (e.clientY - offsetY) + "px";
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Close + Min button
function checkAllClosed() {
    const windows = document.querySelectorAll(".window");

    let anyVisible = false;

    windows.forEach(win => {
        if (win.style.display !== "none") {
            anyVisible = true;
        }
    });

    if (!anyVisible) {
        document.getElementById("main-menu").style.display = "none";
        document.getElementById("boot-screen").style.display = "block";

        startText.textContent = "START AGAIN?";
        startIcon.style.display = "inline";
        startIcon.textContent = "›";

        loadingBar.style.width = "0%";
        loadingContainer.style.display = "none";
    }
}

document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {

        const win = e.target.closest(".window");

        win.style.display = "none";

        checkAllClosed();
    });
});

document.querySelectorAll(".min-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {

        const win = e.target.closest(".window");

        win.style.display = "none";
    });
});

// Double click on icons
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("dblclick", () => {
        const name = icon.dataset.window;
        openWindow(name);
    });
});

// Opening other windows
function openWindow(name) {
    const win = document.getElementById(name + "-window");

    win.style.display = "block";

    addToTaskbar(name, win);
}

// Taskbar
const taskbar = document.getElementById("taskbar-items");

function addToTaskbar(name, win) {
    const item = document.createElement("div");
    item.className = "task-item";
    item.textContent = name;

    item.onclick = () => {
        win.style.display = "block";
    };

    taskbar.appendChild(item);
}