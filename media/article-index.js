(function () {
   const params = new URLSearchParams(window.location.search);
   const id = params.get('id');
   const site = params.get('si');
   const type = params.get('tp') || "post";

   const siteMap = {
      "radiorsc": {
         "url": "https://radiorsc.pl",
         "is_http": false,
         "is_cors": false
      },
      "radiovictoria": {
         "url": "https://radiovictoria.pl",
         "is_http": false,
         "is_cors": false
      },
      "radiokolor": {
         "url": "https://radiokolor.pl",
         "is_http": false,
         "is_cors": true
      },
      "sosw": {
         "url": "https://soswskierniewice.pl",
         "is_http": false,
         "is_cors": false
      },
      "ckis": {
         "url": "https://cekis.pl",
         "is_http": true,
         "is_cors": false
      },
   };

   if (!id || !site || !siteMap[site]) {
      document.getElementById('article-post').innerHTML = "Błąd: Nieprawidłowe parametry URL.";
      return;
   }

   const {
      url: mainUrl,
      is_http,
      is_cors
   } = siteMap[site];

   // Funkcja uruchamiająca odpowiedni moduł
   function inicjuj() {
      try {
         if (type === 'post') {
            if (site === 'radiorsc' && typeof WPArticlePostRSC === 'function') {
               WPArticlePostRSC(id);
            } else if (typeof WPArticlePost === 'function') {
               WPArticlePost(id, mainUrl, undefined, undefined, undefined, undefined, is_http, is_cors);
            }
         } else if (type === 'page' && typeof WPArticlePage === 'function') {
            WPArticlePage(id, mainUrl, is_http, is_cors);
         } else {
            throw new Error("Nie znaleziono funkcji ładującej.");
         }
      } catch (e) {
         console.error(e);
         document.getElementById('article-post').innerHTML = "Błąd podczas ładowania modułu.";
      }
   }

   // Czekamy na pełne załadowanie DOM i skryptów zewnętrznych
   window.addEventListener('load', inicjuj);
})();
