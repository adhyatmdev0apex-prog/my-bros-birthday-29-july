/*=========================================================
    SCENES.JS  —  All scene logic
    Depends on: animations.js (typeWriter, fadeIn, fadeOut,
    random, createStar, createCloud, changeSky, clearClouds)
    and audio.js (playBirthdaySong)
=========================================================*/

/*----- Template Engine -----*/
function loadTemplate(id){
    const t = document.getElementById(id);
    if(!t){ console.error("Missing template:", id); return; }
    app.appendChild(t.content.cloneNode(true));
}

/*=========================================================
    AUTH
=========================================================*/
function showAuthentication(){
    if(isAuthVerified()){
        currentScene = 1;
        renderScene();
        return;
    }

    loadTemplate("auth-template");

    const btn = document.getElementById("verifyButton");
    btn.addEventListener("click", verifyIdentity);
    document.getElementById("answerTwo")
        .addEventListener("keypress", e => { if(e.key==="Enter") verifyIdentity(); });
}

function verifyIdentity(){
    const a1  = document.getElementById("answerOne").value.trim();
    const a2  = document.getElementById("answerTwo").value.trim();
    const msg = document.getElementById("statusText");

    if(a1 === CONFIG.ANSWER_ONE && a2 === CONFIG.ANSWER_TWO){
        markAuthVerified();
        msg.textContent = "Identity Verified ✓";
        msg.style.color = "#90ff9d";
        setTimeout(nextScene, 1200);
    } else {
        msg.textContent = "Incorrect. Try again.";
        msg.style.color = "#ff7777";
        document.getElementById("answerOne").value = "";
        document.getElementById("answerTwo").value = "";
    }
}

/*=========================================================
    UNIVERSE LOADING
=========================================================*/
const UNIVERSE_SEQ = [
    { text:"Booting Reality Engine...",        speed:30, pause:800,  stars:8  },
    { text:"Initializing Universe...",         speed:25, pause:700,  stars:12 },
    { text:"Loading Constellations...",        speed:25, pause:800,  stars:20 },
    { text:"Synchronizing Moon Phase...",      speed:30, pause:600,  stars:12 },
    { text:"Checking Time...",                 speed:30, pause:700,  stars:8  },
    { text:"Date Verified",                    speed:50, pause:300,  stars:0  },
    { text:"29 July",                          speed:90, pause:900,  stars:0  },
    { text:"Searching...",                     speed:20, pause:900,  stars:0  },
    { text:"Target Located",                   speed:18, pause:1500, stars:25 },
    { text:"Preparing Birthday Experience...", speed:25, pause:900,  stars:15 },
    { text:"Welcome.",                         speed:45, pause:1200, stars:0  }
];

function showUniverse(){
    loadTemplate("loading-template");
    _runUniverse();
}

async function _runUniverse(){
    const out = document.getElementById("terminalOutput");
    out.innerHTML = "";

    for(const line of UNIVERSE_SEQ){
        const p = document.createElement("p");
        out.appendChild(p);
        out.scrollTop = out.scrollHeight;
        await typeWriter(p, line.text, line.speed);
        for(let i = 0; i < line.stars; i++) createStar();
        await wait(line.pause);
    }
    nextScene();
}

/*=========================================================
    INTRO
=========================================================*/
function showIntro(){
    loadTemplate("intro-template");
    _runIntro();
}

async function _runIntro(){
    changeSky("morning");
    for(let i = 0; i < 5; i++) createCloud();

    document.getElementById("heroName").textContent = CONFIG.HER_NAME;

    const [l1, l2, l3] = ["introLine1","introLine2","introLine3"]
        .map(id => document.getElementById(id));

    await wait(800);
    fadeIn(l1);
    await wait(2400);  fadeOut(l1);
    await wait(900);   fadeIn(l2);
    await wait(2400);  fadeOut(l2);
    await wait(900);   fadeIn(l3);
    await wait(3000);
    nextScene();
}

/*=========================================================
    BIRTHDAY
=========================================================*/
function showBirthday(){
    loadTemplate("birthday-template");
    _runBirthday();
}

