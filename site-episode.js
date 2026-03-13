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
    const apiUrl = `https://front-api.grupazprmedia.pl/media/v1/podcast_series_mobile_app/${podcastUid}/?site_uid=${SiteUid}`;
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    
    const container = document.getElementById('episode-list');

    fetch(proxyUrl + apiUrl)
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
