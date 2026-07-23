/*=========================================================
                AUDIO ENGINE
=========================================================*/

function playBirthdaySong(){

    const audio = document.getElementById("birthdaySong");

    if(!audio) return;

    audio.volume = 0.7;

    audio.play().catch(() => {
        /* autoplay blocked — user gesture already happened so this shouldn't fire */
    });

}

function stopBirthdaySong(){

    const audio = document.getElementById("birthdaySong");

    if(!audio) return;

    audio.pause();
    audio.currentTime = 0;

}

function playPiano(){

    const audio = document.getElementById("piano");

    if(!audio) return;

    audio.volume = 0.4;
    audio.loop   = true;

    audio.play().catch(() => {});

}

function stopPiano(){

    const audio = document.getElementById("piano");

    if(!audio) return;

    audio.pause();
    audio.currentTime = 0;

}
