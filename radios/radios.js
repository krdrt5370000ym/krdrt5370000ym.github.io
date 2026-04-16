let hlsInstance = null;
let SITE_ID = null;
let CURRENT_STATION = null;
let CURRENT_STATION_ID = null;
let SCHEDULE_APP = null;
let playlistInterval = null;

const dayOrder = ["1", "2", "3", "4", "5", "6", "0"];

const dayNames = {
   "1": "Poniedziałek",
   "2": "Wtorek",
   "3": "Środa",
   "4": "Czwartek",
   "5": "Piątek",
   "6": "Sobota",
   "0": "Niedziela"
};

let PROGRAMS = [];
let IMAGES = [];
let SCHEDULE = [];
let STATIONS = [];
let CONFIG = [];

let lastDay = new Date().getDay();

// =====================
// LOAD
// =====================
async function loadData(siteId) {
   const baseUrl = `https://krdrt5370000ym.github.io/radios/json/${siteId}`;
   SITE_ID = siteId;

   // Helper do bezpiecznego fetchowania
   const fetchJson = (suffix) =>
      fetch(`${baseUrl}_${suffix}.json`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

   try {
      const [images, programs, schedule, stations, config] = await Promise.all([
         fetchJson("images"),
         fetchJson("programs"),
         fetchJson("schedule"),
         fetchJson("station"),
         fetchJson("config")
      ]);

      // ✅ POPRAWKA: SCHEDULE musi być tablicą [], by działał .filter()
      // ✅ POPRAWKA: PROGRAMS i IMAGES zazwyczaj są listami, więc [] jest bezpieczniejsze
      IMAGES = images || [];
      PROGRAMS = programs || [];
      SCHEDULE = schedule || []; // Zmieniono z {} na []
      STATIONS = stations?.station || [];
      CONFIG = (Array.isArray(config) ? config[0] : config) || {};

      console.log("Dane załadowane pomyślnie");
   } catch (error) {
      console.error("Błąd podczas ładowania danych:", error);
   }
}

// =====================
// HELPERS
// =====================
function formatHour(h) {
   return h.slice(0, 5);
}

function openTab(evt, tabName) {
   document.querySelectorAll(".tabcontent").forEach(el => el.style.display = "none");
   document.querySelectorAll(".tablinks").forEach(el => el.classList.remove("active"));

   const targetTab = document.getElementById(tabName);
   if (targetTab) targetTab.style.display = "block";

   if (evt && evt.currentTarget) {
      evt.currentTarget.classList.add("active");
   }
}

function isInTimeRange(start, end, current) {
   if (start <= end) {
      return current >= start && current < end;
   } else {
      // Logika dla audycji przechodzących przez północ (np. 22:00 - 02:00)
      return current >= start || current < end;
   }
}

function getProgramData(p) {
   if (!p) return null;
   if (p.id) return PROGRAMS.find(x => x.id === p.id) || p;
   return p;
}

// 🔥 POPRAWIONE OBRAZKI
function getThumbnail(p, data) {
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
   const time = now.toTimeString().slice(0, 8);
   const stations = STATIONS.find(x => x.id === CURRENT_STATION_ID);
   const escapeHTML = (str) =>
      str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&',
         '<': '<',
         '>': '>',
         '"': '"',
         "'": "'"
      } [m])) : "";

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

         // Funkcja pomocnicza do obliczania priorytetu (im wyższa liczba, tym ważniejszy obiekt)
         const getPriority = (item) => {
            let score = 0;
            if (item.station) score += 2; // Konkretna stacja jest najważniejsza
            if (item.subschedule) score += 1; // Subschedule to dodatkowy atut
            return score;
         };

         const priorityA = getPriority(a);
         const priorityB = getPriority(b);

         // 1. Sortowanie po priorytecie (malejąco: 3, 2, 1, 0)
         if (priorityA !== priorityB) {
            return priorityB - priorityA;
         }

         // 2. Jeśli priorytety są równe: Późniejsza godzina startu (malejąco)
         if (a.hour_start !== b.hour_start) {
            return (b.hour_start || "").localeCompare(a.hour_start || "");
         }

         // 3. Jeśli godziny są te same: Alfabetycznie po nazwie (rosnąco)
         const nameA = a.name || dataA.name || "";
         const nameB = b.name || dataB.name || "";
         return nameA.localeCompare(nameB);
      })[0];

   if (stations.schedule && stations.radio_plug !== true && stations.radio_listen !== true && CONFIG.radio_plug !== true) {
      scheduleCurrent(stations.schedule);
      if (SCHEDULE_APP === 1) return;
   }

   SCHEDULE_APP = null;

   document.querySelector(".current_program_item").textContent = "";
   document.querySelector(".current_program_hour").textContent = "";
   document.querySelector(".current_program_title").style = 'font-weight: 400;';
   document.querySelector(".current_program_title").textContent = stations.plug_name || stations.name || 'Radio Online';
   document.querySelector(".current_program_host").textContent = "";
   document.querySelector(".current_program_photo").innerHTML = `<img decoding="async" src="${stations.cover}" alt="">` || null;

   if (!program || stations.radio_plug === true || stations.radio_listen === true || CONFIG.radio_plug === true) return;

   const data = getProgramData(program);
   const thumbnail = getThumbnail(program, data);

   const thumb = program.thumbnail_text || data.thumbnail_text;
   const style = thumb ? [
      thumb.background ? `background:${thumb.background}` : '',
      thumb.color ? `color:${thumb.color}` : ''
   ].filter(Boolean).join(';') : '';
   const name = (thumb && thumb.name) || program.name || data.name || "";
   const thumbnailText = thumb ?
      `<div class="current_program_box" style="${style}">${name}</div>` :
      `<img decoding="async" src="${thumbnail}" alt="${escapeHTML(program.name || data.name || "")}">` || "";

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
   const stations = STATIONS.find(x => x.id === CURRENT_STATION_ID);

   tabs.innerHTML = "";
   contents.innerHTML = "";

   const today = new Date().getDay().toString();

   dayOrder.forEach(day => {

      const btn = document.createElement("button");
      btn.textContent = dayNames[day];
      if (day === today) btn.classList.add("active");

      const tab = document.createElement("div");
      tab.className = "schedule_list";
      tab.id = "day_" + day;
      tab.style.display = day === today ? "block" : "none";

      btn.onclick = () => {
         document.querySelectorAll(".schedule_list").forEach(t => t.style.display = "none");
         document.querySelectorAll("#days button").forEach(b => b.classList.remove("active"));
         tab.style.display = "block";
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
         .forEach(p => {
            const escapeHTML = (str) =>
               str ? String(str).replace(/[&<>"']/g, m => ({
                  '&': '&',
                  '<': '<',
                  '>': '>',
                  '"': '"',
                  "'": "'"
               } [m])) : "";
            const data = {
               ...getProgramData(p)
            };
            const thumbnail = getThumbnail(p, data);
            const thumbnailDisplay = thumbnail !== null ? `<img decoding="async" src="${thumbnail}" alt="${escapeHTML(p.name || data.name || "")}">` : '';
            const thumb = p.thumbnail_text || data.thumbnail_text;
            const style = thumb ? [
               thumb.background ? `background:${thumb.background}` : '',
               thumb.color ? `color:${thumb.color}` : ''
            ].filter(Boolean).join(';') : '';
            const name = (thumb && thumb.name) || p.name || data.name || "";
            const thumbnailText = thumb ?
               `<div class="schedule_name_box" style="${style}">${name}</div>` :
               thumbnailDisplay;
            const programIdCheck = PROGRAMS.find(x => x.id === data.id);

            const el = document.createElement("div");
            el.className = p.subschedule === true ? "schedule_program small" : "schedule_program";

            const displayName = p.name || data.name || "";
            const isRestricted = !programIdCheck || data.id === null || p.private === true || data.private === true ||
               stations.disable_programs === true || CONFIG.disable_programs === true || CONFIG.disable_programs_info === true;

            const programUrl = data.url_immediately ?
               `<div class="schedule_program_name" style="cursor:pointer;"><a href="${data.url_immediately}" target="_blank">${displayName}</a></div>` :
               `<div class="schedule_program_name" style="cursor:pointer;"><a href="program?uid=${data.id}&st=${SITE_ID}" target="_blank">${displayName}</a></div>`; // Dodano ' po ${data.id}

            const programUrlN = data.url_immediately ?
               `<div class="schedule_program_name" style="cursor:pointer;"><a href="${data.url_immediately}" target="_blank">${displayName}</a></div>` :
               `<div class="schedule_program_name">${displayName}</div>`;

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
   const now = new Date();
   const currentDay = now.getDay().toString();
   const currentTime = now.toTimeString().slice(0, 8);
   const station = STATIONS.find(x => x.id === CURRENT_STATION_ID);

   // Szybkie wyjście, jeśli radio plug jest aktywne
   const isRadioPlugActive = station?.radio_plug && CONFIG.radio_plug;
   const yesterday = (now.getDay() === 0 ? 6 : now.getDay() - 1).toString();

   document.querySelectorAll('.schedule_program').forEach(row => {
      if (isRadioPlugActive) {
         row.classList.remove('onair');
         return;
      }

      const {
         start,
         end,
         midnight
      } = row.dataset;
      if (!start || !end) return;

      const isMidnightType = midnight === "true";
      const crossesMidnight = start > end;
      const dayOfTab = row.closest('.schedule_list').id.replace('day_', '');

      let active = false;

      if (dayOfTab === currentDay) {
         if (isMidnightType) {
            // Ignorujemy w dzisiejszym tabie, bo "fizycznie" są wczorajsze
            active = false;
         } else if (crossesMidnight) {
            // Startuje dzisiaj wieczorem i trwa do jutra
            active = (currentTime >= start);
         } else {
            // Standardowy czas w ciągu dnia
            active = (currentTime >= start && currentTime < end);
         }
      } else if (dayOfTab === yesterday) {
         if (isMidnightType) {
            // Np. 01:00-02:00 rano dnia dzisiejszego (wyświetlane w tabie wczoraj)
            active = (currentTime >= start && currentTime < end);
         } else if (crossesMidnight) {
            // "Ogon" audycji 23:00-01:00, sprawdzamy czy jeszcze trwa po północy
            active = (currentTime < end);
         }
      }

      row.classList.toggle('onair', active);
   });
}

// =====================
// PROGRAM LIST
// =====================
function renderPrograms() {
   const container = document.getElementById("program_list");
   const filter = document.getElementById("categoryFilter").value;
   const search = document.getElementById("searchInput").value.toLowerCase(); // Pobieramy frazę
   const escapeHTML = (str) =>
      str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&',
         '<': '<',
         '>': '>',
         '"': '"',
         "'": "'"
      } [m])) : "";

   container.innerHTML = "";

   PROGRAMS
      .filter(p => {
         // 1. Podstawowe filtry widoczności
         if (p.hide_in_program || p.hide_in_schedule || p.private || p.archive || p.hide_only_information_schedule) return false;

         // 2. Filtr stacji (poprawiony - bezpieczne sprawdzanie)
         // Jeśli podcast ma przypisane stacje, musi zawierać CURRENT_STATION
         if (p.station && !p.station.includes(CURRENT_STATION)) return false;

         // 3. Logika category_not_all: 
         // Jeśli true, podcast jest ukryty na liście głównej (filter === "")
         if (p.category_not_all && filter === "") return false;

         // 4. Filtr konkretnej kategorii (jeśli wybrana w select)
         if (filter !== "" && !(p.category && p.category.includes(filter))) return false;

         // 5. Wyszukiwarka tekstowa
         const searchLower = search.toLowerCase();
         const name = (p.name || "").toLowerCase();
         const host = (p.host || "").toLowerCase();
         return name.includes(searchLower) || host.includes(searchLower);
      })
      .sort((a, b) => {
         const sortA = a.sorted || "";
         const sortB = b.sorted || "";
         const result = sortA.toString().localeCompare(sortB.toString(), undefined, {
            numeric: true
         });
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

         const programUrl = p.url_immediately ?
            `<div class="program_list_name" style="cursor:pointer;"><a href="${p.url_immediately}" target="_blank">${p.name}</a></div>` :
            `<div class="program_list_name" style="cursor:pointer;"><a href="program?uid=${p.id}&st=${SITE_ID}" target="_blank">${p.name || ""}</a></div>`;

         el.innerHTML = `
        <div class="program_list_cover">${thumbnailText}</div>
        <div>
            ${programUrl}
            <div class="program_list_host">${p.only_the_schedule_hosts === true ? '' : p.host || ""}</div>
            <div class="program_list_onair">${p.onair || ""}</div>
        </div>
      `;

         container.appendChild(el);
      });
}

