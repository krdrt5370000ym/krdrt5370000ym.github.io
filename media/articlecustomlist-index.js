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

   // Walidacja site
   if (!site || !siteMap[site] || !typename || !typecat) {
      showError("Błąd: Nieprawidłowe parametry URL.");
      return;
   }

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
