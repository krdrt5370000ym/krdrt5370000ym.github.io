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

let PROGRAMS = [],
   IMAGES = [],
   SCHEDULE = [],
   SCHEDULEDETAIL = [],
   STATIONS = [],
   CONFIG = [];

let lastDay = new Date().getDay();

// =====================
// LOAD
// =====================
async function loadData(siteId) {
   const baseUrl = `https://krdrt5370000ym.github.io/radios/json/${siteId}`;
   SITE_ID = siteId;

   // Helper z rozszerzoną diagnostyką
   const fetchJson = async (suffix) => {
      try {
         const response = await fetch(`${baseUrl}_${suffix}.json`);
         if (!response.ok) throw new Error(`Status: ${response.status}`);
         return await response.json();
      } catch (err) {
         console.warn(`⚠️ Błąd ładowania ${suffix}:`, err.message);
         return null;
      }
   };

   try {
      const [images, programs, schedule, scheduledetail, stations, config] = await Promise.all([
         fetchJson("images"),
         fetchJson("programs"),
         fetchJson("schedule"),
         fetchJson("scheduledetail"),
         fetchJson("station"),
         fetchJson("config")
      ]);

      // ✅ Mapowanie z zabezpieczeniem typów
      IMAGES = images || [];
      PROGRAMS = programs || [];

      // Obsługa SCHEDULE (sprawdza czy to tablica)
      SCHEDULE = Array.isArray(schedule) ? schedule : [];

      // Obsługa SCHEDULEDETAIL
      SCHEDULEDETAIL = Array.isArray(scheduledetail) ? scheduledetail : [];

      // ✅ KLUCZOWE: STATIONS często ma strukturę { station: [...] }
      if (stations && stations.station) {
         STATIONS = stations.station;
      } else if (Array.isArray(stations)) {
         STATIONS = stations;
      } else {
         STATIONS = [];
      }

      // Obsługa CONFIG
      CONFIG = (Array.isArray(config) ? config[0] : config) || {};

      console.log("✅ Dane załadowane pomyślnie. Stacji:", STATIONS.length);

      // Inicjalizacja widoku po załadowaniu
      if (typeof renderSchedules === "function") renderSchedules();
      if (typeof renderCurrent === "function") renderCurrent();

   } catch (error) {
      console.error("❌ Krytyczny błąd loadData:", error);
   }
}

// =====================
// HELPERS
// =====================
// ✅ POPRAWIONE: Domknięcie funkcji escapeHTML
const escapeHTML = (str) =>
   str ? String(str).replace(/[&<>"']/g, m => ({
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": "'"
   } [m])) : "";

// ✅ POPRAWIONE: Zabezpieczenie przed pusta wartością (undefined/null)
function formatHour(h) {
   if (!h) return "";
   return h.slice(0, 5);
}

const MonthWeekCalculator = (dateInput, requestedWeeks) => {
   const date = new Date(dateInput);
   const day = date.getDate();
   const month = date.getMonth();
   const year = date.getFullYear();
   const daysInMonth = new Date(year, month + 1, 0).getDate();

   const getWeekByStartDay = (currentDay, targetDayIdx, reverse = false) => {
      if (!reverse) {
         const firstOfMonth = new Date(year, month, 1).getDay();
         const offset = (firstOfMonth - targetDayIdx + 7) % 7;
         return Math.ceil((currentDay + offset) / 7);
      } else {
         const lastOfMonth = new Date(year, month, daysInMonth).getDay();
         const distFromEnd = daysInMonth - currentDay + 1;
         const offset = (targetDayIdx - lastOfMonth + 7) % 7;
         return Math.ceil((distFromEnd + offset) / 7);
      }
   };

   const firstMon = getWeekByStartDay(day, 1);
   const calculations = {
      dayGroup: Math.ceil(day / 7),
      lastDayGroup: Math.ceil((daysInMonth - day + 1) / 7),
      firstSunday: getWeekByStartDay(day, 0),
      firstMonday: firstMon,
      firstTuesday: getWeekByStartDay(day, 2),
      firstWednesday: getWeekByStartDay(day, 3),
      firstThursday: getWeekByStartDay(day, 4),
      firstFriday: getWeekByStartDay(day, 5),
      firstSaturday: getWeekByStartDay(day, 6),
      lastSunday: getWeekByStartDay(day, 0, true),
      lastMonday: getWeekByStartDay(day, 1, true)
   };

   for (let i = 2; i <= 16; i++) {
      calculations[`mod${i}`] = ((firstMon - 1) % i) + 1;
   }

   if (typeof requestedWeeks === 'string') return calculations[requestedWeeks];
   if (Array.isArray(requestedWeeks)) {
      const results = {};
      requestedWeeks.forEach(k => {
         if (calculations[k]) results[k] = calculations[k];
      });
      return results;
   }
   return calculations;
};

