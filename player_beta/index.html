<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Radio Player PRO</title>

<style>
body { font-family: Arial; margin:20px; }

.current { border:1px solid #ccc; padding:15px; margin-bottom:20px; }

.schedule_tabs button {
  padding:10px;
  cursor:pointer;
  background:#eee;
  border:none;
}

.schedule_tabs button.active {
  background:#333;
  color:#fff;
}

.tabcontent { display:none; border:1px solid #ccc; padding:10px; }

.schedule_program { margin-bottom:10px; }

.program_list_content {
  border-bottom:1px solid #eee;
  margin-bottom:10px;
  padding:5px;
}

.onair {
  background:#ffeeba;
}

img { width:50px; height:50px; object-fit:cover; }
</style>
</head>

<body>

<!-- ON AIR -->
<div class="current">
  <h2>Teraz na antenie</h2>
  <div class="current_program_item"></div>
  <div class="current_program_hour"></div>
  <div class="current_program_title"></div>
  <div class="current_program_host"></div>
  <img class="current_program_photo">
</div>

<!-- PLAYER -->
<select id="stationSelect"></select>
<br><br>
<audio id="player" controls autoplay></audio>
<p id="resultTrack"></p>

<hr>

<!-- RAMÓWKA -->
<div class="schedule_tabs" id="tabs"></div>
<div class="schedule_tab_contents" id="tab_contents"></div>

<hr>

<!-- PROGRAMY -->
<h3>Programy</h3>
<input type="text" id="searchInput" placeholder="Szukaj programu lub autora..." oninput="renderPrograms()">
<select id="categoryFilter" onchange="renderPrograms()">
  <option value="">Wszystkie kategorie</option>
  <option value="Audiobooki">Audiobooki</option>
</select>

<div class="program_list" id="program_list"></div>

<script>
let CURRENT_STATION = null;
let CURRENT_STATION_ID = null;
let playlistInterval = null;

const dayOrder = ["1","2","3","4","5","6","0"];

const dayNames = {
  "1":"Poniedziałek","2":"Wtorek","3":"Środa",
  "4":"Czwartek","5":"Piątek","6":"Sobota","0":"Niedziela"
};

let PROGRAMS = [];
let IMAGES = [];
let SCHEDULE = [];
let STATIONS = [];

let lastDay = new Date().getDay();

// =====================
// LOAD
// =====================
async function loadData() {
  const [images, programs, schedule, stations] = await Promise.all([
    fetch("https://krdrt5370000ym.github.io/player_beta/json/test_images.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/player_beta/json/test_programs.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/player_beta/json/test_schedule.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/player_beta/json/test_station.json").then(r=>r.json())
  ]);

  IMAGES = images;
  PROGRAMS = programs;
  SCHEDULE = schedule;
  STATIONS = stations.station;
}

// =====================
// HELPERS
// =====================
function formatHour(h){ return h.slice(0,5); }

function isInTimeRange(start, end, current) {
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

function getProgramData(p){
  if(!p) return null;
  if(p.id) return PROGRAMS.find(x=>x.id===p.id) || p;
  return p;
}

// 🔥 POPRAWIONE OBRAZKI
function getThumbnail(p, data){
  if (p.thumbnail_id) {
    const img = IMAGES.find(i => i.thumbnail_id === p.thumbnail_id);
    if (img) return img.thumbnail_uri;
  }
  if (p.thumbnail_uri) return p.thumbnail_uri;
  if (data && data.thumbnail_uri) return data.thumbnail_uri;

  return null;
}

// =====================
// ON AIR
// =====================
function renderCurrent() {
  const now = new Date();
  const day = now.getDay().toString();
  const yesterday = day === "0" ? "6" : (day - 1).toString();
  const time = now.toTimeString().slice(0,8);
  const stations=STATIONS.find(x=>x.id===CURRENT_STATION_ID);

  const program = SCHEDULE
    .filter(p => p.active && (!p.station || p.station.includes(CURRENT_STATION)))
    .filter(p => {
      if (p.days.includes(day)) return isInTimeRange(p.hour_start, p.hour_end, time);
      if (p.days.includes(yesterday) && p.hour_start > p.hour_end) return time < p.hour_end;
      return false;
    })
    .sort((a,b)=>{
    if (a.station && !b.station) return -1;
    if (!a.station && b.station) return 1;
    
    // 2. Jeśli oba są lokalne (lub oba ogólne), priorytet dla subschedule (krótsze pasma)
    if (a.subschedule && !b.subschedule) return -1;
    if (!a.subschedule && b.subschedule) return 1;
    return 0;
    })[0];

  document.querySelector(".current_program_item").textContent = "";
    document.querySelector(".current_program_hour").textContent = "";
    document.querySelector(".current_program_title").textContent = stations.name || 'Radio Online';
    document.querySelector(".current_program_host").textContent = "";
    document.querySelector(".current_program_photo").src = stations.cover || null;

  if(!program || stations.radio_plug === true) return;

  const data = getProgramData(program);
  const thumbnail = getThumbnail(program, data);

  document.querySelector(".current_program_item").textContent = program.item || "";
  document.querySelector(".current_program_hour").textContent =
    `${formatHour(program.hour_start)} - ${formatHour(program.hour_end)}`;
  document.querySelector(".current_program_title").textContent =
    program.name || data.name || "";
  document.querySelector(".current_program_host").textContent =
    program.host || data.host || "";
  document.querySelector(".current_program_photo").src = thumbnail;
}

// =====================
// TABS
// =====================
function renderTabs() {
  const tabs = document.getElementById("tabs");
  const contents = document.getElementById("tab_contents");

  tabs.innerHTML = "";
  contents.innerHTML = "";

  const today = new Date().getDay().toString();

  dayOrder.forEach(day => {

    const btn = document.createElement("button");
    btn.textContent = dayNames[day];
    if(day === today) btn.classList.add("active");

    const tab = document.createElement("div");
    tab.className = "tabcontent";
    tab.id = "tab_"+day;
    tab.style.display = day === today ? "block" : "none";

    btn.onclick = () => {
      document.querySelectorAll(".tabcontent").forEach(t=>t.style.display="none");
      document.querySelectorAll("#tabs button").forEach(b=>b.classList.remove("active"));
      tab.style.display="block";
      btn.classList.add("active");
    };

    SCHEDULE
      .filter(p =>
        p.active &&
        p.days.includes(day) &&
        !p.hide_in_schedule &&
        (!p.station || p.station.includes(CURRENT_STATION))
      )
      .sort((a,b)=>a.hour_start.localeCompare(b.hour_start))
      .forEach(p=>{
        const data = {...getProgramData(p)};
        const thumbnail = getThumbnail(p, data);

        const el = document.createElement("div");
        el.className = p.subschedule === true ? "schedule_program small" : "schedule_program";
        
        const programId = data.private === true ? '' : ` style="cursor:pointer;" onclick="LoadProgram('${data.id}')"`;
        el.dataset.start = p.hour_start; 
        el.dataset.end = p.hour_end;

        el.innerHTML = `
          <div>${p.item || ""}</div>
          <b>${formatHour(p.hour_start)} - ${formatHour(p.hour_end)}</b>
          <div${programId}>${p.name || data.name}</div>
          <div>${p.host || data.host || ""}</div>
          <img src="${thumbnail}">
        `;

        tab.appendChild(el);
      });

    tabs.appendChild(btn);
    contents.appendChild(tab);
  });
}
// =====================
// ON AIR STATUS
// =====================
function updateOnAirStatus() {
  const now = new Date();
  const currentDay = now.getDay().toString();
  const currentTime = now.toTimeString().slice(0, 5);

  const yesterday = (currentDay === "0" ? "6" : (parseInt(currentDay) - 1).toString());

  document.querySelectorAll('.schedule_program').forEach(row => {
    const start = row.dataset.start;
    const end = row.dataset.end;

    if (!start || !end) return;

    const dayOfTab = row.closest('.tabcontent').id.replace('tab_', '');

    const isTodayTab = dayOfTab === currentDay;
    const isYesterdayTab = dayOfTab === yesterday;

    let active = false;

    if (isTodayTab) {
      active = isInTimeRange(start, end, currentTime);
    } else if (isYesterdayTab && start > end) {
      active = currentTime < end;
    }

    row.classList.toggle('onair', active);
  });

  // auto scroll do aktualnego
  const activeEl = document.querySelector('.schedule_program.onair');
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// =====================
// PROGRAM LIST
// =====================
function renderPrograms(){
  const container = document.getElementById("program_list");
  const filter = document.getElementById("categoryFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase(); // Pobieramy frazę

  container.innerHTML = "";

  PROGRAMS
    .filter(p => !p.hide_in_program && !p.private)
    .filter(p => !filter || p.category === filter)
    .filter(p => !p.station || p.station.includes(CURRENT_STATION))
    // NOWY FILTR: Wyszukiwarka tekstowa
    .filter(p => {
      const name = (p.name || "").toLowerCase();
      const host = (p.host || "").toLowerCase();
      return name.includes(search) || host.includes(search);
    })
    .sort((a, b) => {
      const sortA = a.sorted || "";
      const sortB = b.sorted || "";
      const result = sortA.toString().localeCompare(sortB.toString(), undefined, { numeric: true });
      return result !== 0 ? result : a.name.localeCompare(b.name);
    })
    .forEach(p => {
      const el = document.createElement("div");
      el.className = "program_list_content";

      el.innerHTML = `
        <img src="${p.thumbnail_uri}">
        <div onclick="LoadProgram('${p.id}')" style="cursor:pointer; font-weight:bold;">${p.name}</div>
        <div>${p.host}</div>
      `;

      container.appendChild(el);
    });
}

// =====================
// STATIONS
// =====================
function renderStations(){
  const select=document.getElementById("stationSelect");
  const player=document.getElementById("player");

  STATIONS.forEach((s,i)=>{
    const opt=document.createElement("option");
    opt.value=s.id;
    opt.textContent=s.name;
    select.appendChild(opt);

    if(i===0){
      CURRENT_STATION=s.station_schedule;
      CURRENT_STATION_ID=s.id;
      player.src=s.stream;
      playlistNowPlaying(s.playlist);
      reloadAll()
    }
  });

  select.onchange=()=>{
    const s=STATIONS.find(x=>x.id===select.value);
    CURRENT_STATION=s.station_schedule;
    CURRENT_STATION_ID=s.id;
    player.src=s.stream;
    const ds = document.getElementById("ScheduleDisplay");
    s.radio_plug === true ? ds.style = "display:none;" : ds.style = "display:block;";
    player.play();
    playlistNowPlaying(s.playlist); // Wywołujemy przy zmianie stacji
    reloadAll()
  };
}

function reloadAll(){
  renderCurrent();
  renderTabs();
  renderPrograms();
}

// =====================
// PROGRAM PAGE
// =====================
function getDisplaySchedule(programId) {
  const daysMap = { "1": "Pn", "2": "Wt", "3": "Śr", "4": "Cz", "5": "Pt", "6": "Sob", "0": "Ndz" };
  
  // Filtrujemy wpisy w grafiku dla konkretnego programu
  const occurrences = SCHEDULE.filter(s => s.id === programId && s.active && s.hide_in_schedule !== true);
  
  const groups = occurrences.map(occ => {
    // Sortujemy dni rosnąco (ważne dla Ndz=0 / Pn=1)
    const sortedDays = [...occ.days].sort();
    const dayLabels = sortedDays.map(d => daysMap[d]);
    
    let dayString = dayLabels.join(", ");
    
    // Logika dla Pn - Pt
    if (occ.days.length === 5 && occ.days.every(d => ["1","2","3","4","5"].includes(d))) {
      dayString = "Pn - Pt";
    }

    return `${dayString}, ${formatHour(occ.hour_start)} - ${formatHour(occ.hour_end)}`;
  });

  return groups.join(" | ");
}

function LoadProgram(id) {
  if (id === null) return;

  const program = PROGRAMS.find(p => p.id === id);
  if (!program || program.private === true) return;

  const scheduleInfo = getDisplaySchedule(id);
  const emailContact = (program.email && program.email.length > 0) 
  ? program.email.map(t => `<a href="mailto:${t}">${t}</a>`).join(', ') 
  : '';
  const podcastList = (program.podcast) ? `<audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
      <div id="episode-list">Ładowanie odcinków...</div>
      <script src="https://krdrt5370000ym.github.io/site-episode.js"><\/script>
      <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
      <script>${program.podcast}<\/script>` : '';
  const escapeHTML = (str) => 
    str ? str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"'"}[m])) : "";

  // 1. Tworzymy treść HTML jako string
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
      <title>${escapeHTML(program.name)}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; line-height: 1.6; color: #333; max-width: 800px; margin: auto; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h2 { color: #000; margin-top: 0; font-size: 2em; }
        .meta { color: #666; font-size: 0.95em; margin-bottom: 20px; border-left: 4px solid #eee; padding-left: 15px; }
        #episode-list { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
      </style>
    </head>
    <body>
      ${program.thumbnail_uri ? `<img src="${program.thumbnail_uri}" alt="Thumbnail">` : ""}
      <h2>${escapeHTML(program.name)}</h2>
      <div class="meta">
        <div><b>Prowadzący:</b> ${escapeHTML(program.host) || "---"}</div>
        <div>${escapeHTML(program.onair)}</div>
        <div><b>Emisja:</b> ${escapeHTML(scheduleInfo)}</div>
        ${emailContact}
        <div>${escapeHTML(program.label)}</div>
      </div>
      <hr>
      <div class="description">${program.description || "Brak opisu programu."}</div>
      ${podcastList}
    </body>
    </html>
  `;

  // 2. Tworzymy Blob i generujemy URL
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const blobURL = URL.createObjectURL(blob);

  // 3. Otwieramy nowe okno z adresem Bloba
  const win = window.open(blobURL, "_blank");

  if (!win) {
    alert("Zablokowano wyskakujące okno!");
    URL.revokeObjectURL(blobURL); // Sprzątamy, jeśli się nie udało
    return;
  }
}

function playlistNowPlaying(playlistString) {
    // playlistString to np. "getNowPlayingEurozet('antbal_new')"
    if (playlistInterval) clearInterval(playlistInterval);

    const updateTrack = () => {
        if (!playlistString) return;

        // Rozbijamy string na nazwę funkcji i argument
        const match = playlistString.match(/^(\w+)\(['"]?(.*?)['"]?\)$/);

        if (match) {
            const functionName = match[1]; // np. getNowPlayingEurozet
            const argument = match[2];     // np. antbal_new

            if (typeof window[functionName] === "function") {
                window[functionName](argument);
            }
        } else {
            // Jeśli to nie funkcja, a zwykły tekst, wyświetl go
            const resultElem = document.getElementById('resultTrack');
            if (resultElem) resultElem.innerText = playlistString;
        }
    };

    updateTrack();
    playlistInterval = setInterval(updateTrack, 20000); 
}
// =====================
// INIT
// =====================
function init() {
  renderStations();
  renderCurrent();
  renderTabs();
  renderPrograms();
  updateOnAirStatus();

  document.getElementById("categoryFilter").onchange = renderPrograms;

  setInterval(() => {
    const now = new Date();
    const newDay = now.getDay();

    renderCurrent();
    updateOnAirStatus();

    if (newDay !== lastDay) {
      renderTabs();
      lastDay = newDay;
    }

  }, 60000);
}

loadData().then(init);
</script>
<script src="https://krdrt5370000ym.github.io/site-nowplaying.js"></script>
</body>
</html>
