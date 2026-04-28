console.log("Let's get started");

let currentSongIndex = -1;
let songs = [];
let audio = new Audio();

// ── FETCH SONGS ──
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

// ── FORMAT TIME ──
function formatTime(seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// ── PLAY SONG ──
function playSong(index) {
  currentSongIndex = index;
  audio.src = songs[currentSongIndex];
  audio.play();
  document.querySelector(".play-btn").src = "svg/pause.svg";

  // Song name from filename
  let songName = songs[index]
    .split("/")
    .pop()
    .replaceAll("%20", " ")
    .replace(".mp3", "");

  // Split title and artist
  let parts = songName.split(" - ");
  let title = parts.length > 1 ? parts[0] : songName;
  let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

  // ── Footer song info with animation ──
  const titleEl = document.querySelector(".song-title");
  const artistEl = document.querySelector(".song-artist");

  titleEl.textContent = title;
  artistEl.textContent = artist;

  // ✅ Step 1 - Reset animation
  titleEl.style.animation = "none";
  artistEl.style.animation = "none";

  // ✅ Step 2 - Force reflow so browser registers the reset
  titleEl.offsetHeight;
  artistEl.offsetHeight;

  // ✅ Step 3 - Re-apply animation
  titleEl.style.animation = "slideUpFade 0.4s ease forwards";
  artistEl.style.animation = "slideUpFade 0.4s ease 0.12s forwards";

  // Reset all play buttons and texts
  document.querySelectorAll(".song-play-btn").forEach(btn => btn.src = "svg/play.svg");
  document.querySelectorAll(".play-text").forEach(span => span.textContent = "Play Now");

  // Set current song button and text
  document.querySelectorAll(".song-play-btn")[index].src = "svg/pause.svg";
  document.querySelectorAll(".play-text")[index].textContent = "Playing Now";

  // Active song highlight
  document.querySelectorAll(".songsList li").forEach(li => li.classList.remove("active-song"));
  document.querySelectorAll(".songsList li")[index].classList.add("active-song");
}

// ── MAIN ──
async function main() {

  songs = await getsongs();
  console.log(songs);

  let songUL = document.querySelector(".songsList ul");
  if (!songUL) {
    console.error("Error: .songsList ul not found.");
    return;
  }

  // ── BUILD SONG LIST ──
  songs.forEach((song, index) => {
    let li = document.createElement("li");

    let songName = song
      .split("/")
      .pop()
      .replaceAll("%20", " ")
      .replace(".mp3", "");

    let parts = songName.split(" - ");
    let title = parts.length > 1 ? parts[0] : songName;
    let artist = parts.length > 1 ? parts[1] : "Unknown Artist";

    li.innerHTML = `
            <img src="svg/music.svg" alt="">
            <div class="info">
                <div>${title}</div>
                <div style="font-size:11px; color:#b3b3b3;">${artist}</div>
            </div>
            <div class="playnow">
                <span class="play-text">Play Now</span>
                <img src="svg/play.svg" class="song-play-btn" alt="">
            </div>
        `;

    // Click on song item
    li.addEventListener("click", () => {
      if (currentSongIndex === index) {
        if (audio.paused) {
          audio.play();
          document.querySelectorAll(".song-play-btn")[index].src = "svg/pause.svg";
          document.querySelector(".play-btn").src = "svg/pause.svg";
          document.querySelectorAll(".play-text")[index].textContent = "Playing Now";
        } else {
          audio.pause();
          document.querySelectorAll(".song-play-btn")[index].src = "svg/play.svg";
          document.querySelector(".play-btn").src = "svg/play.svg";
          document.querySelectorAll(".play-text")[index].textContent = "Play Now";
        }
      } else {
        playSong(index);
      }
    });

    songUL.appendChild(li);
  });

  // ── SEARCH FILTER ──
  document.querySelector(".search input").addEventListener("input", (e) => {
    let query = e.target.value.toLowerCase();
    let allLi = document.querySelectorAll(".songsList ul li");
    let anyVisible = false;

    allLi.forEach((li) => {
      let text = li.textContent.toLowerCase();
      if (text.includes(query)) {
        li.style.display = "flex";
        anyVisible = true;
      } else {
        li.style.display = "none";
      }
    });

    // No results message
    let noResult = document.querySelector(".no-result");
    if (!noResult) {
      noResult = document.createElement("p");
      noResult.classList.add("no-result");
      noResult.style.cssText = "color:#b3b3b3; font-size:13px; padding:12px 16px; font-family:Poppins,sans-serif;";
      document.querySelector(".songsList ul").after(noResult);
    }
    noResult.textContent = anyVisible ? "" : "No songs found 😕";
    noResult.style.display = anyVisible ? "none" : "block";
  });

  document.querySelector(".home button").addEventListener("click", () => {
    document.querySelector(".right").scrollTo({ top: 0, behavior: "smooth" });
});

  // ── ARTIST CARD FILTER ──
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

      // Update library heading
      document.querySelector(".library h3").textContent = card.dataset.artist;

      // Highlight active card
      document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
      card.classList.add("active-card");

      // No results message
      let noResult = document.querySelector(".no-result");
      if (!noResult) {
        noResult = document.createElement("p");
        noResult.classList.add("no-result");
        noResult.style.cssText = "color:#b3b3b3; font-size:13px; padding:12px 16px; font-family:Poppins,sans-serif;";
        document.querySelector(".songsList ul").after(noResult);
      }
      noResult.textContent = anyVisible ? "" : `No songs found for ${card.dataset.artist} 😕`;
      noResult.style.display = anyVisible ? "none" : "block";
    });
  });

  // ── CARD PLAY BUTTON → play first song of artist ──
  document.querySelectorAll(".card .play").forEach((playBtn) => {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      let artist = playBtn.closest(".card").dataset.artist.toLowerCase();

      let firstMatchIndex = songs.findIndex((song) => {
        let songName = song.split("/").pop().replaceAll("%20", " ").replace(".mp3", "").toLowerCase();
        return songName.includes(artist);
      });

      if (firstMatchIndex !== -1) {
        playSong(firstMatchIndex);
      } else {
        console.warn("No songs found for:", artist);
      }
    });
  });

  // ── RESET LIBRARY on heading click ──
  document.querySelector(".library h3").addEventListener("click", () => {
    document.querySelectorAll(".songsList ul li").forEach(li => li.style.display = "flex");
    document.querySelector(".library h3").textContent = "Your Library";
    document.querySelectorAll(".card").forEach(c => c.classList.remove("active-card"));
    let noResult = document.querySelector(".no-result");
    if (noResult) noResult.style.display = "none";
  });

  // ── FOOTER CONTROLS ──
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
      playButton.src = "svg/pause.svg";
      if (currentBtn) currentBtn.src = "svg/pause.svg";
      if (currentText) currentText.textContent = "Playing Now";
    } else {
      audio.pause();
      playButton.src = "svg/play.svg";   // ✅ fixed path (was missing svg/)
      if (currentBtn) currentBtn.src = "svg/play.svg";
      if (currentText) currentText.textContent = "Play Now";
    }
  };

  // Previous
  prevButton.onclick = () => {
    if (currentSongIndex === -1) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
  };

  // Next
  forwardButton.onclick = () => {
    if (currentSongIndex === -1) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  };

  // Auto play next song
  audio.addEventListener("ended", () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  });

  // ── SEEKBAR UPDATE ──
  audio.addEventListener("timeupdate", () => {
    let current = audio.currentTime;
    let total = audio.duration;

    if (!isNaN(total)) {
      document.querySelector(".current-time").textContent = formatTime(current);
      document.querySelector(".total-time").textContent = formatTime(total);
      document.querySelector(".seek-slider").value = (current / total) * 100;
    }
  });

  // Seek
  document.querySelector(".seek-slider").addEventListener("input", (e) => {
    if (!isNaN(audio.duration)) {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    }
  });

  // Volume
  document.querySelector(".volume-slider").addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });
}

main();