// ✅ Zarządzanie zakładkami (Ramówka / Programy)
function openTab(evt, tabName) {
   document.querySelectorAll(".tabcontent").forEach(el => el.style.display = "none");
   document.querySelectorAll(".tablinks").forEach(el => el.classList.remove("active"));

   const targetTab = document.getElementById(tabName);
   if (targetTab) targetTab.style.display = "block";

   if (evt && evt.currentTarget) {
      evt.currentTarget.classList.add("active");
   }

   // Jeśli otwieramy szczegółową listę, odświeżamy ją
   if (tabName === 'sch_detail') renderSDetails();
}

function openDayTab(event, dayId) {
   // 1. Ukryj wszystkie listy dni
   document.querySelectorAll(".schedule_list").forEach(el => {
      el.style.display = "none";
   });

   // 2. Usuń klasę active ze wszystkich przycisków dni
   document.querySelectorAll(".day_tablinks").forEach(btn => {
      btn.classList.remove("active");
   });

   // 3. Pokaż wybraną listę
   const selectedTab = document.getElementById("day_" + dayId);
   if (selectedTab) {
      selectedTab.style.display = "block";
   }

   // 4. Dodaj klasę active do klikniętego przycisku
   if (event && event.currentTarget) {
      event.currentTarget.classList.add("active");
   }

   // 5. Odśwież statusy ON AIR dla nowo pokazanego dnia
   if (typeof updateOnAirStatus === "function") {
      updateOnAirStatus();
   }
}

// ✅ Sprawdzanie zakresu czasu (obsługa audycji nocnych)
function isInTimeRange(start, end, current) {
   if (!start || !end) return false;
   if (start <= end) {
      return current >= start && current < end;
   } else {
      // Przejście przez północ: current musi być PO starcie LUB PRZED końcem
      return current >= start || current < end;
   }
}

function getActiveScheduleBlock(date = new Date()) {
   return SCHEDULE.find(block => {
      if (!block.startDate || !block.EndDate) return false;
      return date >= new Date(block.startDate) && date <= new Date(block.EndDate);
   }) || SCHEDULE.find(b => b.scheduleID === 0) || {
      schedule: []
   };
}

// ✅ Pobieranie rozszerzonych danych o programie
function getProgramData(p) {
   if (!p) return {};
   // Szukamy w stałej bazie PROGRAMS po ID
   const found = PROGRAMS.find(x => x.id === p.id);
   // Zwracamy znalezione dane lub sam obiekt p (zabezpieczone przed null)
   return found || p || {};
}

// ✅ POPRAWIONE OBRAZKI (Zgodnie z Twoją strukturą IMAGES)
function getThumbnail(p, data) {
   // 1. Sprawdź thumbnail_id w programie lub danych bazowych
   const tId = p.thumbnail_id || (data && data.thumbnail_id);
   if (tId) {
      // Szukamy w załadowanej liście obrazków
      const img = IMAGES.find(i => i.id === tId || i.thumbnail_id === tId);
      if (img) return img.url || img.thumbnail_uri;
   }

   // 2. Sprawdź bezpośrednie linki uri w obiektach
   if (p.thumbnail_uri) return p.thumbnail_uri;
   if (data && data.thumbnail_uri) return data.thumbnail_uri;
   if (p.cover) return p.cover;

   // 3. Fallback: Jeśli nic nie ma, zwróć cover aktualnej stacji
   const station = STATIONS.find(s => s.id === CURRENT_STATION_ID);
   return station ? station.cover : null;
}

