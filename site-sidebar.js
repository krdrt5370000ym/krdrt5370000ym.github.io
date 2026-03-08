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

// <div id="episode-list">Ładowanie odcinków...</div>
function SpreakerPodcast(showId) {
    // Dodanie parametru limit=100 pozwala pobrać więcej odcinków w jednym zapytaniu
    const apiUrl = 'https://api.spreaker.com/v2/shows/' + showId + '/episodes?limit=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dostęp do tablicy odcinków: response -> items
            const episodes = data.response.items;
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul><li><a href="${episode.site_url}" target="_blank">${episode.title}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd Spreaker API:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}

function GrupaZPRPodcast(podcastUid, SiteUid) {
    // Używamy proxy, ponieważ GitHub nie obsługuje PHP do obejścia CORS
    const targetUrl = `https://front-api.grupazprmedia.pl/media/v1/podcast_series_mobile_app/${podcastUid}/?site_uid=${SiteUid}`;
    const apiUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
    
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
        .then(data => {
            // Grupa ZPR zwraca dane w polu 'episodes'
            const episodes = data.episodes || [];
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul><li><a href="data:text/html,<!DOCTYPE html><html><head><title>.</title><meta name=%22viewport%22 content=%22width=device-width, initial-scale=1%22></head><body><audio controls><source src=%22${episode.playback_url}%22></audio></body></html>" target="_blank">${episode.title}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}

function EurozetPodcast(showId, mainUrl, stationId) {
    const apiUrl = 'https://player.chillizet.pl/api/podcasts/getPodcastListByProgram/(node)/' + showId + '/(station)/' + stationId;
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dostęp do tablicy odcinków: response -> items
            const episodes = data.data;
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul><li><a href="${mainUrl}${episode.url}" target="_blank">${episode.title}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd:", error);
            container.innerHTML = "Błąd podczas ładowania podcastu.";
        });
}
// Wywołanie z Twoim ID
// EurozetPodcast(12345, "https://player.radiozet.pl/", "radiozet");

function WPPodcast(categoryId,mainUrl) {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = mainUrl + '/wp-json/wp/v2/posts?categories=' + categoryId + '&per_page=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            // W WP API 'posts' to już gotowa tablica
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => 
                // W WP API tytuł jest w title.rendered, a link w link
                `<ul><li><a href="${post.link}" target="_blank">${post.title.rendered}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}
// Przykład użycia (podaj ID kategorii z Twojego WordPressa)
// WPPodcast(5,"https://radiorsc.pl");

function AgoraPodcast(brandId, seriesId, mainUrl) {
    // Dodanie parametru limit=100 pozwala pobrać więcej odcinków w jednym zapytaniu
    const apiUrl = 'https://podcasts.radioagora.pl/api/getPodcasts?brand_id=' + brandId + '&limit=100&offset=0&series_id=' + seriesId;
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dostęp do tablicy odcinków: response -> items
            // Bezpieczne pobranie rekordów z głębokiej struktury
            const episodes = data.records;
            
            if (episodes.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = episodes.map(episode => 
                `<ul><li><a href="${mainUrl}/podcast/${episode.podcast_seo_url}/${episode.podcast_id}" target="_blank">${episode.podcast_name}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd API:", error);
            container.innerHTML = "Błąd połączenia z API Agory.";
        });
}
// Poprawna kolejność: brandId (1) [Rock Radio, itp.], seriesId (176)
// AgoraPodcast(1,176,"https://radio.rockradio.pl");

function WPPodcastRK(SearchId) {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = 'https://radiokolor.pl/wp-json/wp/v2/podcast?search=' + SearchId + '&per_page=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            // W WP API 'posts' to już gotowa tablica
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => 
                // W WP API tytuł jest w title.rendered, a link w link
                `<ul><li><a href="${post.link}" target="_blank">${post.title.rendered}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVG() {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/gosc?per_page=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            // W WP API 'posts' to już gotowa tablica
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => 
                // W WP API tytuł jest w title.rendered, a link w link
                `<ul><li><a href="${post.link}" target="_blank">${post.title.rendered}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVR() {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/reporter?per_page=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            // W WP API 'posts' to już gotowa tablica
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => 
                // W WP API tytuł jest w title.rendered, a link w link
                `<ul><li><a href="${post.link}" target="_blank">${post.title.rendered}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

function WPPodcastRVA(ProgramId) {
    // WordPress API zwraca tablicę postów bezpośrednio
    const apiUrl = 'https://radiovictoria.pl/wp-json/wp/v2/programy?audycje=' + ProgramId + '&per_page=100';
    const container = document.getElementById('episode-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            // W WP API 'posts' to już gotowa tablica
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych odcinków.";
                return;
            }

            const htmlContent = posts.map(post => 
                // W WP API tytuł jest w title.rendered, a link w link
                `<ul><li><a href="${post.link}" target="_blank">${post.title.rendered}</a></li></ul>`
            ).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}
