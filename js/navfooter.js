// Menu, profile & feed
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navbar = document.querySelector(".navbar");

    const user = document.getElementById("profile");
    const user_navbar = document.getElementById("profileNavbar");

    const feedBell = document.getElementById("feedBell");
    const feedPanel = document.getElementById("feedPanel");
    const feedBadge = document.getElementById("feedBadge");

    function closeAllMenus() {
        if (navbar) navbar.classList.remove("active");
        if (user_navbar) user_navbar.classList.remove("active");
        if (feedPanel) feedPanel.style.display = "none";
    }

    // HAMBURGER
    hamburger?.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = navbar.classList.contains("active");
        closeAllMenus();
        if (!isOpen) navbar.classList.add("active");
    });

    // PROFILE
    user?.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = user_navbar.classList.contains("active");
        closeAllMenus();
        if (!isOpen) user_navbar.classList.add("active");
    });

    // FEED
    feedBell?.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = feedPanel.style.display === "flex";
        closeAllMenus();

        if (!isOpen) {
            feedPanel.style.display = "flex";

            // označit jako přečtené
            if (feedBadge) feedBadge.style.display = "none";
            const storedFeed = JSON.parse(sessionStorage.getItem('quizFeed') || '[]');
            storedFeed.forEach(item => item.isNew = false);
            saveFeedToStorage(storedFeed);
        }
    });

    // klik mimo
    document.addEventListener("click", () => {
        closeAllMenus();
    });
});

// Scroll navbar
document.addEventListener("DOMContentLoaded", () => {

    let lastScroll = 0;
    const navbar = document.querySelector(".header");

    window.addEventListener("scroll", () => {

        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll + 5) {
            navbar.classList.add("hidden");
        }

        if (currentScroll < lastScroll - 5) {
            navbar.classList.remove("hidden");
        }

        lastScroll = currentScroll;
    });

});

function loadInit(dots){
    dots = "../".repeat(dots);
    const header = `
    <header class="header">
        <div class="header-left">
            <div class="hamburger tooltip">
                <i class="fa-solid fa-bars"></i>
                <span class="tooltip-text">Nabídka</span>
            </div>

            <nav id="hamburgerNavbar" class="navbar">
                <a href="/courses">Kurzy</a>
                <a href="/#faq">FAQ</a>
                <a href="/contacts">Kontakty</a>
            </nav>

            <a href="/"><img src="${dots}assets/TDA_Full_White.png" class="logoimg" alt="TDA Logo"></a>
        </div>

        <div class="header-right">
            <div class="feed-icon tooltip" id="feedBell">
                <i class="fa-solid fa-bell"></i>
                <span class="tooltip-text">Feed</span>
                <span id="feedBadge" class="feed-badge" style="display:none;"></span>
            </div>
            <div id="feedPanel" class="feed-dropdown">
                <div id="feedContent" class="feed-dropdown-content">
                    <p class="feed-empty">Žádné zprávy</p>
                </div>
            </div>

            <div class="profile-icon tooltip" id="profile">
                <i class="fa-solid fa-user"></i>
                <span class="tooltip-text">Profil</span>
            </div>
        </div>

        <nav id="profileNavbar" class="navbar profile-menu">
            <a href="/login">Přihlásit se</a>
        </nav>
    </header>
    `;

    const footer = `
    <footer class="footer">
        <div class="footer-top">
            <a href="/" class="footer-logo-link">
                <img src="${dots}assets/TDA_Full_White.png" class="footerlogo" alt="TDA Logo">
            </a>
            <div class="fcontent">
                <a href="https://www.instagram.com/"><i class="fa-brands fa-instagram"></i>Instagram</a>
                <a href="https://www.youtube.com/"><i class="fa-brands fa-youtube"></i>YouTube</a>
                <a href="https://www.x.com/"><i class="fa-brands fa-x-twitter"></i>Twitter</a>
            </div>
        </div>
        <div class="footer-links">
            <a href="/privacy-policy">Ochrana osobních údajů</a>
            <a href="/terms-of-services">Podmínky služby</a>
            <a href="/cookies-policy">Cookies</a>
            <a href="/contacts">Kontakt</a>
        </div>
        <p>© 2026 Think different Academy. Všechna práva vyhrazena.</p>
    </footer>
    `;

    const page_wrapper = document.getElementsByClassName("page-wrapper")[0];
    page_wrapper.insertAdjacentHTML("afterbegin", header);
    page_wrapper.insertAdjacentHTML("beforeend", footer);
}

loadInit(1);