async function _runBirthday(){
    changeSky("morning");

    const nameEl = document.querySelector(".birthdayScene .heroName");
    if(nameEl) nameEl.textContent = CONFIG.HER_NAME;

    const kids = Array.from(document.querySelector(".birthdayContainer").children);
    kids.forEach(c => { c.style.opacity = "0"; c.style.transform = "translateY(24px)"; });

    await wait(400);
    for(const c of kids){
        c.style.transition = "opacity 0.7s, transform 0.7s";
        c.style.opacity    = "1";
        c.style.transform  = "translateY(0)";
        await wait(520);
    }
    await wait(3200);
    nextScene();
}

/*=========================================================
    MISSION
=========================================================*/
function showMission(){
    loadTemplate("mission-template");
    _runMission();
}

async function _runMission(){
    changeSky("sunset");

    const gift   = document.querySelector(".giftBox");
    const card   = document.querySelector(".missionCard");
    const items  = card ? card.querySelectorAll("li") : [];
    const btn    = card ? card.querySelector(".acceptBtn") : null;

    /* hide card and button initially (defensive: elements may be missing) */
    if(card){
        card.style.cssText += "display:none;opacity:0;transform:scale(0.85);";
    }
    if(btn){ btn.style.opacity  = "0"; }
    if(items && items.length){ items.forEach(li => { li.style.opacity = "0"; li.style.transform = "translateX(-20px)"; }); }

    /* helper to reveal the card (used by click or fallback) */
    const revealCard = async () => {
        if(gift){
            try{ gift.style.animation = "giftPop 0.4s ease forwards"; }catch(e){}
            await wait(420);
            try{ gift.style.display = "none"; }catch(e){}
        }

        if(card){
            card.style.display    = "block";
            await wait(30);
            card.style.transition = "opacity 0.6s, transform 0.6s";
            card.style.opacity    = "1";
            card.style.transform  = "scale(1)";
        }

        if(items && items.length){
            for(const item of items){
                await wait(480);
                item.style.transition = "opacity 0.5s, transform 0.5s";
                item.style.opacity    = "1";
                item.style.transform  = "translateX(0)";
            }
        }

        if(btn){
            await wait(600);
            btn.style.transition = "opacity 0.5s";
            btn.style.opacity    = "1";
            btn.addEventListener("click", nextScene);
        } else {
            /* if no button, proceed automatically */
            setTimeout(nextScene, 1200);
        }
    };

    if(gift){
        gift.addEventListener("click", function once(){
            gift.removeEventListener("click", once);
            revealCard();
        });
    } else {
        /* no gift element: reveal immediately */
        revealCard();
    }
}

/*=========================================================
    CARDS
=========================================================*/
const CARDS_DATA = [
    { icon:"🌸", title:"Keep Smiling",             back:"Your smile is someone's favourite thing about you."       },
    { icon:"✨", title:"Dream Bigger",              back:"The universe has no ceiling. Neither should your dreams." },
    { icon:"🌍", title:"Travel Somewhere Amazing",  back:"The world is a book — read a new chapter this year."     },
    { icon:"🎂", title:"Today Is Yours",            back:"Own every moment of today. You deserve it."              }
];

function showCards(){
    loadTemplate("cards-template");
    _runCards();
}

async function _runCards(){
    changeSky("sunset");

    const wrap = document.querySelector(".cardsScene");
    wrap.innerHTML = "";

    /* Build flip cards */
    for(const d of CARDS_DATA){
        const card = document.createElement("div");
        card.className = "flipCard";
        card.innerHTML = `
          <div class="flipCardInner">
            <div class="flipFront"><span class="cardIcon">${d.icon}</span><h2>${d.title}</h2></div>
            <div class="flipBack"><p>${d.back}</p></div>
          </div>`;
        card.addEventListener("click", () => card.classList.toggle("flipped"));
        /* entrance: start hidden, stagger in */
        card.style.opacity   = "0";
        card.style.transform = "translateY(20px)";
        wrap.appendChild(card);
    }

    /* Stagger cards in */
    const cards = wrap.querySelectorAll(".flipCard");
    await wait(300);
    for(const c of cards){
        c.style.transition = "opacity 0.5s, transform 0.5s";
        c.style.opacity    = "1";
        c.style.transform  = "translateY(0)";
        await wait(180);
    }

    /* Hint */
    const hint = document.createElement("p");
    hint.className   = "cardsHint";
    hint.textContent = "Tap a card to reveal ✦";
    hint.style.opacity = "0";
    wrap.appendChild(hint);
    await wait(400);
    hint.style.transition = "opacity 0.6s";
    hint.style.opacity    = "1";

    /* Continue button after 7 s */
    await wait(7000);
    const nextBtn = document.createElement("button");
    nextBtn.className   = "acceptBtn";
    nextBtn.textContent = "Continue →";
    nextBtn.style.cssText = "opacity:0;transition:opacity 0.5s;";
    wrap.appendChild(nextBtn);
    await wait(50);
    nextBtn.style.opacity = "1";
    nextBtn.addEventListener("click", nextScene);
}

