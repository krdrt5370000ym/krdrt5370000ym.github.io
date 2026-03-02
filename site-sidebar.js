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

async function daneTrack(radio_id) {
    const output = document.getElementById('resultTrack');
    // Używamy /raw, aby AllOrigins nie pakowało danych w JSON, tylko oddało czysty HTML
    const targetUrl = 'https://www.odsluchane.eu/szukaj.php?r=' + radio_id;
    const proxyUrl = 'https://api.allorigins.win/get?callback=myFunc&url=' + encodeURIComponent(targetUrl);

    try {
const response = await fetch(proxyUrl);
if (!response.ok) throw new Error('Problem z połączeniem');

const htmlText = await response.text();

const parser = new DOMParser();
const doc = parser.parseFromString(htmlText, "text/html");

// Używamy Twojego XPATH - dostosowanego do struktury tabeli
const xpath = "//div/div[5]/div/table/tbody/tr[position()=last()]/td[2]/a/text()";
const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
const element = result.singleNodeValue;

if (element) {
    output.innerHTML = `<small>Teraz gramy:</small><br>${element.textContent.trim().replaceAll("\\n","")}`;
} else {
    output.innerText = "";
}
    } catch (e) {
output.innerText = "";
    }
}