// =====================
// ON AIR
// =====================
function renderCurrent() {
   const now = new Date();
   const day = now.getDay().toString();
   const yesterday = (now.getDay() === 0 ? 6 : now.getDay() - 1).toString();
   const time = now.toTimeString().slice(0, 8);
   const localIsoDate = now.toLocaleDateString('sv-SE');

   const station = STATIONS.find(x => x.id === CURRENT_STATION_ID);
   if (!station) return;

   // 1. OBSŁUGA ZEWNĘTRZNYCH API (np. Grupa ZPR)
   // Jeśli stacja ma pole "schedule" w JSON, oddajemy kontrolę zewnętrznej funkcji
   if (station.schedule && !station.radio_plug && !station.radio_listen && (!CONFIG || !CONFIG.radio_plug)) {
      scheduleCurrent(station.schedule);
      // Jeśli funkcja zewnętrzna została znaleziona i uruchomiona, przerywamy lokalne renderowanie
      if (SCHEDULE_APP === 1) return;
   }
   // Jeśli nie ma zewnętrznej funkcji, resetujemy flagę i kontynuujemy lokalną logikę
   SCHEDULE_APP = null;

   // 2. LOGIKA LOKALNEJ RAMÓWKI
   const activeBlock = getActiveScheduleBlock(now);
   const scheduleSource = activeBlock ? activeBlock.schedule : [];

   const filtered = scheduleSource.filter(p => {
      // Filtr A: Aktywność i data publikacji
      const isPublished = p.publish_from_date ? now >= new Date(p.publish_from_date) : true;
      if (!p.active || !isPublished) return false;

      // Filtr B: Przynależność do stacji
      const isForStation = (!p.station || p.station.includes(CURRENT_STATION_ID)) &&
         !p.station_exclude?.includes(CURRENT_STATION_ID);
      if (!isForStation) return false;

      // Filtr C: Czas i Dni (obsługa audycji nocnych)
      let timeMatch = false;
      const isMidnight = p.midnight === true;
      const startsBeforeMidnight = p.hour_start > p.hour_end;

      if (p.days.includes(yesterday) && startsBeforeMidnight && time < p.hour_end) {
         timeMatch = true;
      } else if (p.days.includes(day)) {
         if (isMidnight) timeMatch = time >= p.hour_start && time < p.hour_end;
         else if (startsBeforeMidnight) timeMatch = time >= p.hour_start;
         else timeMatch = time >= p.hour_start && time < p.hour_end;
      }
      if (!timeMatch) return false;

      // Filtr D: Logika WeekMonth (Inkluzja)
      if (p.weekmonth) {
         const keys = Object.keys(p.weekmonth);
         const stats = MonthWeekCalculator(localIsoDate, keys);
         if (!keys.every(k => stats[k] === p.weekmonth[k])) return false;
      }

      // Filtr E: Logika WeekMonth Exclude (Wykluczenie)
      if (p.weekmonth_exclude) {
         const exKeys = Object.keys(p.weekmonth_exclude);
         const exStats = MonthWeekCalculator(localIsoDate, exKeys);
         if (exKeys.every(k => exStats[k] === p.weekmonth_exclude[k])) return false;
      }

      return true;
   }).sort((a, b) => {
      // Sortowanie po priorytecie: Stacja (4) > Tydzień (2) > Subschedule (1)
      const getScore = (i) => (i.station ? 4 : 0) + (i.weekmonth ? 2 : 0) + (i.subschedule ? 1 : 0);
      const diff = getScore(b) - getScore(a);
      return diff !== 0 ? diff : b.hour_start.localeCompare(a.hour_start);
   });

   const program = filtered[0]; // Pobieramy najlepiej pasującą audycję
   const ui = {
      item: document.querySelector(".current_program_item"),
      hour: document.querySelector(".current_program_hour"),
      title: document.querySelector(".current_program_title"),
      host: document.querySelector(".current_program_host"),
      photo: document.querySelector(".current_program_photo")
   };

   // 3. RENDEROWANIE WIDOKU
   if (!program || station.radio_plug || (CONFIG && CONFIG.radio_plug)) {
      if (ui.item) ui.item.textContent = "";
      if (ui.hour) ui.hour.textContent = "";
      if (ui.title) {
         ui.title.style.fontWeight = '400';
         ui.title.textContent = station.plug_name || station.name || "Radio Online";
      }
      if (ui.host) ui.host.textContent = "";
      if (ui.photo) ui.photo.innerHTML = `<img src="${station.cover}" alt="Radio Logo">`;
      return;
   }

   const data = getProgramData(program);
   if (ui.item) ui.item.textContent = program.item || "";
   if (ui.hour) ui.hour.textContent = `${formatHour(program.hour_start)} - ${formatHour(program.hour_end)}`;
   if (ui.title) {
      ui.title.style.fontWeight = '600';
      ui.title.textContent = program.name || data.name || "";
   }
   if (ui.host) ui.host.textContent = program.host || data.host || "";
   if (ui.photo) ui.photo.innerHTML = `<img src="${getThumbnail(program, data)}" alt="Program Cover">`;
}