/*=========================================================
    NIGHT
=========================================================*/
function showNight(){
    loadTemplate("night-template");
    _runNight();
}

async function _runNight(){
    changeSky("night");
    clearClouds();

    /* Dense star field */
    const sl = document.getElementById("starsLayer");
    sl.innerHTML = "";
    for(let i = 0; i < 90; i++) createStar();

    const area = document.getElementById("shootingStarArea");
    const msg  = document.querySelector(".nightMessage");
    msg.style.opacity = "0";

    /* First auto shooting star */
    await wait(1500);
    _shootingStar(area);

    await wait(2000);
    msg.style.transition = "opacity 1.2s";
    msg.style.opacity    = "1"; // Text appears here
    await wait(500); // Wait 0.5s
    _revealConstellationHeart(); // Then reveal heart

    /* Tap = another star */
    area.addEventListener("click", () => _shootingStar(area));

    /* Continue button */
    await wait(5000);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className   = "nightBtn";
    btn.textContent = "Continue →";
    btn.style.cssText = "opacity:0;transition:opacity 0.6s;";
    document.querySelector(".nightScene").appendChild(btn);
    await wait(50);
    btn.style.opacity = "1";
    btn.addEventListener("click", nextScene);
}

function _shootingStar(container){
    const star = document.createElement("div");
    star.className = "shootingStar";
    star.style.left = random(5, 75) + "vw";
    star.style.top  = random(5, 35) + "vh";
    container.appendChild(star);
    setTimeout(() => star.remove(), 1000);
}

function _revealConstellationHeart(){
    const moon = document.getElementById("moonLayer");
    if(!moon) return;

    const heart = document.createElement("div");
    heart.className = "constellationHeart";
    heart.setAttribute("aria-hidden", "true");
    heart.innerHTML = `
      <svg viewBox="0 0 160 140" focusable="false">
        <path class="heartPath" d="M80 122 C42 92 18 69 22 42 C25 20 54 14 80 43 C106 14 135 20 138 42 C142 69 118 92 80 122 Z" />
        <circle class="heartStar" cx="80" cy="122" r="2.3" />
        <circle class="heartStar" cx="48" cy="96" r="1.8" />
        <circle class="heartStar" cx="25" cy="57" r="2.1" />
        <circle class="heartStar" cx="38" cy="24" r="1.7" />
        <circle class="heartStar" cx="80" cy="43" r="2.2" />
        <circle class="heartStar" cx="122" cy="24" r="1.7" />
        <circle class="heartStar" cx="135" cy="57" r="2.1" />
        <circle class="heartStar" cx="112" cy="96" r="1.8" />
        <circle class="heartStar" cx="80" cy="82" r="1.3" />
      </svg>`;
    moon.appendChild(heart);
    setTimeout(() => heart.remove(), 3000);
}

/*=========================================================
    CAKE
=========================================================*/
function showCake(){
    loadTemplate("cake-template");
    _runCake();
}

