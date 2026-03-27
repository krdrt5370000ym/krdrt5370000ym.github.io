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

let hls; // Globalna instancja, aby móc ją poprawnie niszczyć

function AudioPlayer(url) {
    const audio = document.getElementById('player');
    const isM3U8 = url.toLowerCase().includes('.m3u8');

    // 1. Sprzątanie po poprzednim strumieniu
    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (isM3U8 && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play());
        
        // Obsługa błędów sieciowych (częste w radio online)
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        hls.recoverMediaError();
                        break;
                    default:
                        AudioPlayer(url);
                        break;
                }
            }
        });
    } 
    else if (audio.canPlayType('application/vnd.apple.mpegurl') || !isM3U8) {
        // Safari lub zwykłe MP3
        audio.src = url;
        audio.play().catch(() => console.log("Wymagana interakcja"));
    }
}

function ReloadAudio() {
    const audio = document.getElementById('player');
    // Pobieramy aktualny URL (z HLS lub bezpośrednio z audio.src)
    const currentUrl = hls ? hls.url : audio.src;
    
    if (currentUrl) {
        console.log("Przeładowuję strumień...");
        AudioPlayer(currentUrl);
    }
}

document.getElementById('openRadio').addEventListener('click', function(e) {
    e.preventDefault(); // Zapobiega przewijaniu strony do góry

    const htmlContentRadio = `<!DOCTYPE html><html><head><meta name='robots' content='noindex, follow' /><title>Radio | krdrt537000ym.github.io</title><script src="https://krdrt5370000ym.github.io/site-head.js"></script><link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css"></head><body class="w3-light-grey"><script src="https://krdrt5370000ym.github.io/site-topscreen.js"></script><div class="w3-main" style="margin-left:300px;margin-top:43px;"><header class="w3-container" style="padding-top:22px"><h5><b><i class="fa-solid fa-radio"></i> Radio</b></h5></header><div class="w3-row-padding w3-margin-bottom"><script>var cacheBuster = new Date().getTime();var iframeUrl = "https://view.officeapps.live.com/op/embed.aspx?src=https://krdrt5370000ym.github.io/radios/radios.xlsb?v=" + cacheBuster + "&AllowTyping=True&wdAllowInteractivity=True";document.write('<iframe src="' + iframeUrl + '" frameborder="0" scrolling="no" style="overflow:hidden; height:500px; width:100%; top: 0; left: 0; bottom: 0; right: 0;" height="500" width="100%"></iframe>');</script><p>Wybierz kategorię stacji radiowej, naciśnij <b>„Wł.”</b>, po czym naciśnij na klawiaturze <b>Ctrl+C</b>, dotknij i wybierz <b>„Kopiuj”</b> lub kliknij prawym przyciskiem myszy <i>(piszą HTML)</i>, a następnie przejdź do przeglądarki i wklej adres URL. Aktualizacja nie zostanie jednak zapisana w przeglądarce.</p></div><script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"></script></div><script src="https://krdrt5370000ym.github.io/site-sidebar.js"></script></body></html>`;

    const blob = new Blob([htmlContentRadio], { type: 'text/html;charset=utf-8' });
const reader = new FileReader();
reader.onload = function(e) {
    const dataUrl = e.target.result;
    window.open(dataUrl, '_blank');
};
reader.readAsDataURL(blob);
    
    window.open(url, '_blank');

    // Opcjonalne czyszczenie pamięci po zamknięciu okna (lub po czasie)
    // setTimeout(() => URL.revokeObjectURL(url), 10000);
});

document.getElementById('openMedia').addEventListener('click', function(e) {
    e.preventDefault(); // Zapobiega przewijaniu strony do góry

    const htmlContentMedia = `<!DOCTYPE html><html><head><meta name='robots' content='noindex, follow' /><title>Media | krdrt537000ym.github.io</title><script src="https://krdrt5370000ym.github.io/site-head.js"></script><link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css"></head><body class="w3-light-grey"><script src="https://krdrt5370000ym.github.io/site-topscreen.js"></script><div class="w3-main" style="margin-left:300px;margin-top:43px;"><header class="w3-container" style="padding-top:22px"><h5><b><i class="fa-solid fa-photo-film"></i> Media</b></h5></header><div class="w3-row-padding w3-margin-bottom"><script>var cacheBuster = new Date().getTime();var iframeUrl = "https://view.officeapps.live.com/op/embed.aspx?src=https://krdrt5370000ym.github.io/media/media.xlsb?v=" + cacheBuster + "&AllowTyping=True&wdAllowInteractivity=True";document.write('<iframe src="' + iframeUrl + '" frameborder="0" scrolling="no" style="overflow:hidden; height:500px; width:100%; top: 0; left: 0; bottom: 0; right: 0;" height="500" width="100%"></iframe>');</script><p>Wybierz kategorię stacji radiowej, naciśnij <b>„Wł.”</b>, po czym naciśnij na klawiaturze <b>Ctrl+C</b>, dotknij i wybierz <b>„Kopiuj”</b> lub kliknij prawym przyciskiem myszy <i>(piszą HTML)</i>, a następnie przejdź do przeglądarki i wklej adres URL. Aktualizacja nie zostanie jednak zapisana w przeglądarce.</p></div><script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"></script></div><script src="https://krdrt5370000ym.github.io/site-sidebar.js"></script></body></html>`;
    
    const blob = new Blob([htmlContentMedia], { type: 'text/html;charset=utf-8' });
const reader = new FileReader();
reader.onload = function(e) {
    const dataUrl = e.target.result;
    window.open(dataUrl, '_blank');
};
reader.readAsDataURL(blob);
    
    window.open(url, '_blank');

    // Opcjonalne czyszczenie pamięci po zamknięciu okna (lub po czasie)
    // setTimeout(() => URL.revokeObjectURL(url), 10000);
});
