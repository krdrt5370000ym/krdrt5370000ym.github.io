let PODCASTS = [];
let SITE_ID = null;

// =====================
// LOAD
// =====================

async function loadData(siteId) {
   const baseUrl = `https://krdrt5370000ym.github.io/media/json/${siteId}`;
   SITE_ID = siteId;

   // Helper do bezpiecznego fetchowania
   const fetchJson = (suffix) =>
      fetch(`${baseUrl}_${suffix}.json`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

   try {
      const [podcasts] = await Promise.all([
         fetchJson("podcasts")
      ]);

      // Przypisanie z fallbackiem na puste struktury
      PODCASTS = podcasts || {};

      console.log("Dane załadowane pomyślnie");
   } catch (error) {
      console.error("Błąd podczas ładowania danych:", error);
   }
}

// =====================
// PODCAST LIST
// =====================
function renderPodcasts() {
   const container = document.getElementById("podcast_list");
   const filter = document.getElementById("categoryFilter").value;
   const search = document.getElementById("searchInput").value.toLowerCase();

   const escapeHTML = (str) =>
      str ? String(str).replace(/[&<>"']/g, m => ({
         '&': '&amp;',
         '<': '&lt;',
         '>': '&gt;',
         '"': '&quot;',
         "'": '&#39;'
      }[m])) : "";

   container.innerHTML = "";

   PODCASTS
      .filter(p => {
         // 1. Podstawowe filtry widoczności
         if (p.hide_in_podcast || p.private || p.archive) return false;

         // 2. Twój warunek: Pokaż jeśli brak blokady "not_all" LUB ma kategorię LUB filtr jest aktywny
         const baseVisibility = !p.category_not_all || p.category || filter !== "";
         if (!baseVisibility) return false;

         // 3. Filtr wybranej kategorii z selecta
         if (filter && (!p.category || !p.category.includes(filter))) return false;

         // 4. Wyszukiwarka tekstowa (Twoja nowość)
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
         el.className = "podcast_list_content";

         const thumb = p.thumbnail_text;
         const style = thumb ? [
            thumb.background ? `background:${thumb.background}` : '',
            thumb.color ? `color:${thumb.color}` : ''
         ].filter(Boolean).join(';') : '';
         
         const thumbName = (thumb && thumb.name) || p.name || "";
         const thumbnailDisplay = p.thumbnail_uri ?
            `<img decoding="async" src="${p.thumbnail_uri}" alt="${escapeHTML(p.name)}">` : "";
         const thumbnailText = thumb ? `<div class="podcast_list_box" style="${style}">${escapeHTML(thumbName)}</div>` : thumbnailDisplay;

         // Bezpieczne generowanie linku
         const safeName = escapeHTML(p.name);
         const safeHost = p.only_the_schedule_hosts === true ? '' : escapeHTML(p.host);
         const url = p.url_immediately ? p.url_immediately : `podcast?uid=${p.id}&st=${SITE_ID}`;

         el.innerHTML = `
            <div class="podcast_list_cover">${thumbnailText}</div>
            <div>
               <div class="podcast_list_name" style="cursor:pointer;">
                  <a href="${url}" target="_blank">${safeName}</a>
               </div>
               <div class="podcast_list_host">${safeHost}</div>
            </div>
         `;

         container.appendChild(el);
      });
}

// =====================
// INIT
// =====================
function init() {
   // 1. Podpięcie zdarzeń (Event Listeners)
   const searchInput = document.getElementById("searchInput");
   const categoryFilter = document.getElementById("categoryFilter");

   if (searchInput) searchInput.addEventListener("input", renderPodcasts);
   if (categoryFilter) categoryFilter.addEventListener("change", renderPodcasts);

   // 2. Pierwsze renderowanie po załadowaniu
   renderPodcasts();
}

document.addEventListener("DOMContentLoaded", init);
