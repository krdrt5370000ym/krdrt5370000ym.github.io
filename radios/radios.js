let hls = null;
let CURRENT_STATION = null;
let CURRENT_STATION_ID = null;
let SCHEDULE_APP = null;
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
async function loadData(siteId) {
  const [images, programs, schedule, stations] = await Promise.all([
    fetch("https://krdrt5370000ym.github.io/radios/json/" + siteId + "_images.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/radios/json/" + siteId + "_programs.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/radios/json/" + siteId + "_schedule.json").then(r=>r.json()),
    fetch("https://krdrt5370000ym.github.io/radios/json/" + siteId + "_station.json").then(r=>r.json())
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

function openTab(evt, tabName) {
  // Ukryj wszystkie i usuń klasę active
  document.querySelectorAll(".tabcontent").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tablinks").forEach(el => el.classList.remove("active"));
  
  // Pokaż wybraną
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

function isInTimeRange(start, end, current) {
  if (start <= end) {
    return current >= start && current < end;
  } else {
    // Logika dla audycji przechodzących przez północ (np. 22:00 - 02:00)
    return current >= start || current < end;
  }
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
  const stations = STATIONS.find(x=>x.id===CURRENT_STATION_ID);
  const escapeHTML = (str) => 
  str ? str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"'"}[m])) : "";

  const program = SCHEDULE
  .filter(p => p.active && (!p.station || p.station.includes(CURRENT_STATION_ID)) && !p.station_exclude?.includes(CURRENT_STATION_ID))
  .filter(p => {
    const isMidnight = p.midnight === true;
    const startsBeforeMidnight = p.hour_start > p.hour_end;
    if (p.days.includes(yesterday)) {
      if (startsBeforeMidnight && time < p.hour_end) return true;
    }
    if (p.days.includes(day)) {
      if (isMidnight) {
        return time >= p.hour_start && time < p.hour_end;
      } else {
        if (startsBeforeMidnight) {
          return time >= p.hour_start; 
        } else {
          return time >= p.hour_start && time < p.hour_end;
        }
      }
    }
    return false;
  })
    .sort((a, b) => {
        const dataA = getProgramData(a);
        const dataB = getProgramData(b);
    
        // 1. Priorytet dla konkretnej stacji
        if (a.station && !b.station) return -1;
        if (!a.station && b.station) return 1;
    
        // 2. Priorytet dla subschedule
        if (a.subschedule && !b.subschedule) return -1;
        if (!a.subschedule && b.subschedule) return 1;
      
        // 3. Główny sort: Późniejsza godzina startu (malejąco)
        if (a.hour_start !== b.hour_start) {
            return (b.hour_start || "").localeCompare(a.hour_start || "");
        }
    
        // 4. Jeśli godziny są te same, sortuj alfabetycznie po nazwie
        const nameA = a.name || dataA.name || "";
        const nameB = b.name || dataB.name || "";
        return nameA.localeCompare(nameB);
    })[0];

    if (stations.schedule && stations.radio_plug !== true) {
        scheduleCurrent(stations.schedule);
        if (SCHEDULE_APP === 1) return;
    }
    
    SCHEDULE_APP = null; 

    document.querySelector(".current_program_item").textContent = "";
    document.querySelector(".current_program_hour").textContent = "";
    document.querySelector(".current_program_title").style = 'font-weight: 400;';
    document.querySelector(".current_program_title").textContent = stations.name || 'Radio Online';
    document.querySelector(".current_program_host").textContent = "";
    document.querySelector(".current_program_photo").innerHTML = `<img decoding="async" src="${stations.cover}" alt="">` || null;

  if(!program || stations.radio_plug === true) return;

  const data = getProgramData(program);
  const thumbnail = getThumbnail(program, data);
  
  const thumb = program.thumbnail_text || data.thumbnail_text;
  const style = thumb ? [
    thumb.background ? `background:${thumb.background}` : '',
    thumb.color ? `color:${thumb.color}` : ''
  ].filter(Boolean).join(';') : '';
  const name = (thumb && thumb.name) || program.name || data.name || "";
  const thumbnailText = thumb 
  ? `<div class="current_program_box" style="${style}">${name}</div>` 
  : `<img decoding="async" src="${thumbnail}" alt="${escapeHTML(program.name || data.name || "")}">` || "";

  document.querySelector(".current_program_item").textContent = program.item || "";
  document.querySelector(".current_program_hour").textContent =
    `${formatHour(program.hour_start)} - ${formatHour(program.hour_end)}`;
  document.querySelector(".current_program_title").style = 'font-weight: 600;';
  document.querySelector(".current_program_title").textContent =
    program.name || data.name || "";
  document.querySelector(".current_program_host").textContent =
    program.host || data.host || "";
  document.querySelector(".current_program_photo").innerHTML = thumbnailText;
}

// =====================
// SCHEDULES
// =====================
function renderSchedules() {
  const tabs = document.getElementById("days");
  const contents = document.getElementById("day_contents");
  const stations = STATIONS.find(x=>x.id===CURRENT_STATION_ID);

  tabs.innerHTML = "";
  contents.innerHTML = "";

  const today = new Date().getDay().toString();

  dayOrder.forEach(day => {

    const btn = document.createElement("button");
    btn.textContent = dayNames[day];
    if(day === today) btn.classList.add("active");

    const tab = document.createElement("div");
    tab.className = "schedule_list";
    tab.id = "day_"+day;
    tab.style.display = day === today ? "block" : "none";

    btn.onclick = () => {
      document.querySelectorAll(".schedule_list").forEach(t=>t.style.display="none");
      document.querySelectorAll("#days button").forEach(b=>b.classList.remove("active"));
      tab.style.display="block";
      btn.classList.add("active");
    };

    SCHEDULE
      .filter(p => {
        const programData = getProgramData(p);
        const tomorrow = ((parseInt(day) + 1) % 7).toString();
        const isMidnightForThisDay = p.midnight && p.days.includes(tomorrow);
        const isRegularForThisDay = !p.midnight && p.days.includes(day);
        return (
          p.active &&
          !programData.hide_in_schedule &&
          (isRegularForThisDay || isMidnightForThisDay) &&
          (!p.station || p.station.includes(CURRENT_STATION_ID)) &&
          !p.station_exclude?.includes(CURRENT_STATION_ID)
        );
      })
      .sort((a, b) => {
          const hourA = a.midnight ? "24:" + a.hour_start : a.hour_start;
          const hourB = b.midnight ? "24:" + b.hour_start : b.hour_start;
          return hourA.localeCompare(hourB);
      })
      .forEach(p=>{
        const escapeHTML = (str) => 
        str ? str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"'"}[m])) : "";
        const data = {...getProgramData(p)};
        const thumbnail = getThumbnail(p, data);
        const thumbnailDisplay = thumbnail !== null ? `<img decoding="async" src="${thumbnail}" alt="${escapeHTML(p.name || data.name || "")}">` : '';
        const thumb = p.thumbnail_text || data.thumbnail_text;
        const style = thumb ? [
          thumb.background ? `background:${thumb.background}` : '',
          thumb.color ? `color:${thumb.color}` : ''
        ].filter(Boolean).join(';') : '';
        const name = (thumb && thumb.name) || p.name || data.name || "";
        const thumbnailText = thumb 
          ? `<div class="schedule_name_box" style="${style}">${name}</div>` 
          : thumbnailDisplay;
        const programIdCheck = PROGRAMS.find(x=>x.id===data.id);

        const el = document.createElement("div");
        el.className = p.subschedule === true ? "schedule_program small" : "schedule_program";
        
        const displayName = p.name || data.name || "";
        const isRestricted = !programIdCheck || data.id === null || data.private === true || stations.disable_programs === true;
        
        const programUrl = data.url_immediately 
            ? `<div class="schedule_program_name" style="cursor:pointer;"><a href="${data.url_immediately}" target="_blank">${displayName}</a></div>` 
            : `<div class="schedule_program_name" style="cursor:pointer;" onclick="LoadProgram('${data.id}')">${displayName}</div>`; // Dodano ' po ${data.id}

        const programUrlN = data.url_immediately 
            ? `<div class="schedule_program_name" style="cursor:pointer;"><a href="${data.url_immediately}" target="_blank">${displayName}</a></div>` 
            : `<div class="schedule_program_name">${displayName}</div>`;

        const programId = isRestricted ? programUrlN : programUrl;

        const commentDisplay = p.comment ? `<div class="schedule_program_comment">${p.comment}</div>` : '';

        // 2. Przypisanie danych i HTML
        el.dataset.start = p.hour_start; 
        el.dataset.end = p.hour_end;
        el.dataset.midnight = p.midnight ? "true" : "false";
        
        el.innerHTML = `
            <div class="schedule_program_cover">${thumbnailText}</div>
            <div class="schedule_program_content">
                <div class="schedule_program_item">${p.item || ""}</div>
                <div class="schedule_program_data">${formatHour(p.hour_start)} - ${formatHour(p.hour_end)}</div>
                ${programId}
                <div class="schedule_program_host">${p.host || data.host || ""}</div>
                ${commentDisplay}
            </div>
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
  // Używamy daty przekazanej (do testów) lub aktualnej
  const now = new Date(); 
  const currentDay = now.getDay().toString();
  const currentTime = now.toTimeString().slice(0, 8);

  const yesterday = (parseInt(currentDay) === 0 ? "6" : (parseInt(currentDay) - 1).toString());

  document.querySelectorAll('.schedule_program').forEach(row => {
    const start = row.dataset.start;
    const end = row.dataset.end;
    const isMidnightType = row.dataset.midnight === "true";
    const crossesMidnight = start > end; // np. 23:00:00 > 01:00:00

    if (!start || !end) return;

    const dayOfTab = row.closest('.schedule_list').id.replace('day_', '');
    let active = false;

    // SCENARIUSZ A: Sprawdzamy program w tabie DZISIEJSZYM
    if (dayOfTab === currentDay) {
      if (isMidnightType) {
        // Programy midnight (np. 01:00-02:00) w swoim nominalnym tabie są wygaszone,
        // bo renderSchedules przeniósł je do taba "wczorajszego".
        active = false;
      } else if (crossesMidnight) {
        // Dla 23:00-01:00: w tabie SOBOTA świeci TYLKO wieczorem (od 23:00 do 23:59)
        active = (currentTime >= start);
      } else {
        // Standardowe (np. 14:00-16:00)
        active = (currentTime >= start && currentTime < end);
      }
    } 
    
    // SCENARIUSZ B: Sprawdzamy program w tabie WCZORAJSZYM
    else if (dayOfTab === yesterday) {
      if (isMidnightType) {
        // Program midnight (01:00-02:00) wyświetlony wczoraj – świeci, bo teraz jest dzisiaj rano
        active = (currentTime >= start && currentTime < end);
      } else if (crossesMidnight) {
        // Program 23:00-01:00 z wczoraj – świeci, bo trwa "ogon" audycji (do 01:00)
        active = (currentTime < end);
      }
    }

    row.classList.toggle('onair', active);
  });
}

// =====================
// PROGRAM LIST
// =====================
function renderPrograms(){
  const container = document.getElementById("program_list");
  const filter = document.getElementById("categoryFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase(); // Pobieramy frazę
  const escapeHTML = (str) => 
  str ? str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"'"}[m])) : "";

  container.innerHTML = "";

  PROGRAMS
    .filter(p => !p.hide_in_program && !p.hide_in_schedule && !p.private && !p.archive && !p.hide_only_information_schedule && (!p.category_not_all || p.category))
    .filter(p => !filter || (p.category && p.category.includes(filter)))
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
      
          const thumb = p.thumbnail_text;
          const style = thumb ? [
          thumb.background ? `background:${thumb.background}` : '',
          thumb.color ? `color:${thumb.color}` : ''
          ].filter(Boolean).join(';') : '';
          const name = (thumb && thumb.name) || p.name || "";
          const thumbnailDisplay = p.thumbnail_uri ? 
          `<img decoding="async" src="${p.thumbnail_uri}" alt="${escapeHTML(p.name)}">` : "";
          const thumbnailText = thumb ? `<div class="program_list_box" style="${style}">${name}</div>` : thumbnailDisplay;
      
        const programUrl = p.url_immediately 
            ? `<div class="program_list_name" style="cursor:pointer;"><a href="${p.url_immediately}" target="_blank">${p.name}</a></div>` 
            : `<div class="program_list_name" onclick="LoadProgram('${p.id}')" style="cursor:pointer;">${p.name}</div>`;

      el.innerHTML = `
        <div class="program_list_cover">${thumbnailText}</div>
        <div>
            ${programUrl}
            <div class="program_list_host">${p.only_the_schedule_hosts === true ? '' : p.host}</div>
        </div>
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
  const ds = document.getElementById("ScheduleDisplay");
  const dp = document.getElementById("AllProgramsDisplay");

  STATIONS.forEach((s,i)=>{
    const opt=document.createElement("option");
    opt.value=s.id;
    opt.textContent=s.name;
    select.appendChild(opt);

    if(i===0){
      CURRENT_STATION=s.station_schedule;
      CURRENT_STATION_ID=s.id;
      AudioPlayer(s.stream);
      s.radio_plug === true ? ds.style = "display:none;" : ds.style = "display:block;";
      s.disable_programs === true ? dp.style = "display:none;" : dp.style = "display:block;";
      playlistNowPlaying(s.playlist);
      reloadAll()
    }
  });

  select.onchange=()=>{
    const s=STATIONS.find(x=>x.id===select.value);
    CURRENT_STATION=s.station_schedule;
    CURRENT_STATION_ID=s.id;
    AudioPlayer(s.stream);
    s.radio_plug === true ? ds.style = "display:none;" : ds.style = "display:block;";
    s.disable_programs === true ? dp.style = "display:none;" : dp.style = "display:block;";
    player.play();
    playlistNowPlaying(s.playlist); // Wywołujemy przy zmianie stacji
    reloadAll()
  };
}

function reloadAll(){
  renderCurrent();
  renderSchedules();
  renderPrograms();
}

// =====================
// PROGRAM PAGE
// =====================
function getDisplaySchedule(programId) {
  const daysMap = { "1": "Pn", "2": "Wt", "3": "Śr", "4": "Cz", "5": "Pt", "6": "Sob", "0": "Ndz" };
  
  // 1. Grupujemy dni według godzin (kluczem jest "start-end")
  const timeGroups = {};
  
  SCHEDULE.filter(s => s.id === programId && s.active && !s.hide_in_schedule)
    .forEach(occ => {
      const timeKey = `${occ.hour_start}-${occ.hour_end}`;
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = new Set();
      }
      occ.days.forEach(d => timeGroups[timeKey].add(d));
    });

  // 2. Przetwarzamy każdą grupę godzinową na tekst
  const result = Object.entries(timeGroups).map(([timeKey, daysSet]) => {
    const [start, end] = timeKey.split("-");
    const sortedDays = Array.from(daysSet).sort((a, b) => {
      const dayA = a === "0" ? 7 : parseInt(a);
      const dayB = b === "0" ? 7 : parseInt(b);
      return dayA - dayB;
    });

    // Sprawdzamy czy dni tworzą ciągły zakres (np. 1, 2, 3)
    const isSequence = sortedDays.every((d, i) => {
      if (i === 0) return true;
      const prev = sortedDays[i-1] === "0" ? 7 : parseInt(sortedDays[i-1]);
      const curr = d === "0" ? 7 : parseInt(d);
      return curr === prev + 1;
    });

    let dayString;
    if (sortedDays.length > 1 && isSequence) {
      dayString = `${daysMap[sortedDays[0]]} - ${daysMap[sortedDays[sortedDays.length - 1]]}`;
    } else {
      dayString = sortedDays.map(d => daysMap[d]).join(", ");
    }

    return {
      text: `${dayString} ${formatHour(start)} - ${formatHour(end)}`,
      firstDay: sortedDays[0] === "0" ? 7 : parseInt(sortedDays[0]),
      startTime: start
    };
  });

  // 3. Sortujemy finalne grupy chronologicznie
  return result
    .sort((a, b) => {
      if (a.firstDay !== b.firstDay) return a.firstDay - b.firstDay;
      return a.startTime.localeCompare(b.startTime);
    })
    .map(g => g.text)
    .join(" | ");
}

function LoadProgram(id) {
  if (id === null) return;

  const program = PROGRAMS.find(p => p.id === id);
  if (!program || program.url_immediately || program.hide_in_schedule === true || program.private === true) return;

  const occurrencesSch = SCHEDULE.filter(osch => osch.id === id && osch.active && osch.hide_in_schedule !== true);
  const occurrencesHost = [...new Set(occurrencesSch.host)];
  const occurrencesHostA = program.only_the_schedule_hosts === true 
  ? occurrencesHost.map(t => `${t}`).join(', ') 
  : program.host;

  if (program.hide_only_information_schedule === true && occurrencesSch.length === 0) return;

  const escapeHTML = (str) => 
    str ? str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"'"}[m])) : "";
  
  const scheduleInfo = getDisplaySchedule(id);
  const thumb = program.thumbnail_text;
  const style = thumb ? [
  thumb.background ? `background:${thumb.background}` : '',
  thumb.color ? `color:${thumb.color}` : ''
  ].filter(Boolean).join(';') : '';
  const name = (thumb && thumb.name) || program.name || "";
  const thumbnailDisplay = program.thumbnail_uri ? 
  `<img decoding="async" src="${program.thumbnail_uri}" alt="${escapeHTML(program.name)}">` : "";
  const thumbnailText = thumb ? `<div class="program_info_name_box" style="${style}">${name}</div>` : thumbnailDisplay;
  const emailContact = (program.email && program.email.length > 0) 
  ? program.email.map(t => `<a href="mailto:${t}">${t}</a>`).join(', ') 
  : '';
  const podcastList = (program.podcast) ? `<audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
      <div class="podcast_list_episode">
          <h3>Lista odcinków podcastu:</h3>
          <div id="episode-list">Ładowanie odcinków...</div>
      </div>` : '';

  // 1. Tworzymy treść HTML jako string
  const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name='robots' content='noindex, follow' />
            <title>${escapeHTML(program.name)} | krdrt537000ym.github.io</title>
            <script src="https://krdrt5370000ym.github.io/site-head.js"><\/script>
        </head>
        <body class="w3-light-grey">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/radios/radios.css">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css">
            <script src="https://krdrt5370000ym.github.io/site-topscreen.js"><\/script>
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
            <div class="w3-main" style="margin-left:300px;margin-top:43px;">
            <!-- Header -->
                <header class="w3-container" style="padding-top:22px">
                    <h5><b><i class="fa-solid fa-radio"></i> Programy i audycje</b></h5>
                </header>
                <div class="w3-row-padding w3-margin-bottom">
                    <p class="program_info_title">${escapeHTML(program.name)}</p>
                    <div class="program_info_box">
                        <div class="program_info_cover">${thumbnailText}</div>
                        <div class="program_info_data">
                            ${program.onair ? `<div class="program_info_airtime">${escapeHTML(program.onair)}</div>` : ""}
                            ${program.label ? `<div class="program_info_producter">Wydawca: ${escapeHTML(program.label)}</div>` : ""}
                            ${program.email ? `<div class="program_info_email">E-mail: ${emailContact}</div>` : ""}
                            Prowadzący: <div class="program_info_djs">${escapeHTML(occurrencesHostA) || "---"}</div>
                            </div>
                        </div>
                    <div class="program_info_desc">${program.description || "Brak opisu programu."}</div>
                    <div class="program_info_urls">
                        ${program.url ? `<a href="${program.url}"><i class="fa-solid fa-link"></i></a>` : ""}
                        ${program.url_rss ? `<a href="${program.url_rss}"><i class="fa-solid fa-rss"></i></a>` : ""}
                        ${program.url_podcast ? `<a href="${program.url_podcast}"><i class="fa-solid fa-podcast"></i></a>` : ""}
                        ${program.url_spreaker ? `<a href="${program.url_spreaker}"><i class="fa-solid fa-table-list"></i></a>` : ""}
                        ${program.url_spotify ? `<a href="${program.url_spotify}"><i class="fa-brands fa-spotify"></i></a>` : ""}
                        ${program.url_kick ? `<a href="${program.url_kick}"><i class="fa-brands fa-kickstarter-k"></i></a>` : ""}
                        ${program.url_twitch ? `<a href="${program.url_twitch}"><i class="fa-brands fa-twitch"></i></a>` : ""}
                        ${program.url_youtube ? `<a href="${program.url_youtube}"><i class="fa-brands fa-youtube"></i></a>` : ""}
                        ${program.url_facebook ? `<a href="${program.url_facebook}"><i class="fa-brands fa-facebook"></i></a>` : ""}
                        ${program.url_instagram ? `<a href="${program.url_instagram}"><i class="fa-brands fa-instagram"></i></a>` : ""}
                        ${program.url_tiktok ? `<a href="${program.url_tiktok}"><i class="fa-brands fa-tiktok"></i></a>` : ""}
                        ${program.url_x ? `<a href="${program.url_x}"><i class="fa-brands fa-x-twitter"></i></a>` : ""}
                        ${program.url_soundcloud ? `<a href="${program.url_soundcloud}"><i class="fa-brands fa-soundcloud"></i></a>` : ""}
                        ${program.url_mixcloud ? `<a href="${program.url_mixcloud}"><i class="fa-brands fa-mixcloud"></i></a>` : ""}
                    </div>
                    ${scheduleInfo ? `<div class="program_info_onairs">Na antenie:</div>` : ""}
                    ${scheduleInfo ? `<div class="program_info_onairs_list">${scheduleInfo}</div>` : ""}
                    ${podcastList}
                </div>
                <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
            </div>
            <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
            <script src="https://krdrt5370000ym.github.io/media/site-episode.js"><\/script>
            ${program.podcast ? `<script>${program.podcast}<\/script>` : ""}
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