// =====================
// STATIONS
// =====================
function updateStationUI(s) {
   // 1. Pobranie elementów (upewnij się, że ID w HTML są unikalne!)
   const dc = document.getElementById("AllContentDisplay"); // Label ramówki
   const dp = document.getElementById("AllProgramsDisplay"); // Label programów
   const dsContainer = document.getElementById("ScheduleDisplay"); // Div kontenera harmonogramu
   const btnDetail = document.getElementById("DetailSchBtn"); // Przycisk "Szczegółowe"
   const radioTab1 = document.getElementById("r-tab1");
   const radioTab2 = document.getElementById("r-tab2");

   // 2. Warunki logiczne
   const disableAllSchedule = (s.disable_detail_schedule && s.disable_schedule) ||
      (CONFIG.disable_detail_schedule && CONFIG.disable_schedule) ||
      s.disable_content_schedule || s.radio_listen || CONFIG.disable_content_schedule;

   const disablePrograms = s.disable_programs || CONFIG.disable_programs || CONFIG.disable_programs_info || s.radio_listen;
   const disableMainSch = s.disable_schedule || CONFIG.disable_schedule;
   const disableDetailSch = s.disable_detail_schedule || CONFIG.disable_detail_schedule;

   // 3. Zarządzanie widocznością głównych zakładek (Labels)
   dc.style.display = disableAllSchedule ? "none" : "inline-block";
   dp.style.display = disablePrograms ? "none" : "inline-block";

   // 4. Jeśli ramówka jest wyłączona, a programy włączone -> przełącz na programy
   if (disableAllSchedule && !disablePrograms) {
      radioTab2.checked = true;
   } else {
      radioTab1.checked = true;
   }

   // 5. Zarządzanie podzakładkami wewnątrz Ramówki
   if (dsContainer) {
      dsContainer.style.display = disableAllSchedule ? "none" : "block";
   }

   if (btnDetail) {
      btnDetail.style.display = disableDetailSch ? "none" : "inline-block";
   }

   // 6. Obsługa specyficznego przypadku: jeśli główny tydzień jest wyłączony, wymuś widok szczegółowy
   if (disableMainSch && !disableDetailSch) {
      // Ukrywamy wszystko i pokazujemy tylko sch_detail
      document.querySelectorAll(".tabcontent").forEach(el => el.style.display = "none");
      document.querySelectorAll(".tablinks").forEach(el => el.classList.remove("active"));

      const detailTab = document.getElementById('sch_detail');
      if (detailTab) detailTab.style.display = "block";
      if (btnDetail) btnDetail.classList.add("active");
   } else {
      // Domyślnie pokaż sch_schedule (Tydzień)
      openTab(null, 'sch_schedule');
   }
}