// =====================
// SCHEDULES
// =====================
function renderSchedules() {
   const tabs = document.getElementById("days");
   const contents = document.getElementById("day_contents");
   const stations = STATIONS.find(x => x.id === CURRENT_STATION_ID);
   if (!tabs || !contents) return;

   tabs.innerHTML = "";
   contents.innerHTML = "";

   const now = new Date();
   const today = now.getDay().toString();
   const localIsoDate = now.toLocaleDateString('sv-SE');

   // 1. Pobierz aktywny blok harmonogramu (ID:0 lub specjalny zakres dat)
   const activeBlock = getActiveScheduleBlock(now);
   const scheduleSource = activeBlock ? activeBlock.schedule : [];

   dayOrder.forEach(day => {
      const btn = document.createElement("button");
      btn.className = "day_tablinks" + (day === today ? " active" : "");
      btn.textContent = dayNames[day];

      const tab = document.createElement("div");
      tab.className = "schedule_list";
      tab.id = "day_" + day;
      tab.style.display = day === today ? "block" : "none";

      btn.onclick = (e) => openDayTab(e, day);

      // 2. Filtrowanie ramówki
      scheduleSource
         .filter(p => {
            const data = getProgramData(p);
            const tomorrow = ((parseInt(day) + 1) % 7).toString();

            // --- FILTR A: Publikacja i Aktywność ---
            const isPublished = p.publish_from_date ? now >= new Date(p.publish_from_date) : true;
            if (!p.active || !isPublished || data.hide_in_schedule) return false;

            // --- FILTR B: Czas i Dni (Nocne/Zwykłe) ---
            const isMidnightForThisDay = p.midnight && p.days.includes(tomorrow);
            const isRegularForThisDay = !p.midnight && p.days.includes(day);
            if (!(isRegularForThisDay || isMidnightForThisDay)) return false;

            // --- FILTR C: Stacja ---
            const isForStation = (!p.station || p.station.includes(CURRENT_STATION_ID)) &&
               !p.station_exclude?.includes(CURRENT_STATION_ID);
            if (!isForStation) return false;

            // --- FILTR D: Logika WeekMonth (Tylko dla zakładki "Dzisiaj") ---
            // Stosujemy to tylko dzisiaj, aby użytkownik widział co faktycznie leci teraz.
            if (day === today) {
               // Inkluzja (musi pasować)
               if (p.weekmonth) {
                  const keys = Object.keys(p.weekmonth);
                  const stats = MonthWeekCalculator(localIsoDate, keys);
                  if (!keys.every(k => stats[k] === p.weekmonth[k])) return false;
               }
               // Ekskluzja (nie może pasować)
               if (p.weekmonth_exclude) {
                  const exKeys = Object.keys(p.weekmonth_exclude);
                  const exStats = MonthWeekCalculator(localIsoDate, exKeys);
                  if (exKeys.every(k => exStats[k] === p.weekmonth_exclude[k])) return false;
               }
            }

            return true;
         })
         .sort((a, b) => {
            const hourA = a.midnight ? "24:" + a.hour_start : a.hour_start;
            const hourB = b.midnight ? "24:" + b.hour_start : b.hour_start;
            return hourA.localeCompare(hourB);
         })
         .forEach(p => {
            const data = getProgramData(p);
            const thumbnail = getThumbnail(p, data);
            const thumb = p.thumbnail_text || data.thumbnail_text;

            // Miniatura/Box
            let thumbnailHTML = "";
            if (thumb) {
               const style = [
                  thumb.background ? `background:${thumb.background}` : '',
                  thumb.color ? `color:${thumb.color}` : ''
               ].filter(Boolean).join(';');
               thumbnailHTML = `<div class="schedule_name_box" style="${style}">${thumb.name || p.name || data.name || ""}</div>`;
            } else if (thumbnail) {
               thumbnailHTML = `<img decoding="async" src="${thumbnail}" alt="cover">`;
            }

            // Linkowanie
            const displayName = p.name || data.name || "Audycja";
            const isRestricted = !data.id || p.private || data.private ||
               stations?.disable_programs || CONFIG.disable_programs;

            const url = data.url_immediately || `program?uid=${data.id}&st=${SITE_ID}`;
            const nameHTML = isRestricted ?
               `<div class="schedule_program_name">${displayName}</div>` :
               `<div class="schedule_program_name"><a href="${url}" target="_blank">${displayName}</a></div>`;

            const el = document.createElement("div");
            el.className = p.subschedule ? "schedule_program small" : "schedule_program";
            el.dataset.id = p.id;
            el.dataset.start = p.hour_start;
            el.dataset.end = p.hour_end;
            el.dataset.midnight = p.midnight ? "true" : "false";

            el.innerHTML = `
               <div class="schedule_program_cover">${thumbnailHTML}</div>
               <div class="schedule_program_content">
                   <div class="schedule_program_item">${p.item || ""}</div>
                   <div class="schedule_program_data">${formatHour(p.hour_start)} - ${formatHour(p.hour_end)}</div>
                   ${nameHTML}
                   <div class="schedule_program_host">${p.host || data.host || ""}</div>
                   ${p.comment ? `<div class="schedule_program_comment">${p.comment}</div>` : ''}
               </div>
            `;
            tab.appendChild(el);
         });

      tabs.appendChild(btn);
      contents.appendChild(tab);
   });

   updateOnAirStatus();
}

