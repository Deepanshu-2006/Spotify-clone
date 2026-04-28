console.log("Let's get started");

let currentSongIndex = -1;
let songs = [];
let audio = new Audio();

async function getsongs() {
    let a = await fetch("./Songs/", { mode: "cors" });
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songsList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songsList.push(element.href);
        }
    }

    return songsList;
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function playSong(index) {
    currentSongIndex = index;
    audio.src = songs[currentSongIndex];
    audio.play();
    document.querySelector(".play-btn").src = "pause.svg";
    let songName = songs[index]
        .split("/")
        .pop()
        .replaceAll("%20", " ")
        .replace(".mp3", "");

    let parts = songName.split(" - ");
    let title = parts.length > 1 ? parts[0] : songName;
    let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

    document.querySelector(".songinfo").innerHTML = `
            <div class="song-title">${title}</div>
            <div class="song-artist">${artist}</div>
        `;

    //Re-trigger animation on song change
    const titleEl = document.querySelector(".song-title");
    const artistEl = document.querySelector(".song-artist");

    // Reset animation
    titleEl.style.animation = "none";
    artistEl.style.animation = "none";

    // Force reflow then re-apply
    titleEl.offsetHeight;
    artistEl.offsetHeight;

    titleEl.style.animation = "";
    artistEl.style.animation = "";

    document.querySelectorAll(".song-play-btn").forEach(btn => {
        btn.src = "play.svg";
    });

    document.querySelectorAll(".song-play-btn")[index].src = "pause.svg";

    // 🔥 Reset all text
    document.querySelectorAll(".play-text").forEach(span => {
        span.textContent = "Play Now";
    });

    // 🔥 Set current song text
    document.querySelectorAll(".play-text")[index].textContent = "Playing Now";

    // Active class
    document.querySelectorAll(".songsList li").forEach(li => {
        li.classList.remove("active-song");
    });

    document.querySelectorAll(".songsList li")[index].classList.add("active-song");
}

async function main() {

    songs = await getsongs();
    console.log(songs);

    let songUL = document.querySelector(".songsList ul");
    if (!songUL) {
        console.error("Error: .songsList ul element not found in the DOM.");
        return;
    }

    songs.forEach((song, index) => {

        let li = document.createElement("li");

        // Clean song name
        let songName = song
            .split("/")
            .pop()
            .replaceAll("%20", " ")
            .replace(".mp3", "");

        // Split artist and title
        let parts = songName.split(" - ");
        let title = parts.length > 1 ? parts[0] : songName;
        let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

        li.innerHTML = `
            <img src="music.svg" alt="">
            <div class="info">
                <div>${title}</div>
                <div>${artist}</div>
            </div>
            <div class="playnow">
                <span class = "play-text">Play Now</span>
                <img src="play.svg" class="song-play-btn" alt="">
            </div>
        `;

        // Click whole item
        li.addEventListener("click", () => {

            if (currentSongIndex === index) {

                // 🔁 Toggle play/pause
                if (audio.paused) {
                    audio.play();
                    document.querySelectorAll(".song-play-btn")[index].src = "pause.svg";
                    document.querySelector(".play-btn").src = "pause.svg";
                    document.querySelectorAll(".play-text")[index].textContent = "Playing Now";
                } else {
                    audio.pause();
                    document.querySelectorAll(".song-play-btn")[index].src = "play.svg";
                    document.querySelector(".play-btn").src = "play.svg";
                    document.querySelectorAll(".play-text")[index].textContent = "Play Now";
                }

            } else {
                playSong(index);
            }
        });

        songUL.appendChild(li);
    });

    // 🔍 Search filter
    document.querySelector(".search input").addEventListener("input", (e) => {
        let query = e.target.value.toLowerCase();
        let allLi = document.querySelectorAll(".songsList ul li");

        allLi.forEach((li) => {
            let text = li.textContent.toLowerCase();
            if (text.includes(query)) {
                li.style.display = "flex";
            } else {
                li.style.display = "none";
            }
        });
    });

    const playButton = document.querySelector(".play-btn");
    const prevButton = document.querySelector(".btn.previous");
    const forwardButton = document.querySelector(".btn.forward");

    // Play / Pause
    playButton.onclick = () => {
        if (currentSongIndex === -1) return;
        let currentBtn = document.querySelectorAll(".song-play-btn")[currentSongIndex];
        let currentText = document.querySelectorAll(".play-text")[currentSongIndex];

        if (audio.paused) {
            audio.play();
            playButton.src = "pause.svg";
            if (currentBtn) currentBtn.src = "pause.svg";
            if (currentText) currentText.textContent = "Playing Now";
        } else {
            audio.pause();
            playButton.src = "play.svg";
            if (currentBtn) currentBtn.src = "play.svg";
            if (currentText) currentText.textContent = "Play Now";
        }
    };

    // Previous
    prevButton.onclick = () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    };

    // Next
    forwardButton.onclick = () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    };

    // Auto play next
    audio.addEventListener("ended", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });
    audio.addEventListener("timeupdate", () => {

        let current = audio.currentTime;
        let total = audio.duration;

        if (!isNaN(total)) {
            document.querySelector(".current-time").textContent = formatTime(current);
            document.querySelector(".total-time").textContent = formatTime(total);

            document.querySelector(".seek-slider").value = (current / total) * 100;
        }
    });

    // 🎚️ Seek
    document.querySelector(".seek-slider").addEventListener("input", (e) => {
        if (!isNaN(audio.duration)) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
        }
    });

    // 🔊 Volume
    document.querySelector(".volume-slider").addEventListener("input", (e) => {
        audio.volume = e.target.value;
    });
    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => {
            let artist = card.dataset.artist.toLowerCase();
            let allLi = document.querySelectorAll(".songsList ul li");
            let anyVisible = false;

            allLi.forEach((li) => {
                let text = li.textContent.toLowerCase();
                if (text.includes(artist)) {
                    li.style.display = "flex";
                    anyVisible = true;
                } else {
                    li.style.display = "none";
                }
            });
            document.querySelector(".library h3").textContent = card.dataset.artist;

            document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
            card.classList.add("active-card");
            
            // ▶️ Play button on card → auto play first song of that artist
            document.querySelectorAll(".card .play").forEach((playBtn) => {
                playBtn.addEventListener("click", (e) => {
                    e.stopPropagation(); // ✅ prevent card click from firing too

                    let artist = playBtn.closest(".card").dataset.artist.toLowerCase();

                    // Find first matching song index
                    let firstMatchIndex = songs.findIndex((song) => {
                        let songName = song.split("/").pop().replaceAll("%20", " ").replace(".mp3", "").toLowerCase();
                        return songName.includes(artist);
                    });

                    if (firstMatchIndex !== -1) {
                        playSong(firstMatchIndex); // ✅ plays first song of that artist
                    } else {
                        console.warn("No songs found for:", artist);
                    }
                });
            });
        });
    });
    document.querySelector(".library h3").addEventListener("click", () => {
        document.querySelectorAll(".songsList ul li").forEach(li => li.style.display = "flex");
        document.querySelector(".library h3").textContent = "Your Library";
        document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
    });
}

main();