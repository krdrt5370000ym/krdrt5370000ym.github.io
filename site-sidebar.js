var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
   acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
         panel.style.display = "none";
      } else {
         panel.style.display = "block";
      }
   });
}
// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");
// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");
// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
   if (mySidebar.style.display === 'block') {
      mySidebar.style.display = 'none';
      overlayBg.style.display = "none";
   } else {
      mySidebar.style.display = 'block';
      overlayBg.style.display = "block";
   }
}
// Close the sidebar with the close button
function w3_close() {
   mySidebar.style.display = "none";
   overlayBg.style.display = "none";
}

function openCity(evt, cityName) {
   // Declare all variables
   var i, tabcontent, tablinks;

   // Get all elements with class="tabcontent" and hide them
   tabcontent = document.getElementsByClassName("tabcontent");
   for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
   }

   // Get all elements with class="tablinks" and remove the class "active"
   tablinks = document.getElementsByClassName("tablinks");
   for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
   }

   // Show the current tab, and add an "active" class to the button that opened the tab
   document.getElementById(cityName).style.display = "block";
   evt.currentTarget.className += " active";
}

function AudioPlayer(url) {
    const audio = document.getElementById('player');
    
    // Sprawdzenie, czy URL kończy się na .m3u8 (ignorując wielkość liter)
    const isM3U8 = url.toLowerCase().includes('.m3u8');
    const mimeType = isM3U8 ? 'application/vnd.apple.mpegurl' : null;

    if (isM3U8 && Hls.isSupported()) {
        // Obsługa HLS przez bibliotekę (Chrome/Firefox)
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play());
    } 
    else if (audio.canPlayType(mimeType) || !isM3U8) {
        // Obsługa natywna (Safari) LUB zwykły plik MP3/AAC
        audio.src = url;
        if (mimeType) audio.type = mimeType; // Opcjonalne przypisanie typu
        audio.play().catch(e => console.log("Wymagana interakcja użytkownika"));
    }
}

function ReloadAudio() { // Dodano klamrę
    const audio = document.getElementById('player');
    const sourceUrl = audio.querySelector('source')?.src || audio.src;
    const isM3U8 = sourceUrl.includes('.m3u8');

    if (isM3U8 && typeof Hls !== 'undefined' && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(sourceUrl); // Musisz załadować źródło do HLS
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(e => console.error("Autoplay zablokowany:", e));
        });
    } 
    else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Natywne HLS (Safari)
        audio.load(); // Dodano nawiasy
        audio.play().catch(e => console.error("Błąd Safari:", e));
    }
    else {
        // Standardowe pliki (MP3/AAC)
        audio.load(); // Dodano nawiasy
        audio.play().catch(e => console.error("Błąd odtwarzania:", e));
    }
}