function initDefaultTab() {
   const currentDay = new Date().getDay().toString();
   // Symulujemy kliknięcie lub wywołujemy bezpośrednio dla dzisiejszego dnia
   openTab(null, currentDay);
}

function switchScheduleDay(dayId) {
   document.querySelectorAll('.schedule_list').forEach(el => {
      el.style.display = 'none';
   });
   const selectedDay = document.getElementById(`day_${dayId}`);
   if (selectedDay) selectedDay.style.display = 'block';

   // Opcjonalnie: aktualizacja klasy active na przyciskach menu
   document.querySelectorAll('.day_tab_btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.day === dayId);
   });
}
// =====================
// ON AIR STATUS
// =====================
function updateOnAirStatus() {
   const now = new Date();
   const currentDay = now.getDay().toString();
   const currentTime = now.toTimeString().slice(0, 8);
   const yesterday = (now.getDay() === 0 ? 6 : now.getDay() - 1).toString();
   const localIsoDate = now.toLocaleDateString('sv-SE');

   const station = STATIONS.find(x => x.id === CURRENT_STATION_ID);
   const isRadioPlugActive = station?.radio_plug || (CONFIG && CONFIG.radio_plug);

   // 1. Pobierz aktualnie aktywny blok danych
   const activeBlock = getActiveScheduleBlock(now);

   document.querySelectorAll('.schedule_program').forEach(row => {
      // Szybkie wyjście, jeśli radio plug jest aktywne
      if (isRadioPlugActive) {
         row.classList.remove('onair');
         return;
      }

      const {
         start,
         end,
         midnight,
         id
      } = row.dataset;
      if (!start || !end) return;

      // 2. Znajdź dane programu w aktualnym bloku, aby sprawdzić weekmonth
      const prog = activeBlock?.schedule.find(p => p.id === id || (p.hour_start === start && p.hour_end === end));

      // --- LOGIKA TYGODNIOWA I PUBLIKACJI ---
      if (prog) {
         // Sprawdź czy program jest już opublikowany
         const isPublished = prog.publish_from_date ? now >= new Date(prog.publish_from_date) : true;
         if (!prog.active || !isPublished) {
            row.classList.remove('onair');
            return;
         }

         // Sprawdź inkluzję weekmonth
         if (prog.weekmonth) {
            const keys = Object.keys(prog.weekmonth);
            const stats = MonthWeekCalculator(localIsoDate, keys);
            if (!keys.every(k => stats[k] === prog.weekmonth[k])) {
               row.classList.remove('onair');
               return;
            }
         }

         // Sprawdź ekskluzję weekmonth_exclude
         if (prog.weekmonth_exclude) {
            const exKeys = Object.keys(prog.weekmonth_exclude);
            const exStats = MonthWeekCalculator(localIsoDate, exKeys);
            if (exKeys.every(k => exStats[k] === prog.weekmonth_exclude[k])) {
               row.classList.remove('onair');
               return;
            }
         }
      }

      // --- LOGIKA CZASOWA (On Air) ---
      const isMidnightType = midnight === "true";
      const crossesMidnight = start > end;
      const dayOfTab = row.closest('.schedule_list').id.replace('day_', '');

      let isActive = false;

      if (dayOfTab === currentDay) {
         if (isMidnightType) {
            // Te audycje "należą" do wczorajszego dnia kalendarzowego
            isActive = false;
         } else if (crossesMidnight) {
            // Startuje dzisiaj wieczorem (np. 22:00) i trwa po północy
            isActive = (currentTime >= start);
         } else {
            // Standardowy czas w ciągu dnia
            isActive = (currentTime >= start && currentTime < end);
         }
      } else if (dayOfTab === yesterday) {
         if (isMidnightType) {
            // Audycja wyświetlana we wczorajszym tabie, ale trwająca dzisiaj rano (np. 01:00)
            isActive = (currentTime >= start && currentTime < end);
         } else if (crossesMidnight) {
            // "Ogon" audycji startującej wczoraj o 22:00, sprawdzamy czy jeszcze trwa rano
            isActive = (currentTime < end);
         }
      }

      // 3. Dodaj lub usuń klasę CSS
      row.classList.toggle('onair', isActive);
   });
}

