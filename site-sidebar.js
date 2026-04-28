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
