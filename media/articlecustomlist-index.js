(function () {
   "use strict";

   const params = new URLSearchParams(window.location.search);

   const site = params.get("si");
   const typename = params.get("tp");
   const typecat = params.get("tc");
   const category = params.get("c") || "";
   const year = params.get("y") || "";
   const month = params.get("m") || "";
   const day = params.get("d") || "";

   const siteMap = {
      radiorsc: {
         url: "https://radiorsc.pl"
      },
      radiovictoria: {
         url: "https://radiovictoria.pl"
      },
      radiokolor: {
         url: "https://radiokolor.pl"
      },
      sosw: {
         url: "https://soswskierniewice.pl"
      },
      ckis: {
         url: "https://cekis.pl"
      },
      radiolodz: {
         url: "https://radiolodz.pl"
      },
      elradio: {
         url: "https://elradio.pl"
      }
   };

   const container = document.getElementById("article-post");

   function showError(msg) {
      if (container) container.innerHTML = msg;
   }

   // 1. Definiujemy listę dozwolonych typów
   const allowedTypes = [
      'posts', 'pages', 'media', 'menu-items', 'blocks', 'templates', 'template-parts',
      'global-styles', 'navigation', 'font-families', 'e-floating-buttons', 'elementor_library',
      'dedications', 'voiceline', 'radiochannel', 'shows', 'schedule', 'chart', 'members',
      'podcast', 'qtsponsor', 'event', 'types', 'statuses', 'taxonomies', 'categories',
      'tags', 'menus', 'wp_pattern_category', 'radio-genre', 'genre', 'schedulefilter',
      'chartcategory', 'podcastfilter', 'eventtype', 'users', 'comments', 'search',
      'block-renderer', 'block-types', 'settings', 'themes', 'plugins', 'sidebars',
      'widget-types', 'widgets', 'block-directory', 'pattern-directory', 'block-patterns',
      'menu-locations', 'font-collections', 'kadence_element', 'kadence_form', 'kb_icon',
      'kadence_lottie'
   ];

   const allowedTypeCats = ['wp-api-v2', 'custom-api', 'taxonomy'];
   
   // 2. Walidacja site (Twoja pierwsza część)
   if (!site || !siteMap[site] || !typename || !typecat) {
      showError("Błąd: Brak wymaganych parametrów URL.");
      return;
   }

  // 3. Walidacja konkretnych wartości
   if (!allowedTypes.includes(typename)) {
      showError("Błąd: Nieprawidłowy parametr 'tp'.");
      return;
   }
   
   // Opcjonalne: Walidacja typecat, jeśli znasz dopuszczalne wzorce
   // if (!allowedTypeCats.includes(typecat)) {
   //    showError("Błąd: Nieprawidłowy parametr 'tc'.");
   //    return;
   // }

   const {
      url: mainUrl
   } = siteMap[site];

   function init() {
      try {
         if (typeof window.WPCustomList === "function") {
            window.WPCustomList(
               mainUrl,
               site,
               typename,
               typecat,
               category,
               year,
               month,
               day
            );
         } else {
            throw new Error("Nie znaleziono funkcji WPCustomList.");
         }
      } catch (err) {
         console.error(err);
         showError("Błąd podczas ładowania modułu.");
      }
   }

   window.addEventListener("DOMContentLoaded", init);
})();
