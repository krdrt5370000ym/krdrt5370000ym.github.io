// <div id="article-list">Ładowanie aktualności...</div>
function WPRSCRSS() {
    // Używamy działającej listy kategorii (z pominięciem ID 16)
    const apiUrl = 'https://radiorsc.pl/wp-json/wp/v2/posts?categories=18,19,20,44,46,47,50,63,73,74&per_page=10';
    const container = document.getElementById('article-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd sieci/brak kategorii');
            return response.json();
        })
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = "Brak dostępnych aktualności.";
                return;
            }

            const htmlContent = posts.map(post => {
                // 1. Formatowanie daty na polski styl
                const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                // 2. Pobieranie nazw kategorii z pola category_info (jeśli istnieje)
                const categories = post.category_info 
                    ? post.category_info.map(cat => cat.name).join(' • ') 
                    : 'Aktualności';

                // 3. Pobieranie wyświetlanej nazwy autora
                const author = post.author_info ? post.author_info.display_name : 'Redakcja';

                return `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <a href="${post.link}" target="_blank" style="text-decoration:none; color: #004a99; font-weight: bold; font-size: 1.1em; display: block; margin-bottom: 4px;">
                            ${post.title.rendered}
                        </a>
                        <div style="color: #444; font-size: 0.9em; margin-bottom: 4px;">${categories}</div>
                        <div style="color: #666; font-size: 0.85em;">
                            <i class="fa-solid fa-user"></i> ${author}<br>
                            ${postDate}
                        </div>
                    </div>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania aktualności.";
        });
}

function WPRSS(mainUrl) {
    const rssUrl = mainUrl + '/feed/';
    // Używamy RSS2JSON jako stabilnego konwertera i bramki CORS
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const container = document.getElementById('article-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd połączenia');
            return response.json();
        })
        .then(data => {
            if (data.status !== 'ok') throw new Error('Błąd RSS');

            const htmlContent = data.items.map(item => {
                // 1. Formatowanie daty
                const postDate = new Date(item.pubDate).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                // 2. Pobieranie kategorii
                const categories = item.categories.length > 0 
                    ? item.categories.join(' • ') 
                    : 'Aktualności';

                // 3. Pobieranie autora
                const author = item.author || 'Redakcja';

                return `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <a href="${item.link}" target="_blank" style="text-decoration:none; color: #004a99; font-weight: bold; font-size: 1.1em; display: block; margin-bottom: 4px;">
                            ${item.title}
                        </a>
                        <div style="color: #444; font-size: 0.9em; margin-bottom: 4px;">${categories}</div>
                        <div style="color: #666; font-size: 0.85em;">
                            <i class="fa-solid fa-user"></i> ${author}<br>
                            ${postDate}
                        </div>
                    </div>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd ładowania:", error);
            container.innerHTML = "Błąd podczas ładowania aktualności.";
        });
}

function WPRSS2(mainUrl) {
    // 1. Upewnij się, że URL jest poprawny (usuwamy ewentualny slash na końcu i dodajemy /feed/)
    const cleanUrl = mainUrl.replace(/\/$/, "");
    const rssUrl = cleanUrl + '/feed/';
    
    // 2. Używamy trybu /raw - AllOrigins zwróci bezpośrednio XML, co jest stabilniejsze
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    const container = document.getElementById('article-list');

    console.log("Pobieranie z:", rssUrl);

    fetch(proxyUrl)
        .then(response => {
            if (!response.ok) throw new Error('Serwer proxy nie odpowiada');
            return response.text(); // Pobieramy czysty tekst XML
        })
        .then(str => {
            console.log("Otrzymana zawartość (fragment):", str.substring(0, 200));
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            
            // Sprawdzenie czy XML nie zawiera błędu parsowania
            const parseError = xmlDoc.getElementsByTagName("parsererror");
            if (parseError.length > 0) throw new Error('Błędny format XML');

            const items = xmlDoc.querySelectorAll("item");
            if (items.length === 0) {
                container.innerHTML = "Brak nowych wpisów.";
                return;
            }

            const htmlContent = Array.from(items).slice(0, 10).map(item => {
                const title = item.querySelector("title")?.textContent || "Bez tytułu";
                const link = item.querySelector("link")?.textContent || "#";
                const pubDateRaw = item.querySelector("pubDate")?.textContent;
                
                // Obsługa autora w WordPress (dc:creator)
                const author = item.getElementsByTagName("dc:creator")[0]?.textContent 
                               || item.querySelector("author")?.textContent 
                               || 'Redakcja';

                const postDate = pubDateRaw 
                    ? new Date(pubDateRaw).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
                    : "";

                return `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <a href="${link}" target="_blank" style="text-decoration:none; color: #004a99; font-weight: bold; font-size: 1.1em;">
                            ${title}
                        </a>
                        <div style="color: #666; font-size: 0.85em; margin-top: 5px;">
                            <i class="fa-solid fa-user"></i> ${author} | ${postDate}
                        </div>
                    </div>`;
            }).join('');

            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd szczegółowy:", error);
            container.innerHTML = "Nie udało się wczytać danych. Sprawdź konsolę (F12).";
        });
}
