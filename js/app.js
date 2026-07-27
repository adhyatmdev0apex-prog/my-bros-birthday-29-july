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

/*=========================================================
    ARCHIVE READER
=========================================================*/
function openSecretDocument() {
    showLoadingOverlay([
        "Decrypting archive...",
        "Establishing secure channel...",
        "Verifying archive integrity...",
        "Preparing document..."
    ]);

    // Delay to allow loading animation to be appreciated
    setTimeout(() => {
        hideLoadingOverlay();
        showPdfViewer();
    }, 2500); 
}

const pdfReaderState = {
    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
};

async function showPdfViewer() {
    const overlay = document.getElementById("pdfReader");
    overlay.classList.remove("hidden");

    // Show app content again when closing, if it was hidden
    const mainContent = document.getElementById("app");
    if(mainContent) mainContent.style.display = 'none';

    const url = 'assets/fonts/.cache/.internal/.glyphmap/a7f0b91e/test.pdf';
    const { pdfjsLib } = globalThis;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `js/pdfjs/pdf.worker.mjs`;

    try {
        const loadingTask = pdfjsLib.getDocument(url);
        pdfReaderState.pdfDoc = await loadingTask.promise;
        document.getElementById('pdfReaderPageNum').textContent = `1 / ${pdfReaderState.pdfDoc.numPages}`;
        renderPage(pdfReaderState.pageNum);
    } catch (reason) {
        console.error(reason);
        alert("Error: Could not load the document.");
        closePdfViewer();
    }
    
    setupPdfReaderEventListeners();
}

function renderPage(num) {
    pdfReaderState.pageRendering = true;
    
    pdfReaderState.pdfDoc.getPage(num).then((page) => {
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2.0 }); // High-res rendering

        // Match canvas size to page size for clarity
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 
            ? [outputScale, 0, 0, outputScale, 0, 0] 
            : null;

        const renderContext = {
            canvasContext: ctx,
            transform: transform,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(() => {
            pdfReaderState.pageRendering = false;
            if (pdfReaderState.pageNumPending !== null) {
                renderPage(pdfReaderState.pageNumPending);
                pdfReaderState.pageNumPending = null;
            }
            updatePageNum();
            updateNavButtons();
        });
    });
}


function queueRenderPage(num) {
    if (pdfReaderState.pageRendering) {
        pdfReaderState.pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pdfReaderState.pageNum <= 1) return;
    pdfReaderState.pageNum--;
    queueRenderPage(pdfReaderState.pageNum);
}

function onNextPage() {
    if (pdfReaderState.pageNum >= pdfReaderState.pdfDoc.numPages) return;
    pdfReaderState.pageNum++;
    queueRenderPage(pdfReaderState.pageNum);
}

function updatePageNum() {
    document.getElementById('pdfReaderPageNum').textContent = `${pdfReaderState.pageNum} / ${pdfReaderState.pdfDoc.numPages}`;
}

function updateNavButtons() {
    document.getElementById('pdfReaderPrev').disabled = (pdfReaderState.pageNum <= 1);
    document.getElementById('pdfReaderNext').disabled = (pdfReaderState.pageNum >= pdfReaderState.pdfDoc.numPages);
}

function closePdfViewer() {
    const overlay = document.getElementById("pdfReader");
    overlay.classList.add("hidden");

    // Clean up
    if (pdfReaderState.pdfDoc) {
        pdfReaderState.pdfDoc.destroy();
        pdfReaderState.pdfDoc = null;
    }
    pdfReaderState.pageNum = 1;

    // Show app content again
    const mainContent = document.getElementById("app");
    if(mainContent) mainContent.style.display = '';
}

function setupPdfReaderEventListeners() {
    document.getElementById('pdfReaderClose').addEventListener('click', closePdfViewer);
    document.getElementById('pdfReaderPrev').addEventListener('click', onPrevPage);
    document.getElementById('pdfReaderNext').addEventListener('click', onNextPage);
    
    // Keyboard navigation
    window.addEventListener('keydown', handlePdfReaderKeyDown);

    // Swipe navigation
    let touchstartX = 0;
    let touchendX = 0;
    const canvas = document.getElementById('pdfCanvas');

    canvas.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    canvas.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchendX < touchstartX - 50) { // Swiped left
            onNextPage();
        }
        if (touchendX > touchstartX + 50) { // Swiped right
            onPrevPage();
        }
    }
}

function handlePdfReaderKeyDown(e) {
    const overlay = document.getElementById("pdfReader");
    if(overlay.classList.contains('hidden')) return;

    if (e.key === "ArrowLeft") {
        onPrevPage();
    } else if (e.key === "ArrowRight") {
        onNextPage();
    } else if (e.key === "Escape") {
        closePdfViewer();
    }
}