// =====================
// SCHEDULE DETAIL LIST
// =====================
function renderSDetails() {
   const container = document.getElementById("sdetail_list");
   if (!container) return;

   const now = new Date();
   const escapeHTML = (str) =>
      str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&',
         '<': '<',
         '>': '>',
         '"': '"',
         "'": "'"
      } [m])) : "";

   container.innerHTML = "";

   // 1. Znajdź aktywny blok w SCHEDULEDETAIL (np. specjalny zakres dat lub domyślny ID: 0)
   const activeDetailBlock = SCHEDULEDETAIL.find(block => {
      if (!block.startDate || !block.EndDate) return false;
      const start = new Date(block.startDate);
      const end = new Date(block.EndDate);
      return now >= start && now <= end;
   }) || SCHEDULEDETAIL.find(block => block.scheduleID === 0);

   // Jeśli nie znaleziono żadnego pasującego bloku danych
   if (!activeDetailBlock || !activeDetailBlock.schedule) {
      container.innerHTML = '<div class="no_detail">Brak dostępnych szczegółów ramówki.</div>';
      return;
   }

   // 2. Renderowanie elementów z wybranego bloku
   activeDetailBlock.schedule
      .filter(p => {
         if (p.active === false) return false;

         // Opcjonalne filtrowanie po stacji
         if (p.station && Array.isArray(p.station)) {
            if (!p.station.includes(CURRENT_STATION_ID)) return false;
         }
         return true;
      })
      .forEach(p => {
         const els = document.createElement("div");
         els.className = "sdetail_list_content";

         // Pobieranie i zabezpieczanie danych
         const name = p.name || "Bez nazwy";
         const host = escapeHTML(p.host || "");
         const onair = escapeHTML(p.onair || "");
         const url = p.url || null;

         const nameHTML = url ?
            `<div class="schedule_detail_name" style="cursor:pointer;"><a href="${url}" target="_blank">${name}</a></div>` :
            `<div class="schedule_detail_name">${name}</div>`;

         els.innerHTML = `
            ${nameHTML}
            ${host ? `<div class="schedule_detail_host">${host}</div>` : ''}
            ${onair ? `<div class="schedule_detail_onair">${onair}</div>` : ''}
         `;
         container.appendChild(els);
      });

   // Fallback, gdyby filtr odrzucił wszystkie audycje w bloku
   if (container.innerHTML === "") {
      container.innerHTML = '<div class="no_detail">Brak audycji dla tej stacji.</div>';
   }
}