function renderStations() {
   const select = document.getElementById("stationSelect");
   const player = document.getElementById("player");

   const params = new URLSearchParams(window.location.search);
   const stationSlug = params.get('st');

   // 1. Ustalenie stacji startowej
   let initialStationIndex = 0;
   if (stationSlug) {
      const foundIndex = STATIONS.findIndex(s => s.id === stationSlug || s.slug === stationSlug);
      if (foundIndex !== -1) initialStationIndex = foundIndex;
   }

   // 2. Renderowanie listy i inicjalizacja
   STATIONS.forEach((s, i) => {
      if (!s.no_on_player) {
         const opt = document.createElement("option");
         opt.value = s.id;
         opt.textContent = s.name;
         if (i === initialStationIndex) opt.selected = true;
         select.appendChild(opt);
      }

      if (i === initialStationIndex) {
         setupStation(s, false);
      }
   });

   function setupStation(s, shouldPlay = false) {
      CURRENT_STATION = s.station_schedule;
      CURRENT_STATION_ID = s.id;

      AudioPlayer(s.stream); // Uruchamia logikę odtwarzacza
      updateStationUI(s);
      playlistNowPlaying(s.playlist);

      if (shouldPlay) {
         player.play().catch(() => console.log("Wymagana interakcja użytkownika do startu audio"));
      }
      reloadAll();
   }

   select.onchange = () => {
      const s = STATIONS.find(x => x.id === select.value);
      if (s) setupStation(s, true);
   };
}

