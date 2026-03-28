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

function LinkopenRadios() {
  // Używamy window.open, ponieważ nowoczesne przeglądarki 
  // często blokują bezpośrednie window.location.href dla "data:"
  const htmlContentOpenRadios = `data:text/html;charset=utf-8;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sPgogICA8aGVhZD4KICAgICAgPG1ldGEgbmFtZT0ncm9ib3RzJyBjb250ZW50PSdub2luZGV4LCBmb2xsb3cnIC8+CiAgICAgIDx0aXRsZT5SYWRpbyB8IGtyZHJ0NTM3MDAweW0uZ2l0aHViLmlvPC90aXRsZT4KICAgICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8va3JkcnQ1MzcwMDAweW0uZ2l0aHViLmlvL3NpdGUtaGVhZC5qcyI+PC9zY3JpcHQ+CiAgICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9rcmRydDUzNzAwMDB5bS5naXRodWIuaW8vc3R5bGUuY3NzIj4KICAgPC9oZWFkPgogICA8Ym9keSBjbGFzcz0idzMtbGlnaHQtZ3JleSI+CiAgICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2tyZHJ0NTM3MDAwMHltLmdpdGh1Yi5pby9zaXRlLXRvcHNjcmVlbi5qcyI+PC9zY3JpcHQ+CiAgICAgIDxkaXYgY2xhc3M9InczLW1haW4iIHN0eWxlPSJtYXJnaW4tbGVmdDozMDBweDttYXJnaW4tdG9wOjQzcHg7Ij4KICAgICAgICAgPCEtLSBIZWFkZXIgLS0+CiAgICAgICAgIDxoZWFkZXIgY2xhc3M9InczLWNvbnRhaW5lciIgc3R5bGU9InBhZGRpbmctdG9wOjIycHgiPgogICAgICAgICAgICA8aDU+PGI+PGkgY2xhc3M9ImZhLXNvbGlkIGZhLXJhZGlvIj48L2k+IFJhZGlvPC9iPjwvaDU+CiAgICAgICAgIDwvaGVhZGVyPgogICAgICAgICA8ZGl2IGNsYXNzPSJ3My1yb3ctcGFkZGluZyB3My1tYXJnaW4tYm90dG9tIj4KICAgICAgICAgICAgPHNjcmlwdD4KICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBudW1iZXIgYmFzZWQgb24gdGhlIGN1cnJlbnQgdGltZQogICAgICAgICAgICAgIHZhciBjYWNoZUJ1c3RlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOwogICAgICAgICAgICAgIAogICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBpZnJhbWUgVVJMIGR5bmFtaWNhbGx5CiAgICAgICAgICAgICAgdmFyIGlmcmFtZVVybCA9ICJodHRwczovL3ZpZXcub2ZmaWNlYXBwcy5saXZlLmNvbS9vcC9lbWJlZC5hc3B4P3NyYz1odHRwczovL2tyZHJ0NTM3MDAwMHltLmdpdGh1Yi5pby9yYWRpb3MvcmFkaW9zLnhsc2I/dj0iICsgY2FjaGVCdXN0ZXIgKyAiJkFsbG93VHlwaW5nPVRydWUmd2RBbGxvd0ludGVyYWN0aXZpdHk9VHJ1ZSI7CiAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgLy8gV3JpdGUgdGhlIGlmcmFtZSB0byB0aGUgcGFnZQogICAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKCc8aWZyYW1lIHNyYz0iJyArIGlmcmFtZVVybCArICciIGZyYW1lYm9yZGVyPSIwIiBzY3JvbGxpbmc9Im5vIiBzdHlsZT0ib3ZlcmZsb3c6aGlkZGVuOyBoZWlnaHQ6NTAwcHg7IHdpZHRoOjEwMCU7IHRvcDogMDsgbGVmdDogMDsgYm90dG9tOiAwOyByaWdodDogMDsiIGhlaWdodD0iNTAwIiB3aWR0aD0iMTAwJSI+PC9pZnJhbWU+Jyk7CiAgICAgICAgICAgIDwvc2NyaXB0PgogICAgICAgICAgICA8cD5XeWJpZXJ6IGthdGVnb3JpxJkgc3RhY2ppIHJhZGlvd2VqLCBuYWNpxZtuaWogPGI+4oCeV8WCLuKAnTwvYj4sIHBvIGN6eW0gbmFjacWbbmlqIG5hIGtsYXdpYXR1cnplIDxiPkN0cmwrQzwvYj4sIGRvdGtuaWogaSB3eWJpZXJ6IDxiPuKAnktvcGl1auKAnTwvYj4gbHViIGtsaWtuaWogcHJhd3ltIHByenljaXNraWVtIG15c3p5IDxpPihwaXN6xIUgSFRNTCk8L2k+LCBhIG5hc3TEmXBuaWUgcHJ6ZWpkxbogZG8gcHJ6ZWdsxIVkYXJraSBpIHdrbGVqIGFkcmVzIFVSTC4gQWt0dWFsaXphY2phIG5pZSB6b3N0YW5pZSBqZWRuYWsgemFwaXNhbmEgdyBwcnplZ2zEhWRhcmNlLjwvcD4KICAgICAgICAgPC9kaXY+CiAgICAgICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2tyZHJ0NTM3MDAwMHltLmdpdGh1Yi5pby9zaXRlLWJvdHRvbXNjcmVlbi5qcyI+PC9zY3JpcHQ+CiAgICAgIDwvZGl2PgogICAgICA8c2NyaXB0IHNyYz0iaHR0cHM6Ly9rcmRydDUzNzAwMDB5bS5naXRodWIuaW8vc2l0ZS1zaWRlYmFyLmpzIj48L3NjcmlwdD4KICAgPC9ib2R5Pgo8L2h0bWw+`;
  window.open(htmlContentOpenRadios, '_self');
}

