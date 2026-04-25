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

function hackBodyFont(fontName = 'Roboto', weights = '400;600;700') {
  // 1. Tworzenie poprawnego URL do Google Fonts
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@${weights}&display=swap`;

  // 2. Wstrzyknięcie linku do <head>
  if (!document.getElementById('google-font-hack')) {
    const link = document.createElement('link');
    link.id = 'google-font-hack';
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }

  // 3. Wymuszenie czcionki na body
  const style = document.createElement('style');
  style.textContent = `
    body { 
      font-family: '${fontName}', sans-serif !important; 
    }
  `;
  document.head.appendChild(style);
}