function AudioPlayer(url) {
   const audio = document.getElementById('player');

   // Czyszczenie poprzedniej instancji HLS
   if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
   }

   const sm = url.slice(0, 7) === 'http://' ?
      'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(url) : url;

   if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
         hlsInstance = new Hls();
         hlsInstance.loadSource(sm);
         hlsInstance.attachMedia(audio);
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
         audio.src = sm;
      }
   } else {
      audio.src = sm;
   }
}

function ReloadAudio() {
   const audio = document.getElementById('player');
   // Jeśli używamy HLS, bierzemy URL z instancji, w przeciwnym razie z src audio
   const currentUrl = hlsInstance ? hlsInstance.url : audio.src;

   if (currentUrl) {
      console.log("Przeładowuję strumień...");
      // Ważne: przy przeładowaniu warto zapamiętać, czy grało, 
      // bo zmiana src zatrzyma odtwarzanie.
      const wasPlaying = !audio.paused;
      AudioPlayer(currentUrl);
      if (wasPlaying) audio.play();
   }
}

function reloadAll() {
   if (typeof renderCurrent === "function") renderCurrent();
   if (typeof renderSchedules === "function") renderSchedules();
   if (typeof renderPrograms === "function") renderPrograms();
   if (typeof updateOnAirStatus === "function") updateOnAirStatus();
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
         const argument = match[2]; // np. antbal_new

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