async function _runCake(){
    changeSky("night");

    document.getElementById("cake3D").innerHTML = `
      <div class="cake">
        <div class="cake-top">
          <div class="candle"><div class="flame"></div></div>
          <div class="candle"><div class="flame"></div></div>
          <div class="candle"><div class="flame"></div></div>
        </div>
        <div class="cake-mid"></div>
        <div class="cake-bot"></div>
        <div class="cake-plate"></div>
      </div>`;

    const btn = document.getElementById("cakeButton");
    let fired = false;

    btn.addEventListener("click", async function(){
        if(fired) return;
        fired = true;

        playBirthdaySong();
        _launchConfetti();

        btn.textContent  = "🎉 Happy Birthday! 🎉";
        btn.style.cursor = "default";

        await wait(1000);
        _launchFireworks();

        await wait(8000);
        nextScene();
    });
}

function _launchConfetti(){
    const layer  = document.getElementById("confetti-layer");
    layer.innerHTML = "";
    const colors = ["#FFD166","#ffc9f4","#CDB4FF","#6FA8FF","#90ff9d","#ff8f70"];

    for(let i = 0; i < 120; i++){
        const p = document.createElement("div");
        p.className = "confettiPiece";
        p.style.left              = random(0,100)    + "vw";
        p.style.background        = colors[Math.floor(random(0,colors.length))];
        p.style.animationDelay    = random(0,2)      + "s";
        p.style.animationDuration = random(2,4)      + "s";
        p.style.width             = random(6,12)     + "px";
        p.style.height            = random(6,12)     + "px";
        p.style.borderRadius      = Math.random()>.5 ? "50%" : "2px";
        layer.appendChild(p);
    }
    setTimeout(() => layer.innerHTML = "", 5000);
}

function _launchFireworks(){
    const layer = document.getElementById("fireworks-layer");
    let n = 0;
    const iv = setInterval(() => {
        _spawnFirework(layer);
        if(++n >= 12) clearInterval(iv);
    }, 500);
}

function _spawnFirework(layer){
    const x = random(10,90), y = random(10,60);
    for(let i = 0; i < 16; i++){
        const s = document.createElement("div");
        s.className = "fireworkSpark";
        const angle = (i/16)*360;
        const dist  = random(40,90);
        s.style.left       = x + "vw";
        s.style.top        = y + "vh";
        s.style.setProperty("--dx", Math.cos(angle*Math.PI/180)*dist + "px");
        s.style.setProperty("--dy", Math.sin(angle*Math.PI/180)*dist + "px");
        s.style.background = `hsl(${random(0,360)},90%,70%)`;
        layer.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

/*=========================================================
    ENDING
=========================================================*/
function showEnding(){
    loadTemplate("ending-template");
    _runEnding();
}

async function _runEnding(){
    changeSky("night");

    const nameEl = document.querySelector(".endingScene .endingName");
    if(nameEl) nameEl.textContent = CONFIG.HER_NAME;

    const blocks = document.querySelectorAll(".endingScene .endBlock");
    blocks.forEach(b => { b.style.opacity = "0"; b.style.transform = "translateY(16px)"; });

    await wait(600);
    for(const b of blocks){
        b.style.transition = "opacity 1s, transform 1s";
        b.style.opacity    = "1";
        b.style.transform  = "translateY(0)";
        await wait(2800);
    }

    await wait(900);
    nextScene();
}

/*=========================================================
    TERMINAL
=========================================================*/
function showTerminal(){
    loadTemplate("final-template");
    _runTerminal();
}

async function _runTerminal(){
    changeSky("night");

    const termBox    = document.querySelector(".terminalBox");
    const codeLines  = document.getElementById("codeLines");
    const successMsg = document.getElementById("successMsg");
    const eot        = document.getElementById("endOfTransmission");
    const appRoot    = document.getElementById("app");
    const scene      = document.querySelector(".finalScene");

    if(!termBox || !codeLines || !successMsg || !eot || !appRoot) return;

    [termBox, successMsg, eot].forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(12px)";
    });

    if(scene){
        scene.style.transition = "opacity 0.8s";
        scene.style.opacity = "1";
    }

    const startSequence = async function(){
        termBox.style.transition = "opacity 0.7s";
        termBox.style.opacity = "1";
        termBox.style.transform = "translateY(0)";

        const CODE = [
            'if(today == "29 July")',
            "{",
            "    happiness++;",
            "    smiles++;",
            "    cake++;",
            "}",
            "",
            'return "Happy Birthday.";'
        ];

        codeLines.innerHTML = "";
        for(const line of CODE){
            const div = document.createElement("div");
            div.className = "codeLine";
            codeLines.appendChild(div);
            if(line === "") { await wait(200); continue; }
            await typeWriter(div, line, 26);
            await wait(100);
        }

        await wait(700);

        successMsg.style.transition = "opacity 0.8s, transform 0.8s";
        successMsg.style.opacity = "1";
        successMsg.style.transform = "translateY(0)";

        await wait(1800);

        termBox.style.transition = "opacity 0.9s";
        successMsg.style.transition = "opacity 0.9s";
        termBox.style.opacity = "0";
        successMsg.style.opacity = "0";

        const overlay = document.createElement("div");
        overlay.className = "endingFadeOverlay";
        appRoot.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = "1"; });

        if(scene){
            scene.style.transition = "opacity 1s";
            scene.style.opacity = "1";
        }

        await wait(1200);

        eot.textContent = "END OF TRANSMISSION";
        eot.style.transition = "opacity 1s, transform 1s";
        eot.style.opacity = "1";
        eot.style.transform = "translateY(0)";

        await wait(1800);

        eot.style.opacity = "0";
        eot.style.transform = "translateY(-10px)";

        await wait(1200);
        nextScene();
    };

    await wait(400);
    await startSequence();
}

