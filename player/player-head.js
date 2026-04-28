document.write('<script src=\"https://cdn.jsdelivr.net/npm/hls.js@latest\"></script>');

function hackBodyFont(fontName = 'Roboto', option = 1, customWeights = '') {
   const weightMap = {
      0: 'ital,wght@0,100..900;1,100..900',
      1: 'wght@400;600;700',
      2: 'wght@400;700',
      3: `wght@${customWeights}`
   };

   const selectedWeights = weightMap[option] || weightMap[1];
   const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:${selectedWeights}&display=swap`;

   // 1. Zarządzanie linkiem do Google Fonts
   let link = document.getElementById('google-font-hack');
   if (!link) {
      link = document.createElement('link');
      link.id = 'google-font-hack';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
   }
   link.href = fontUrl;

   // 2. Wymuszenie stylu CSS
   let style = document.getElementById('body-font-style');
   if (!style) {
      style = document.createElement('style');
      style.id = 'body-font-style';
      document.head.appendChild(style);
   }
   style.textContent = `body, body * { font-family: '${fontName}', sans-serif !important; }`;
}

// Przykłady użycia:
// hackBodyFont('Montserrat', 0); // Pełny zakres wag + kursywa
// hackBodyFont('Open Sans', 3, '300;800'); // Własne wagi

// Jak tego używać w Chrome?
// Otwórz dowolną stronę WWW (np. Google.pl, Wikipedia).
// Skasuj wszystko z paska adresu.
// Wpisz ręcznie słowo javascript: (Chrome często usuwa ten człon przy wklejaniu ze schowka dla bezpieczeństwa).
// Wklej resztę kodu zaraz po dwukropku i naciśnij Enter.
// javascript:(function(f,o,w){const m={0:'ital,wght@0,100..900;1,100..900',1:'wght@400;600;700',2:'wght@400;700',3:'wght@'+w};const s=m[o];const u=`https://fonts.googleapis.com/css2?family=${f.replace(/ /g,'+')}:${s}&display=swap`;let l=document.getElementById('gf-h');if(!l){l=document.createElement('link');l.id='gf-h';l.rel='stylesheet';document.head.appendChild(l)}l.href=u;let t=document.getElementById('bf-s');if(!t){t=document.createElement('style');t.id='bf-s';document.head.appendChild(t)}t.textContent=`body,body *{font-family:'${f}',sans-serif !important}`;})('Roboto',1,'');