function LinkopenMedia() {
  const htmlContentOpenMedia = `data:text/html;charset=utf-8;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sPgogICA8aGVhZD4KICAgICAgPG1ldGEgbmFtZT0ncm9ib3RzJyBjb250ZW50PSdub2luZGV4LCBmb2xsb3cnIC8+CiAgICAgIDx0aXRsZT5NZWRpYSB8IGtyZHJ0NTM3MDAweW0uZ2l0aHViLmlvPC90aXRsZT4KICAgICAgPHNjcmlwdCBzcmM9Imh0dHBzOi8va3JkcnQ1MzcwMDAweW0uZ2l0aHViLmlvL3NpdGUtaGVhZC5qcyI+PC9zY3JpcHQ+CiAgICAgIDxsaW5rIHJlbD0ic3R5bGVzaGVldCIgaHJlZj0iaHR0cHM6Ly9rcmRydDUzNzAwMDB5bS5naXRodWIuaW8vc3R5bGUuY3NzIj4KICAgPC9oZWFkPgogICA8Ym9keSBjbGFzcz0idzMtbGlnaHQtZ3JleSI+CiAgICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2tyZHJ0NTM3MDAwMHltLmdpdGh1Yi5pby9zaXRlLXRvcHNjcmVlbi5qcyI+PC9zY3JpcHQ+CiAgICAgIDxkaXYgY2xhc3M9InczLW1haW4iIHN0eWxlPSJtYXJnaW4tbGVmdDozMDBweDttYXJnaW4tdG9wOjQzcHg7Ij4KICAgICAgICAgPCEtLSBIZWFkZXIgLS0+CiAgICAgICAgIDxoZWFkZXIgY2xhc3M9InczLWNvbnRhaW5lciIgc3R5bGU9InBhZGRpbmctdG9wOjIycHgiPgogICAgICAgICAgICA8aDU+PGI+PGkgY2xhc3M9ImZhLXNvbGlkIGZhLXBob3RvLWZpbG0iPjwvaT4gTWVkaWE8L2I+PC9oNT4KICAgICAgICAgPC9oZWFkZXI+CiAgICAgICAgIDxkaXYgY2xhc3M9InczLXJvdy1wYWRkaW5nIHczLW1hcmdpbi1ib3R0b20iPgogICAgICAgICAgICA8c2NyaXB0PgogICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgcmFuZG9tIG51bWJlciBiYXNlZCBvbiB0aGUgY3VycmVudCB0aW1lCiAgICAgICAgICAgICAgdmFyIGNhY2hlQnVzdGVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7CiAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGlmcmFtZSBVUkwgZHluYW1pY2FsbHkKICAgICAgICAgICAgICB2YXIgaWZyYW1lVXJsID0gImh0dHBzOi8vdmlldy5vZmZpY2VhcHBzLmxpdmUuY29tL29wL2VtYmVkLmFzcHg/c3JjPWh0dHBzOi8va3JkcnQ1MzcwMDAweW0uZ2l0aHViLmlvL21lZGlhL21lZGlhLnhsc2I/dj0iICsgY2FjaGVCdXN0ZXIgKyAiJkFsbG93VHlwaW5nPVRydWUmd2RBbGxvd0ludGVyYWN0aXZpdHk9VHJ1ZSI7CiAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgLy8gV3JpdGUgdGhlIGlmcmFtZSB0byB0aGUgcGFnZQogICAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKCc8aWZyYW1lIHNyYz0iJyArIGlmcmFtZVVybCArICciIGZyYW1lYm9yZGVyPSIwIiBzY3JvbGxpbmc9Im5vIiBzdHlsZT0ib3ZlcmZsb3c6aGlkZGVuOyBoZWlnaHQ6NTAwcHg7IHdpZHRoOjEwMCU7IHRvcDogMDsgbGVmdDogMDsgYm90dG9tOiAwOyByaWdodDogMDsiIGhlaWdodD0iNTAwIiB3aWR0aD0iMTAwJSI+PC9pZnJhbWU+Jyk7CiAgICAgICAgICAgIDwvc2NyaXB0PgogICAgICAgICAgICA8cD5XeWJpZXJ6IGthdGVnb3JpxJkgc3RhY2ppIHJhZGlvd2VqLCBuYWNpxZtuaWogPGI+4oCeV8WCLuKAnTwvYj4sIHBvIGN6eW0gbmFjacWbbmlqIG5hIGtsYXdpYXR1cnplIDxiPkN0cmwrQzwvYj4sIGRvdGtuaWogaSB3eWJpZXJ6IDxiPuKAnktvcGl1auKAnTwvYj4gbHViIGtsaWtuaWogcHJhd3ltIHByenljaXNraWVtIG15c3p5IDxpPihwaXN6xIUgSFRNTCk8L2k+LCBhIG5hc3TEmXBuaWUgcHJ6ZWpkxbogZG8gcHJ6ZWdsxIVkYXJraSBpIHdrbGVqIGFkcmVzIFVSTC4gQWt0dWFsaXphY2phIG5pZSB6b3N0YW5pZSBqZWRuYWsgemFwaXNhbmEgdyBwcnplZ2zEhWRhcmNlLjwvcD4KICAgICAgICAgPC9kaXY+CiAgICAgICAgIDxzY3JpcHQgc3JjPSJodHRwczovL2tyZHJ0NTM3MDAwMHltLmdpdGh1Yi5pby9zaXRlLWJvdHRvbXNjcmVlbi5qcyI+PC9zY3JpcHQ+CiAgICAgIDwvZGl2PgogICAgICA8c2NyaXB0IHNyYz0iaHR0cHM6Ly9rcmRydDUzNzAwMDB5bS5naXRodWIuaW8vc2l0ZS1zaWRlYmFyLmpzIj48L3NjcmlwdD4KICAgPC9ib2R5Pgo8L2h0bWw+`;
  window.open(htmlContentOpenMedia, '_self');
}