async function showLoadingOverlay(messages) {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    loadingOverlay.className = "loading-overlay";
    
    const terminalWindow = document.createElement("div");
    terminalWindow.className = "terminalWindow";
    
    const terminalOutput = document.createElement("div");
    terminalOutput.id = "terminalOutput";
    
    terminalWindow.appendChild(terminalOutput);
    loadingOverlay.appendChild(terminalWindow);
    document.body.appendChild(loadingOverlay);

    for (const line of messages) {
        const p = document.createElement("p");
        terminalOutput.appendChild(p);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        await typeWriter(p, line, 40);
        await wait(500);
    }
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
        loadingOverlay.classList.add("fading-out");
        setTimeout(() => loadingOverlay.remove(), 500);
    }
}

function requestDocumentAuthentication() {
    const modalContainer = document.createElement("div");
    modalContainer.className = "auth-modal-container";
    document.body.appendChild(modalContainer);

    const authTemplate = document.getElementById("auth-template").content.cloneNode(true);
    modalContainer.appendChild(authTemplate);

    const closeButton = document.createElement("button");
    closeButton.innerText = "×";
    closeButton.className = "auth-modal-close";
    modalContainer.querySelector(".glassCard").prepend(closeButton);

    const verifyButton = modalContainer.querySelector("#verifyButton");
    const answerOneInput = modalContainer.querySelector("#answerOne");
    const answerTwoInput = modalContainer.querySelector("#answerTwo");
    const statusText = modalContainer.querySelector("#statusText");

    const closeModal = () => {
        modalContainer.classList.add("fading-out");
        setTimeout(() => modalContainer.remove(), 500);
    };

    closeButton.addEventListener("click", closeModal);

    const verify = () => {
        const a1 = answerOneInput.value.trim();
        const a2 = answerTwoInput.value.trim();

        if (a1 === CONFIG.ANSWER_ONE && a2 === CONFIG.ANSWER_TWO) {
            statusText.textContent = "Identity Verified ✓";
            statusText.style.color = "#90ff9d";
            setTimeout(() => {
                closeModal();
                openSecretDocument();
            }, 800);
        } else {
            statusText.textContent = "Incorrect. Try again.";
            statusText.style.color = "#ff7777";
            answerOneInput.value = "";
            answerTwoInput.value = "";
        }
    };

    verifyButton.addEventListener("click", verify);
    answerTwoInput.addEventListener("keypress", e => {
        if (e.key === "Enter") verify();
    });
}

/*=========================================================
    MEMORY MODE
=========================================================*/
function showMemory(){
    _runMemory();
}

