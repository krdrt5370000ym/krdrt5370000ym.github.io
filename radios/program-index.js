// Funkcja formatująca dni i godziny emisji
function getDisplaySchedule(programId, schedule) {
  const daysMapFull = { "1": "Poniedziałek", "2": "Wtorek", "3": "Środa", "4": "Czwartek", "5": "Piątek", "6": "Sobota", "0": "Niedziela" };
  const daysMapShort = { "1": "Pn", "2": "Wt", "3": "Śr", "4": "Czw", "5": "Pt", "6": "Sob", "0": "Ndz" };

  const timeGroups = {};
  const firstAppearance = {};

  const filtered = schedule.filter(s => s.id === programId && s.active && !s.private && !s.hide_in_schedule);
  if (filtered.length === 0) return "";

  filtered.forEach(occ => {
    const start = (occ.hour_start || occ.start || "00:00").toString().substring(0, 5);
    const end = (occ.hour_end || occ.end || "00:00").toString().substring(0, 5);
    const timeKey = `${start} - ${end}`;

    if (!timeGroups[timeKey]) timeGroups[timeKey] = new Set();
    const rawDays = occ.days !== undefined ? occ.days : (occ.day !== undefined ? occ.day : []);
    const days = Array.isArray(rawDays) ? rawDays : [rawDays];

    days.forEach(d => {
      if (d !== null && d !== undefined) {
        const dStr = d.toString();
        timeGroups[timeKey].add(dStr);
        const sortVal = dStr === "0" ? 7 : parseInt(dStr);
        const weight = sortVal * 10000 + parseInt(start.replace(":", ""));
        if (!firstAppearance[timeKey] || weight < firstAppearance[timeKey]) firstAppearance[timeKey] = weight;
      }
    });
  });

  const sortedTimeKeys = Object.keys(timeGroups).sort((a, b) => firstAppearance[a] - firstAppearance[b]);

  const result = sortedTimeKeys.map(timeKey => {
    const sortedDays = Array.from(timeGroups[timeKey]).sort((a, b) => (a == "0" ? 7 : a) - (b == "0" ? 7 : b));
    
    let parts = [];
    let i = 0;
    while (i < sortedDays.length) {
      let j = i;
      while (j < sortedDays.length - 1) {
        const curr = sortedDays[j] == "0" ? 7 : parseInt(sortedDays[j]);
        const next = sortedDays[j + 1] == "0" ? 7 : parseInt(sortedDays[j + 1]);
        if (next === curr + 1) j++;
        else break;
      }

      const diff = j - i;
      if (diff >= 2) { 
        // Zakres: Pn - Śr
        parts.push(`${daysMapShort[sortedDays[i]]} - ${daysMapShort[sortedDays[j]]}`);
      } else if (diff === 1) {
        // Para: Pn i Wt
        parts.push(`${daysMapShort[sortedDays[i]]} i ${daysMapShort[sortedDays[j]]}`);
      } else {
        // Pojedynczy: Pn
        parts.push(daysMapShort[sortedDays[i]]);
      }
      i = j + 1;
    }

    let dayString;
    if (sortedDays.length === 1 && sortedTimeKeys.length === 1) {
      dayString = daysMapFull[sortedDays[0]];
    } else {
      dayString = parts.join(", ");
    }

    return `${dayString} ${timeKey}`;
  });

  return result.join(" | ");
}