// =====================
// PROGRAM LIST
// =====================
function renderPrograms() {
   const container = document.getElementById("program_list");
   const filter = document.getElementById("categoryFilter").value;
   const search = document.getElementById("searchInput").value.toLowerCase();

   if (!container) return;

   const escapeHTML = (str) =>
      str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&',
         '<': '<',
         '>': '>',
         '"': '"',
         "'": "'"
      } [m])) : "";

   container.innerHTML = "";

   // 1. Pobierz aktualnie aktywny blok harmonogramu dla kontekstu prowadzących
   const activeBlock = getActiveScheduleBlock(new Date());
   const scheduleSource = activeBlock ? activeBlock.schedule : [];

   PROGRAMS
      .filter(p => {
         if (p.hide_in_program || p.hide_in_schedule || p.private || p.archive || p.hide_only_information_schedule) return false;

         // Filtr stacji
         if (p.station && !p.station.includes(CURRENT_STATION_ID)) return false;

         // Logika kategorii
         if (p.category_not_all && filter === "") return false;
         if (filter !== "" && !(p.category && p.category.includes(filter))) return false;

         // Wyszukiwarka
         const name = (p.name || "").toLowerCase();
         const host = (p.host || "").toLowerCase();
         return name.includes(search) || host.includes(search);
      })
      .sort((a, b) => {
         const sortA = a.sorted || "";
         const sortB = b.sorted || "";
         const res = sortA.toString().localeCompare(sortB.toString(), undefined, {
            numeric: true
         });
         return res !== 0 ? res : a.name.localeCompare(b.name);
      })
      .forEach(p => {
         // --- LOGIKA DYNAMICZNYCH PROWADZĄCYCH ---
         // Znajdź wszystkie wystąpienia tego programu w obecnej ramówce
         const occurrencesSch = scheduleSource.filter(osch => osch.id === p.id);

         // Wyciągnij unikalnych prowadzących przypisanych do tych wystąpień
         const occurrencesHost = [...new Set(occurrencesSch
            .map(osch => osch.host)
            .filter(h => h && h.trim() !== "")
         )];

         // Decyzja: czy brać hostów z ramówki, czy z bazy PROGRAMS
         const hostToDisplay = p.only_the_schedule_hosts ?
            (occurrencesHost.length > 0 ? occurrencesHost.join(', ') : "") :
            (p.host || "");

         // --- MINIATURA ---
         const thumb = p.thumbnail_text;
         let thumbnailHTML = "";
         if (thumb) {
            const style = [
               thumb.background ? `background:${thumb.background}` : '',
               thumb.color ? `color:${thumb.color}` : ''
            ].filter(Boolean).join(';');
            thumbnailHTML = `<div class="program_list_box" style="${style}">${thumb.name || p.name}</div>`;
         } else if (p.thumbnail_uri) {
            thumbnailHTML = `<img decoding="async" src="${p.thumbnail_uri}" alt="${escapeHTML(p.name)}">`;
         }

         // --- LINKOWANIE ---
         const url = p.url_immediately || `program?uid=${p.id}&st=${SITE_ID}`;
         const nameHTML = `<div class="program_list_name" style="cursor:pointer;"><a href="${url}" target="_blank">${p.name}</a></div>`;

         const el = document.createElement("div");
         el.className = "program_list_content";
         el.innerHTML = `
            <div class="program_list_cover">${thumbnailHTML}</div>
            <div class="program_list_info">
                ${nameHTML}
                <div class="program_list_host">${escapeHTML(hostToDisplay)}</div>
                <div class="program_list_onair">${escapeHTML(p.onair || "")}</div>
            </div>
         `;

         container.appendChild(el);
      });
}