const MEMORY_PAGES = [
    { title:"Memory Book", kicker:"A Journey Through Time", body:"Open to revisit the memories captured within.", icon:"📖" },
    { title:"Authentication", kicker:"Chapter 01", body:"The doorway opened only for the right person.", icon:"✦" },
    { title:"Universe Initialization", kicker:"Chapter 02", body:"Reality booted, constellations loaded, the date aligned.", icon:"⌁" },
    { title:"Birthday Greeting", kicker:"Chapter 03", body:"Out of 8 billion people, today found one name.", icon:"✨" },
    { title:"Today's Mission", kicker:"Chapter 04", body:"Smile. Eat cake. Laugh a lot. Enjoy every moment.", icon:"✓" },
    { title:"Wishes Cards", kicker:"Chapter 05", body:"Small wishes folded into little cards of light.", icon:"◆" },
    { title:"Night Wish", kicker:"Chapter 06", body:"Some wishes did not need to be spoken.", icon:"☾" },
    { title:"Birthday Cake", kicker:"Chapter 07", body:"Candles, music, confetti, and a tiny universe celebrating.", icon:"♫" },
    { title:"Final Message", kicker:"Chapter 08", body:"The best gifts are sometimes made only with time.", icon:"❦" },
    {
        type: 'archive',
        title: "CONFIDENTIAL ARCHIVE",
        kicker: "Access Level: PERSONAL",
        body: "This document has been sealed.",
        note: "Some thoughts are easier to preserve than to say aloud. If you wish to continue, the archive is waiting."
    },
    { title:"Terminal", kicker:"Chapter 09", body:"Program executed successfully. End of transmission.", icon:"⌘" }
];

async function _runMemory(){
    changeSky("night");
    clearClouds();

    const initialPageIndex = parseInt(sessionStorage.getItem('memory-book-page-index') || '0', 10);
    const isReviewMode = sessionStorage.getItem('memory-book-open') === 'true';

    app.innerHTML = `
      <section class="scene memoryScene">
        <div class="memoryDarkHold"></div>
        <svg class="dateConstellation" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
        <div class="constellationTitle">29 JULY</div>
        <div class="memoryBookStage" aria-live="polite">
          <button class="bookArrow prevBookPage" aria-label="Previous page">‹</button>
          <div class="memoryBook"></div>
          <button class="bookArrow nextBookPage" aria-label="Next page">›</button>
        </div>
      </section>`;

    const scene = document.querySelector(".memoryScene");

    if (!isReviewMode) {
        await wait(5600);
        document.body.classList.add("memory-zooming");
        scene.classList.add("zoomingOut");
        await _formDateConstellation();
        await wait(4000);
        scene.classList.add("linesGone");
        await wait(1500);
    }
    
    _showMemoryBook(initialPageIndex, isReviewMode);
}

async function _formDateConstellation(){
    const stars = Array.from(document.querySelectorAll("#starsLayer .star"));
    const svg = document.querySelector(".dateConstellation");
    const title = document.querySelector(".constellationTitle");
    const usable = _selectCentralConstellationStars(stars, 16);
    const offsets = _constellationOffsets();

    usable.forEach((star, i) => {
        const offset = offsets[i % offsets.length];
        star.classList.add("memoryDateStar");
        star.style.transition = "transform 3.8s ease-in-out, opacity 1.6s ease, box-shadow 1.6s ease";
        star.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    });

    await wait(3900);
    const points = usable.map((star, i) => {
        const rect = star.getBoundingClientRect();
        const offset = offsets[i % offsets.length];
        return {
            x:((rect.left + rect.width / 2 + offset.x) / window.innerWidth) * 100,
            y:((rect.top + rect.height / 2 + offset.y) / window.innerHeight) * 100
        };
    });
    svg.innerHTML = _constellationSegments(usable.length)
        .map(([a,b]) => `<line x1="${points[a].x}" y1="${points[a].y}" x2="${points[b].x}" y2="${points[b].y}" />`)
        .join("");
    svg.classList.add("formed");
    await wait(1800);
    if(title) title.classList.add("visible");

    if(usable[usable.length - 1]) usable[usable.length - 1].classList.add("memoryKeeperStar");
}

