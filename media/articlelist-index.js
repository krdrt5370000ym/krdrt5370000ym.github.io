(function () {
   "use strict";

   const params = new URLSearchParams(window.location.search);

   const site = params.get("si");
   const search = params.get("s") || "";
   const category = params.get("c") || "";
   const tag = params.get("t") || "";
   const author = params.get("a") || "";
   const type = params.get("tp") || "post";

   const siteMap = {
      radiorsc: {
         url: "https://radiorsc.pl",
         is_http: false,
         is_cors: false
      },
      radiovictoria: {
         url: "https://radiovictoria.pl",
         is_http: false,
         is_cors: false
      },
      radiokolor: {
         url: "https://radiokolor.pl",
         is_http: false,
         is_cors: true
      },
      sosw: {
         url: "https://soswskierniewice.pl",
         is_http: false,
         is_cors: false
      },
      ckis: {
         url: "https://cekis.pl",
         is_http: true,
         is_cors: false
      }
   };

   const container = document.getElementById("article-post");

   function showError(msg) {
      if (container) container.innerHTML = msg;
   }

   // Walidacja site
   if (!site || !siteMap[site]) {
      showError("Błąd: Nieprawidłowe parametry URL.");
      return;
   }

   const {
      url: mainUrl,
      is_http
      is_cors
   } = siteMap[site];

   function init() {
      try {
         if (typeof window.WPArticleList === "function") {
            window.WPArticleList(
               mainUrl,
               site,
               is_http,
               is_cors,
               type,
               search,
               category,
               tag,
               author
            );
         } else {
            throw new Error("Nie znaleziono funkcji WPArticleList.");
         }
      } catch (err) {
         console.error(err);
         showError("Błąd podczas ładowania modułu.");
      }
   }

   window.addEventListener("DOMContentLoaded", init);
})();