function AudioPlayer(url) {
    const audio = document.getElementById('player');
    const isM3U8 = url.toLowerCase().includes('.m3u8');

    // Teraz hls jest widoczne globalnie, więc to zadziała:
    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (isM3U8 && Hls.isSupported()) {
        hls = new Hls(); // Przypisujemy nową instancję do zmiennej globalnej
        hls.loadSource(url);
        hls.attachMedia(audio);
        // ... reszta logiki
    }
    else if (audio.canPlayType('application/vnd.apple.mpegurl') || !isM3U8) {
        // Safari lub zwykłe MP3
        audio.src = url;
        audio.play().catch(() => console.log("Wymagana interakcja"));
    }
}

function ReloadAudio() {
    const audio = document.getElementById('player');
    // Pobieramy aktualny URL (z HLS lub bezpośrednio z audio.src)
    const currentUrl = hls ? hls.url : audio.src;
    
    if (currentUrl) {
        console.log("Przeładowuję strumień...");
        AudioPlayer(currentUrl);
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

function scheduleCurrent(scheduleString) {
    const match = scheduleString.match(/^(\w+)\((.*)\);?$/);
    if (match) {
        const functionName = match[1];
        const rawArgs = match[2];
        if (typeof window[functionName] === "function") {
            const args = rawArgs.split(',').map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));
            window[functionName](...args);
        }
    } else {
        const resultElemS = document.getElementById('resultCP');
        if (resultElemS) resultElemS.innerText = scheduleString;
    }
}
// =====================
// INIT
// =====================
function init() {
  renderStations();
  renderCurrent();
  renderSchedules();
  renderPrograms();
  updateOnAirStatus();

  document.getElementById("categoryFilter").onchange = renderPrograms;

  setInterval(() => {
    const now = new Date();
    const newDay = now.getDay();

    renderCurrent();
    updateOnAirStatus();

    if (newDay !== lastDay) {
      renderSchedules();
      lastDay = newDay;
    }

  }, 60000);
}