function _selectCentralConstellationStars(stars, count){
    const candidates = stars.map(star => ({
        star,
        x:parseFloat(star.style.left) || 50,
        y:parseFloat(star.style.top) || 50
    }))
    .filter(item => item.x > 24 && item.x < 68 && item.y > 24 && item.y < 62)
    .sort((a,b) => Math.hypot(a.x - 48, a.y - 42) - Math.hypot(b.x - 48, b.y - 42));

    return candidates.slice(0, count)
        .sort((a,b) => a.x === b.x ? a.y - b.y : a.x - b.x)
        .map(item => item.star);
}

function _constellationOffsets(){
    return [
        { x:-18, y:8 }, { x:10, y:-14 }, { x:22, y:12 }, { x:-8, y:-20 },
        { x:16, y:18 }, { x:-24, y:-6 }, { x:28, y:-10 }, { x:-12, y:24 },
        { x:8, y:30 }, { x:-30, y:10 }, { x:24, y:22 }, { x:-16, y:-28 },
        { x:32, y:4 }, { x:-26, y:20 }, { x:14, y:-32 }, { x:-6, y:16 }
    ];
}

function _constellationSegments(count){
    return [
        [0,2], [2,5], [5,8], [8,11], [11,14],
        [1,3], [3,6], [6,9], [9,12], [12,15],
        [4,7], [7,10], [10,13],
        [2,3], [6,7], [9,10], [13,14]
    ].filter(([a,b]) => a < count && b < count);
}

function _showMemoryBook(){
    const stage = document.querySelector(".memoryBookStage");
    const book = document.querySelector(".memoryBook");
    
    // Create the page element dynamically
    const pageElement = document.createElement("div");
    pageElement.className = "bookPage";
    book.appendChild(pageElement);

    const page = document.querySelector(".bookPage");
    const prev = document.querySelector(".prevBookPage");
    const next = document.querySelector(".nextBookPage");
    let pageIndex = 0;

    function renderPage(direction = 1){
        const data = MEMORY_PAGES[pageIndex];
        page.classList.remove("turnForward", "turnBack");
        void page.offsetWidth;
        page.classList.add(direction > 0 ? "turnForward" : "turnBack");

        if (data.type === 'archive') {
            page.innerHTML = `
                <div class="archiveCard">
                    <h1>${data.title}</h1>
                    <p class="accessLevel">${data.kicker}</p>
                    <div class="divider"></div>
                    <p class="bodyText">${data.body}</p>
                    <p class="note">${data.note}</p>
                    <button id="unlockButton">Unlock Document</button>
                </div>
            `;
            const unlockButton = page.querySelector("#unlockButton");
            unlockButton.addEventListener("click", requestDocumentAuthentication);
        } else {
            page.innerHTML = `
              <div class="pageKicker">${data.kicker}</div>
              <div class="pageIcon">${data.icon}</div>
              <h2>${data.title}</h2>
              <p>${data.body}</p>
              ${pageIndex === MEMORY_PAGES.length - 1 ? '<button class="experienceAgain">Revisit Universe</button>' : ''}
            `;
        }
        
        prev.disabled = pageIndex === 0;
        next.style.display = pageIndex === MEMORY_PAGES.length - 1 ? "none" : "grid";
        const restart = page.querySelector(".experienceAgain");
        if(restart) {
            restart.addEventListener("click", async () => {
                const book = document.querySelector(".memoryBook");
                const stage = document.querySelector(".memoryBookStage");
                if (book) book.classList.add("scattering");
                if (stage) stage.style.pointerEvents = "none";
                await wait(1500);
                restartExperience();
            });
        }
    }

    stage.classList.add("visible");
    setTimeout(() => book.classList.add("open"), 700);
    renderPage();

    prev.addEventListener("click", () => { if(pageIndex > 0){ pageIndex--; renderPage(-1); } });
    next.addEventListener("click", () => { if(pageIndex < MEMORY_PAGES.length - 1){ pageIndex++; renderPage(1); } });

    let startX = 0;
    book.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive:true });
    book.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - startX;
        if(Math.abs(dx) < 45) return;
        if(dx < 0 && pageIndex < MEMORY_PAGES.length - 1){ pageIndex++; renderPage(1); }
        if(dx > 0 && pageIndex > 0){ pageIndex--; renderPage(-1); }
    }, { passive:true });
}
