// <div id="article-list">Ładowanie aktualności...</div>
function WPArticleRSC() {
    // Używamy działającej listy kategorii (z pominięciem ID 16)
    const apiUrl = 'https://radiorsc.pl/wp-json/wp/v2/posts?categories=1,18,19,20,44,46,47,50,63,73,74,75&per_page=10';
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

                // 4. Pobieranie obrazu
                const image = post.featured_image_src_large ? '<img src="' + post.featured_image_src_large[0].replace("1024x768","300x225") + '" width="150" height="150">' : '';

                return `
                    <div class="articles">
                        <div class="article_cover">${image}<div>
                        <div class="article_content">
                            <div class="article_title"><a href="${post.link}" target="_blank">
                                ${post.title.rendered}</div>
                            </a><div class="article_category">${categories}</div>
                            <div class="article_info">
                                <i class="fa-solid fa-user"></i> ${author} | ${postDate}
                            </div>
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

async function WPArticle(mainUrl, is_categories = true, is_author = true) {
    const container = document.getElementById('article-list');
    const postsUrl = `${mainUrl}/wp-json/wp/v2/posts?per_page=10`;

    try {
        const response = await fetch(postsUrl);
        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = "Brak dostępnych aktualności.";
            return;
        }

        const cache = { authors: {}, categories: {} };

        const htmlContent = await Promise.all(posts.map(async (post) => {
            // Logika pobierania autora
            let authorDisplay = '';
            if (is_author) {
                if (!cache.authors[post.author]) {
                    const authorRes = await fetch(`${mainUrl}/wp-json/wp/v2/users/${post.author}`);
                    const authorData = await authorRes.json();
                    cache.authors[post.author] = authorData.name || 'Redakcja';
                }
                authorDisplay = `<i class="fa-solid fa-user"></i> ${cache.authors[post.author]} | `;
            }

            // Logika pobierania kategorii
            let categoriesDisplay = '';
            if (is_categories) {
                const categoryNames = [];
                for (const catId of post.categories) {
                    if (!cache.categories[catId]) {
                        const catRes = await fetch(`${mainUrl}/wp-json/wp/v2/categories/${catId}`);
                        const catData = await catRes.json();
                        cache.categories[catId] = catData.name;
                    }
                    categoryNames.push(cache.categories[catId]);
                }
                const cats = categoryNames.length > 0 ? categoryNames.join(' • ') : 'Aktualności';
                categoriesDisplay = `<div style="color: #444; font-size: 0.9em; margin-bottom: 4px;">${cats}</div>`;
            }

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <a href="${post.link}" target="_blank" style="text-decoration:none; color: #004a99; font-weight: bold; font-size: 1.1em; display:block; margin-bottom:5px;">
                        ${post.title.rendered}
                    </a>
                    ${categoriesDisplay}
                    <div style="color: #666; font-size: 0.85em; margin-top: 5px;">
                        ${authorDisplay}${postDate}
                    </div>
                </div>`;
        }));

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania aktualności.";
    }
}