// =====================
// STATIONS
// =====================
function ButtonsSites(s) {
   const container = document.getElementById("site_buttons_list");
   if (!container) return;

   // Pomocnicza funkcja, aby nie powtarzać logiki sprawdzania linku
   const getBtn = (link, html) => link ? html : '';

   const butWebLive = getBtn(s.button_web_live || CONFIG.button_web_live,
      `<a target="_blank" href="${s.button_web_live || CONFIG.button_web_live}" class="btn-link"><i class="fa-solid fa-tower-broadcast"></i> Słuchaj na YT</a>`);

   const butWebRadioOnline = getBtn(s.button_web_radioonline || CONFIG.button_web_radioonline,
      `<a target="_blank" href="${s.button_web_radioonline || CONFIG.button_web_radioonline}" class="btn-link">💡 Online</a>`);

   const butWebSite = getBtn(s.button_web_site || CONFIG.button_web_site,
      `<a target="_blank" href="${s.button_web_site || CONFIG.button_web_site}" class="btn-link">🌐 Strona</a>`);

   const butWebOtherSite = getBtn(s.button_web_othersite_url || CONFIG.button_web_othersite_url,
      `<a target="_blank" href="${s.button_web_othersite_url || CONFIG.button_web_othersite_url}" class="btn-link">🌐 Strona (${s.button_web_othersite_name || CONFIG.button_web_othersite_name})</a>`);

   const butWebPrograms = getBtn(s.button_web_programs || CONFIG.button_web_programs,
      `<a target="_blank" href="${s.button_web_programs || CONFIG.button_web_programs}" class="btn-link">📻 Programy</a>`);

   const butWebPodcasts = getBtn(s.button_web_podcast || CONFIG.button_web_podcast,
      `<a target="_blank" href="${s.button_web_podcast || CONFIG.button_web_podcast}" class="btn-link"><i class="fa-solid fa-podcast"></i> Podcasty</a>`);

   const butWebPlayer = getBtn(s.button_web_player || CONFIG.button_web_player,
      `<a target="_blank" href="${s.button_web_player || CONFIG.button_web_player}" class="btn-link">► Player</a>`);

   const butWebSchedule = getBtn(s.button_web_schedule || CONFIG.button_web_schedule,
      `<a target="_blank" href="${s.button_web_schedule || CONFIG.button_web_schedule}" class="btn-link">📅 Ramówka</a>`);

   const butMediaSite = getBtn(s.button_media_site || CONFIG.button_media_site,
      `<a target="_blank" href="${s.button_media_site || CONFIG.button_media_site}" class="btn-link accent"><i class="fa-solid fa-photo-film"></i> Media</a>`);

   const butMediaOtherRadio = getBtn(s.button_media_otherradio_url || CONFIG.button_media_otherradio_url,
      `<a target="_blank" href="${s.button_media_otherradio_url || CONFIG.button_media_otherradio_url}" class="btn-link accent"><i class="fa-solid fa-radio"></i> ${s.button_media_otherradio_name || CONFIG.button_media_otherradio_name}</a>`);

   container.innerHTML = `
        ${butWebLive}
        ${butWebRadioOnline}
        ${butWebSite}
        ${butWebOtherSite}
        ${butWebPrograms}
        ${butWebPodcasts}
        ${butWebPlayer}
        ${butWebSchedule}
        ${butMediaSite}
        ${butMediaOtherRadio}
    `;
}

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
      ButtonsSites(s);
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
   if (typeof renderSDetails === "function") renderSDetails();
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
   if (!scheduleString) return;

   // 1. Próba dopasowania formatu: nazwaFunkcji(argumenty)
   const match = scheduleString.match(/^(\w+)\((.*)\);?$/);

   if (match) {
      const functionName = match[1];
      const rawArgs = match[2];

      // 2. Sprawdzenie, czy funkcja o tej nazwie istnieje w globalnym zasięgu
      if (typeof window[functionName] === "function") {

         // 3. Ustawienie flagi blokady dla renderCurrent
         SCHEDULE_APP = 1;

         // 4. Parsowanie argumentów (usuwanie cudzysłowów i spacji)
         const args = rawArgs.split(',')
            .map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));

         // 5. Wywołanie funkcji z przekazanymi parametrami
         window[functionName](...args);

      } else {
         console.warn(`⚠️ Funkcja ${functionName} jest zdefiniowana w JSON, ale nie istnieje w JS.`);
         SCHEDULE_APP = null;
      }
   } else {
      // 6. Jeśli to nie funkcja, traktujemy to jako zwykły tekst informacyjny
      const resultElemS = document.getElementById('resultCP');
      if (resultElemS) {
         resultElemS.innerText = scheduleString;
      }
      SCHEDULE_APP = null;
   }
}
// =====================
// INIT
// =====================
function init() {
   renderStations();
   renderCurrent();
   renderSchedules();
   renderSDetails();
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
