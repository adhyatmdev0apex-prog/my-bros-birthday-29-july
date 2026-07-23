/*=========================================================
    ANIMATIONS.JS  —  Shared animation helpers
=========================================================*/

async function typeWriter(el, text, speed = 35){
    el.textContent = "";
    for(const ch of text){
        el.textContent += ch;
        await new Promise(r => setTimeout(r, speed));
    }
}

function fadeIn(el, ms = 800){
    el.style.opacity    = "0";
    el.style.visibility = "visible";
    el.style.display    = el.style.display === "none" ? "block" : el.style.display || "block";
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.style.transition = `opacity ${ms}ms`;
            el.style.opacity    = "1";
        });
    });
}

function fadeOut(el, ms = 800){
    el.style.transition = `opacity ${ms}ms`;
    el.style.opacity    = "0";
}

function random(min, max){ return Math.random()*(max-min)+min; }

/*----- Star engine -----*/
function createStar(){
    const s = document.createElement("div");
    s.className = "star";
    s.style.left           = random(0,100) + "vw";
    s.style.top            = random(0,100) + "vh";
    s.style.animationDelay = random(0,3)   + "s";
    s.style.setProperty("--star-duration", random(2.4,4.6) + "s");
    s.style.width          = s.style.height = random(1,3) + "px";
    document.getElementById("starsLayer").appendChild(s);
}

/*----- Sky engine -----*/
function changeSky(type){
    const sky = document.getElementById("skyGradient");
    if(!sky) return;
    document.body.classList.toggle("moon-visible", type === "night");
    if(type === "night") revealMoon();
    else hideMoon();
    sky.style.transition = "background 2s";
    const SKIES = {
        morning : "linear-gradient(180deg,#061224 0%,#16314f 45%,#2d365a 100%)",
        sunset  : "linear-gradient(180deg,#0b1222 0%,#2d255b 52%,#5d3b3f 100%)",
        night   : "linear-gradient(180deg,#020510 0%,#081325 55%,#000000 100%)"
    };
    sky.style.background = SKIES[type] || SKIES.night;
}

function revealMoon(){
    const background = document.getElementById("background");
    if(!background) return;

    let moon = document.getElementById("moonLayer");
    if(!moon){
        moon = document.createElement("div");
        moon.id = "moonLayer";
        moon.setAttribute("aria-hidden", "true");
        moon.innerHTML = `
<svg class="moonCrescentSvg"
     viewBox="0 0 100 100"
     preserveAspectRatio="xMidYMid meet">

    <defs>
        <linearGradient id="moonGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFE08A"/>
            <stop offset="100%" stop-color="#E0A13A"/>
        </linearGradient>
    </defs>

        <path d="M 52 14 
           A 42 42 0 1 0 83 56 
           A 32.5 32.5 0 1 1 50 14 Z" 
        fill="url(#moonGradient)"
/>
</svg>
`;
        background.appendChild(moon);
    }

    requestAnimationFrame(() => moon.classList.add("visible"));
}

function hideMoon(){
    const moon = document.getElementById("moonLayer");
    if(moon) moon.classList.remove("visible");
}

/*----- Cloud engine -----*/
function createCloud(){
    const c = document.createElement("div");
    c.className = "cloud";
    c.style.top             = random(5,40)  + "vh";
    c.style.width           = random(160,260) + "px";
    c.style.animationDuration = random(35,65) + "s";
    c.style.opacity         = random(0.4, 0.9).toFixed(2);
    document.getElementById("cloudLayer").appendChild(c);
}

function clearClouds(){
    const l = document.getElementById("cloudLayer");
    if(l) l.innerHTML = "";
}
