/*=========================================================
    APP.JS  —  Config + Scene Engine only
    Scene logic lives in scenes.js
=========================================================*/

const CONFIG = {
    HER_NAME   : "Her Name",   /* ← change this */
    ANSWER_ONE : "3rd_person", /* ← answer to question 1 */
    ANSWER_TWO : "8th_grader"  /* ← answer to question 2 */
};

const DEBUG = false;
const AUTH_SESSION_KEY = "birthday-auth-verified";

/*----- Root mount point -----*/
const app = document.getElementById("app");

/*----- Scene order (remove a name to skip that scene) -----*/
const SCENES = [
    "auth",
    "loading",
    "intro",
    "birthday",
    "mission",
    "cards",
    "night",
    "cake",
    "ending",
    "terminal",
    "memory"
];

let currentScene = 0;

function isAuthVerified(){
    return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
}

function markAuthVerified(){
    sessionStorage.setItem(AUTH_SESSION_KEY, "true");
}

function getInitialSceneIndex(){
    return isAuthVerified() ? 1 : 0;
}

function restartExperience(){
    document.body.classList.remove("memory-zooming");
    const overlay = document.getElementById("restartOverlay");
    if(!overlay){
        const el = document.createElement("div");
        el.id = "restartOverlay";
        el.className = "restartOverlay";
        document.body.appendChild(el);
        requestAnimationFrame(() => { el.style.opacity = "1"; });
    } else {
        overlay.style.opacity = "1";
        overlay.style.display = "block";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
        clearScene();
        currentScene = getInitialSceneIndex();
        renderScene();
        const el = document.getElementById("restartOverlay");
        if(el){
            el.style.opacity = "0";
            setTimeout(() => { el.style.display = "none"; }, 480);
        }
    }, 420);
}

window.addEventListener("load", () => {
    hideBootLoader();
    gotoScene(getInitialSceneIndex());
});

/*=========================================================
    BOOT LOADER
=========================================================*/
function hideBootLoader(){
    const el = document.getElementById("boot-loader");
    if(!el) return;
    el.style.transition = "opacity 0.6s";
    el.style.opacity    = "0";
    setTimeout(() => el.style.display = "none", 700);
}

/*=========================================================
    SCENE ENGINE
=========================================================*/
function gotoScene(index){
    if(index < 0 || index >= SCENES.length) return;
    clearScene();
    currentScene = index;
    if(DEBUG) console.log("▶ Scene:", SCENES[index]);
    renderScene();
}

function nextScene(){ gotoScene(currentScene + 1); }

function clearScene(){ app.innerHTML = ""; }

function renderScene(){
    switch(SCENES[currentScene]){
        case "auth":     showAuthentication(); break;
        case "loading":  showUniverse();       break;
        case "intro":    showIntro();          break;
        case "birthday": showBirthday();       break;
        case "mission":  showMission();        break;
        case "cards":    showCards();          break;
        case "night":    showNight();          break;
        case "cake":     showCake();           break;
        case "ending":   showEnding();         break;
        case "terminal": showTerminal();       break;
        case "memory":   showMemory();         break;
    }
}

/*=========================================================
    UTILITY
=========================================================*/
function wait(ms){ return new Promise(r => setTimeout(r, ms)); }



function openSecretDocument() {

    showLoadingOverlay([
        "Decrypting archive...",
        "Establishing secure channel...",
        "Verifying archive integrity...",
        "Preparing document..."
    ]);

    // Simulate a short delay for the loading animation to be appreciated
    setTimeout(() => {
        const pdfURL = "assets/fonts/.cache/.internal/.glyphmap/a7f0b91e/test.pdf";
        hideLoadingOverlay();
        showPdfViewer(pdfURL);
    }, 1500);

}

function showPdfViewer(url) {
    let overlay = document.getElementById("pdfOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "pdfOverlay";
        document.body.appendChild(overlay);

        overlay.innerHTML = `
            <button id="closePdf">✕</button>
            <iframe id="pdfFrame"></iframe>
        `;

        overlay.querySelector("#closePdf").addEventListener("click", closePdfViewer);

        overlay.addEventListener("click", (e) => {
            if (e.target.id === "pdfOverlay") {
                closePdfViewer();
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.getElementById("pdfOverlay").classList.contains("visible")) {
                closePdfViewer();
            }
        });
    }

    const frame = overlay.querySelector("#pdfFrame");
    frame.src = url;
    overlay.classList.add("visible");
    // Hide memory book or other content if necessary
    const mainContent = document.getElementById("app");
    if(mainContent) mainContent.style.display = 'none';
}

function closePdfViewer() {
    const overlay = document.getElementById("pdfOverlay");
    if (overlay) {
        const frame = overlay.querySelector("#pdfFrame");
        frame.src = "";
        overlay.classList.remove("visible");
        // Show memory book or other content again
        const mainContent = document.getElementById("app");
        if(mainContent) mainContent.style.display = '';
    }
}