async function uruchomProgram() {
   const params = new URLSearchParams(window.location.search);
   const uid = params.get('uid');
   const station = params.get('st');

   if (!uid || !station) {
      document.body.innerHTML = "Błąd: Brak parametrów 'uid' lub 'st'.";
      document.title = window.location.href;
      return;
   }

   try {
      // Funkcja pomocnicza z POPRAWIONĄ ŚCIEŻKĄ: /radios/json/
      const fetchJSON = async (fileName) => {
         const url = `https://krdrt5370000ym.github.io/radios/json/${station}_${fileName}.json`;
         try {
            const res = await fetch(url);
            if (!res.ok) return fileName === 'config' ? {} : [];

            const data = await res.json();

            // Twoja poprawka: standaryzacja CONFIG i SCHEDULE
            if (fileName === 'config') {
               return (Array.isArray(data) ? data[0] : data) || {};
            }

            // Dla schedule i programs upewniamy się, że to zawsze tablica (do .filter i .find)
            return Array.isArray(data) ? data : [];

         } catch (e) {
            return (fileName === 'config' || fileName === 'schedule') ? {} : [];
         }
      };

      // Wywołanie w Promise.all pozostaje bez zmian:
      const [PROGRAMS, SCHEDULE, CONFIG] = await Promise.all([
         fetchJSON('programs'),
         fetchJSON('schedule'),
         fetchJSON('config')
      ]);

      const program = PROGRAMS.find(p => p.id === uid);

      if (!program || program.hide_in_schedule || program.private || CONFIG.disable_programs_info) {
         document.body.innerHTML = `Nie znaleziono programu o ID: ${uid}`;
         document.title = window.location.href;
         return;
      }

      if (program.url_immediately) {
         window.location.href = program.url_immediately;
         return;
      }

      // 2. Logika emisji i prowadzących
      const occurrencesSch = SCHEDULE.filter(osch => osch.id === uid && osch.active && !osch.private && !osch.hide_in_schedule);
      const scheduleInfo = getDisplaySchedule(uid, SCHEDULE);

      if (program.hide_only_information_schedule && occurrencesSch.length === 0) {
         document.body.innerHTML = `Nie znaleziono programu o ID: ${uid}`; // Brak planowanych emisji
         document.title = window.location.href;
         return;
      }

      const occurrencesHost = [...new Set(occurrencesSch.flatMap(osch => osch.host || []))];
      const occurrencesHostA = program.only_the_schedule_hosts ?
         (occurrencesHost.length > 0 ? occurrencesHost.join(', ') : "---") :
         (program.host || "---");

      // 3. Renderowanie HTML
      const escapeHTML = (str) => str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&',
         '<': '<',
         '>': '>',
         '"': '"',
         "'": "'"
      } [m])) : "";

      const thumb = program.thumbnail_text;
      const style = thumb ? `background:${thumb.background || ''};color:${thumb.color || ''}` : '';
      const thumbnailText = thumb ?
         `<div class="podcast_info_name_box" style="${style}">${escapeHTML(thumb.name || program.name)}</div>` :
         (program.thumbnail_uri ? `<img src="${program.thumbnail_uri}" alt="${escapeHTML(program.name)}">` : "");

      const emailContact = (Array.isArray(program.email) && program.email.length > 0) ?
         program.email.map(t => `<a href="mailto:${t}">${escapeHTML(t)}</a>`).join(', ') : '';

      const podcastList = (program.podcast) ? `
          <audio controls="" id="player" style="display:none;margin-top:10px;margin-left:25px;"><source src=""></audio>
          <div class="podcast_list_episode">
          <h3>Lista odcinków podcastu:</h3>
          <div id="episode-list">Ładowanie odcinków...</div>
          </div>` : '';

      // Definicja ikon społecznościowych dla pętli
      const socialConfig = [{
            key: 'url',
            icon: 'fa-solid fa-link'
         },
         {
            key: 'url_rss',
            icon: 'fa-solid fa-rss'
         },
         {
            key: 'url_podcast',
            icon: 'fa-solid fa-podcast'
         },
         {
            key: 'url_spreaker',
            icon: 'fa-solid fa-table-list'
         },
         {
            key: 'url_spotify',
            icon: 'fa-brands fa-spotify'
         },
         {
            key: 'url_kick',
            icon: 'fa-brands fa-kickstarter-k'
         },
         {
            key: 'url_twitch',
            icon: 'fa-brands fa-twitch'
         },
         {
            key: 'url_youtube',
            icon: 'fa-brands fa-youtube'
         },
         {
            key: 'url_facebook',
            icon: 'fa-brands fa-facebook'
         },
         {
            key: 'url_instagram',
            icon: 'fa-brands fa-instagram'
         },
         {
            key: 'url_tiktok',
            icon: 'fa-brands fa-tiktok'
         },
         {
            key: 'url_x',
            icon: 'fa-brands fa-x-twitter'
         },
         {
            key: 'url_soundcloud',
            icon: 'fa-brands fa-soundcloud'
         },
         {
            key: 'url_mixcloud',
            icon: 'fa-brands fa-mixcloud'
         }
      ];

      const socialUrlsHtml = socialConfig
         .filter(cfg => program[cfg.key])
         .map(cfg => `<a href="${program[cfg.key]}" target="_blank"><i class="${cfg.icon}"></i></a>`)
         .join('\n');

      const fullHTML = `<!DOCTYPE html>
            <html lang="pl">
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
                                    ${emailContact ? `<div class="program_info_email">E-mail: ${emailContact}</div>` : ""}
                                    <div class="program_info_djs"><small>Prowadzący:</small><br>${escapeHTML(occurrencesHostA)}</div>
                                </div>
                            </div>
                            <div class="program_info_desc">${program.description || "Brak opisu programu."}</div>
                            <div class="program_info_urls">
                                ${socialUrlsHtml}
                            </div>
                            ${scheduleInfo ? `<div class="program_info_onairs">Na antenie:</div>` : ""}
                            ${scheduleInfo ? `<div class="program_info_onairs_list">${scheduleInfo}</div>` : ""}
                            ${podcastList}
                        </div>
                        <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
                    </div>
                    <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
                    <script src="https://krdrt5370000ym.github.io/media/site-episode.js"><\/script>
                    <script src="https://krdrt5370000ym.github.io/media/site-audio.js"><\/script>
                    ${program.podcast ? `<script>${program.podcast}<\/script>` : ""}
                </body>
            </html>`;

      document.open();
      document.write(fullHTML);
      document.close();

   } catch (err) {
      console.error("Błąd krytyczny:", err);
      document.body.innerHTML = "Wystąpił błąd podczas ładowania strony.";
   }
}
uruchomProgram();
