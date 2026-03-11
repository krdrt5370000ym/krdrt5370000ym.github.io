// <div id="article-list">Ładowanie aktualności...</div>
function WPPodcastRSC() {
    // Używamy działającej listy kategorii (z pominięciem ID 16)
    const apiUrl = 'https://radiorsc.pl/wp-json/wp/v2/posts?categories=18,19,20,44,46,47,50,63,73,74&per_page=100';
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
                    <div style="margin-bottom: 25px;">
                        <a href="${post.link}" target="_blank" style="text-decoration:none; color: #000; font-weight: bold; font-size: 1.1em; display: block; margin-bottom: 4px;">
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
