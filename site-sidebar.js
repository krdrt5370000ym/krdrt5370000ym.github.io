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

// METODA BLOB (Zalecana zamiast data URL)
function openplayer(name) {
   const codeHTML = "<!DOCTYPE html><html lang=\"pl\"><head><meta charset=\"UTF-8\"><title>Radio internetowe</title><script src=\"https://krdrt5370000ym.github.io/site-head.js\"></script><link rel=\"stylesheet\" href=\"https://krdrt5370000ym.github.io/player/style.css\"></head><body><div id=\"sidebar\"><a style=\"text-decoration:none;\" href=\"https://krdrt5370000ym.github.io/player\">Wstecz</a><h3>Stacje Radiowe</h3><div id=\"playlist-container\"></div></div><div id=\"content\"><h2 id=\"current-station\">Wybierz stację z listy</h2><audio id=\"player\" style=\"display:none;\" controls></audio><span style=\"margin-top:10px;\"><button id=\"buttons\" style=\"display:none;\"><a href=\"#\" onclick=\"document.getElementById('player').load();document.getElementById('player').play();\" style=\"text-decoration: none;\">▶</a></button><button><a style=\"text-decoration:none;\" href=\"https://krdrt5370000ym.github.io/player/" + name + ".m3u\"><i class=\"fa-solid fa-download\"></i></a></button></span></div><script src=\"https://krdrt5370000ym.github.io/player/radios.js\"></script><script>fetchPlaylist('" + name + "')</script></body></html>";
   const blob = new Blob([codeHTML], { type: 'text/html;charset=UTF-8' });
   const urlPlayer = URL.createObjectURL(blob);
   window.open(urlPlayer, '_blank');
}
