// <div id="article-list">Ładowanie aktualności...</div>
let currentPage = 1; // Licznik aktualnej strony
const perPage = 10;   // Ile wpisów na jedno kliknięcie

async function WPArticleRSC(append = false) {
    const container = document.getElementById('article-list');
    const button = document.getElementById('load-more-btn');
    
    // Jeśli nie dopisujemy, resetujemy stronę do 1
    if (!append) currentPage = 1;

    const postsUrl = `https://radiorsc.pl/wp-json/wp/v2/posts?categories=1,18,19,20,44,46,47,50,63,73,74,75&per_page=${perPage}&page=${currentPage}&_embed=true`;

    try {
        if (button) button.innerText = "Ładowanie...";
        
        const response = await fetch(postsUrl);
        
        // Sprawdź czy strona istnieje
        if (!response.ok) {
            if (button) button.style.display = 'none';
            return;
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            if (!append) container.innerHTML = "Brak aktualności.";
            if (button) button.style.display = 'none';
            return;
        }

        const htmlContent = posts.map(post => {
            const authorName = post._embedded?.author?.[0]?.name || 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const cats = terms.length > 0 ? terms.map(t => t.name).join(' • ') : 'Aktualności';
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = imgUrl ? `<img src="${imgUrl}" width="150" height="150">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="articles">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        <div class="article_category">${cats}</div>
                        <div class="article_title"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                        <div class="article_info">
                            <i class="fa-solid fa-user"></i> ${authorName} | ${postDate}
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Kluczowa zmiana: += dopisuje treść zamiast ją zastępować
        if (append) {
            container.innerHTML += htmlContent;
        } else {
            container.innerHTML = htmlContent;
        }

        // Obsługa przycisku "Wczytaj więcej"
        if (button) {
            button.innerText = "Wczytaj więcej";
            button.style.display = posts.length < perPage ? 'none' : 'block';
            
            // Jednorazowe przypisanie zdarzenia
            button.onclick = () => {
                currentPage++;
                WPArticleRSC(true);
            };
        }

    } catch (error) {
        console.error("Błąd WP API:", error);
        if (button) button.style.display = 'none';
    }
}

async function WPArticle(mainUrl, is_categories = true, is_author = true, is_image = true, append = false) {
    const container = document.getElementById('article-list');
    const button = document.getElementById('load-more-btn');
    
    // Jeśli nie dopisujemy, resetujemy stronę do 1
    if (!append) currentPage = 1;

    const postsUrl = `${mainUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${currentPage}&_embed=true`;

    try {
        if (button) button.innerText = "Ładowanie...";
        
        const response = await fetch(postsUrl);
        
        // Sprawdź czy strona istnieje
        if (!response.ok) {
            if (button) button.style.display = 'none';
            return;
        }

        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            if (!append) container.innerHTML = "Brak aktualności.";
            if (button) button.style.display = 'none';
            return;
        }

        const htmlContent = posts.map(post => {
            const authorName = post._embedded?.author?.[0]?.name || 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const cats = terms.length > 0 ? terms.map(t => t.name).join(' • ') : 'Aktualności';
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = is_image && imgUrl ? `<img src="${imgUrl}" width="150" height="150">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="articles">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${is_categories ? `<div class="article_category">${cats}</div>` : ''}
                        <div class="article_title"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                        <div class="article_info">
                            ${is_author ? `<i class="fa-solid fa-user"></i> ${authorName} | ` : ''}${postDate}
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Kluczowa zmiana: += dopisuje treść zamiast ją zastępować
        if (append) {
            container.innerHTML += htmlContent;
        } else {
            container.innerHTML = htmlContent;
        }

        // Obsługa przycisku "Wczytaj więcej"
        if (button) {
            button.innerText = "Wczytaj więcej";
            button.style.display = posts.length < perPage ? 'none' : 'block';
            
            // Jednorazowe przypisanie zdarzenia
            button.onclick = () => {
                currentPage++;
                WPArticle(mainUrl, is_categories, is_author, is_image, true);
            };
        }

    } catch (error) {
        console.error("Błąd WP API:", error);
        if (button) button.style.display = 'none';
    }
}

async function WPArticlePostRSC() {
    const container = document.getElementById('article-post');
    // Dodajemy _embed do URL
    const connector = slug.includes('?') ? '&' : '?';
    const postsUrl = slug.slice(0,3) === '?p=' 
        ? `https://radiorsc.pl/wp-json/wp/v2/posts/${slug.slice(3)}?_embed=true` 
        : `https://radiorsc.pl/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;

    try {
        const response = await fetch(postsUrl);
        let posts = await response.json();
        if (!Array.isArray(posts)) posts = [posts];
        
        if (posts.length === 0 || !posts[0].id) {
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }
        
        const post = posts[0]; // Wybieramy pierwszy post
        
        // --- AKTUALIZACJA TYTUŁU STRONY ---
        // Dekodujemy encje HTML (np. &nbsp; czy &amp;), aby tytuł w karcie przeglądarki wyglądał ładnie
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.title.rendered + ' | krdrt537000ym.github.io';
        document.title = tempDiv.textContent || tempDiv.innerText;
        // ---------------------------------
        
        const htmlContent = posts.map(post => {
            const embed = post._embedded || {};

            // Autor z _embedded
            let authorDisplay = '';
            if (embed.author) {
                const authorName = embed.author[0]?.name || 'Redakcja';
                authorDisplay = `<i class="fa-solid fa-user"></i> ${authorName} | `;
            }

            // Kategorie z _embedded (term[0])
            let categoriesDisplay = '';
            if (embed['wp:term']) {
                const cats = embed['wp:term'][0]
                    .map(cat => cat.name)
                    .join(' • ') || 'Aktualności';
                categoriesDisplay = `<div class="article_category_posts">${cats}</div>`;
            }

            // Tagi z _embedded (term[1])
            let tagsDisplay = '';
            if (embed['wp:term'] && embed['wp:term'][1]) {
                const tags = embed['wp:term'][1].map(tag => tag.name).join(', ');
                tagsDisplay = tags ? `<div class="article_tags_posts"><div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div><div class="article_tagsprefix_list">${tags}</div></div>` : '';
            }

            // Obrazek z _embedded
            let imageDisplay = '';
            if (embed['wp:featuredmedia']) {
                const media = embed['wp:featuredmedia'][0];
                const imgUrl = media.media_details?.sizes?.large?.source_url || media.source_url;
                if (imgUrl) {
                    imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl}" alt="${media.alt_text || ''}"></div></div>`;
                }
            }

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'
            });

            return `
                <div class="articles_posts">
                    <article id="post-${post.id}">
                        <header class="article_headers_posts">
                            ${categoriesDisplay}
                            <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                            <div class="article_postedon_posts">${authorDisplay}${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        ${imageDisplay}
                        <div class="article_singlecontent_posts">${post.content.rendered}</div>
                    </article>
                </div>`;
        });

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania postów.";
    }
}

async function WPArticlePost(slug, mainUrl, is_categories = true, is_tags = true, is_author = true, is_image = true) {
    const container = document.getElementById('article-post');
    // Dodajemy _embed do URL
    const connector = slug.includes('?') ? '&' : '?';
    const postsUrl = slug.slice(0,3) === '?p=' 
        ? `${mainUrl}/wp-json/wp/v2/posts/${slug.slice(3)}?_embed=true` 
        : `${mainUrl}/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;

    try {
        const response = await fetch(postsUrl);
        let posts = await response.json();
        if (!Array.isArray(posts)) posts = [posts];
        
        if (posts.length === 0 || !posts[0].id) {
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }
        
        const post = posts[0]; // Wybieramy pierwszy post
        
        // --- AKTUALIZACJA TYTUŁU STRONY ---
        // Dekodujemy encje HTML (np. &nbsp; czy &amp;), aby tytuł w karcie przeglądarki wyglądał ładnie
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.title.rendered + ' | krdrt537000ym.github.io';
        document.title = tempDiv.textContent || tempDiv.innerText;
        // ---------------------------------
        
        const htmlContent = posts.map(post => {
            const embed = post._embedded || {};

            // Autor z _embedded
            let authorDisplay = '';
            if (is_author && embed.author) {
                const authorName = embed.author[0]?.name || 'Redakcja';
                authorDisplay = `<i class="fa-solid fa-user"></i> ${authorName} | `;
            }

            // Kategorie z _embedded (term[0])
            let categoriesDisplay = '';
            if (is_categories && embed['wp:term']) {
                const cats = embed['wp:term'][0]
                    .map(cat => cat.name)
                    .join(' • ') || 'Aktualności';
                categoriesDisplay = `<div class="article_category_posts">${cats}</div>`;
            }

            // Tagi z _embedded (term[1])
            let tagsDisplay = '';
            if (is_tags && embed['wp:term'] && embed['wp:term'][1]) {
                const tags = embed['wp:term'][1].map(tag => tag.name).join(', ');
                tagsDisplay = tags ? `<div class="article_tags_posts"><div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div><div class="article_tagsprefix_list">${tags}</div></div>` : '';
            }

            // Obrazek z _embedded
            let imageDisplay = '';
            if (is_image && embed['wp:featuredmedia']) {
                const media = embed['wp:featuredmedia'][0];
                const imgUrl = media.media_details?.sizes?.large?.source_url || media.source_url;
                if (imgUrl) {
                    imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl}" alt="${media.alt_text || ''}"></div></div>`;
                }
            }

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'
            });

            return `
                <div class="articles_posts">
                    <article id="post-${post.id}">
                        <header class="article_headers_posts">
                            ${categoriesDisplay}
                            <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                            <div class="article_postedon_posts">${authorDisplay}${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        ${imageDisplay}
                        <div class="article_singlecontent_posts">${post.content.rendered}</div>
                    </article>
                </div>`;
        });

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania postów.";
    }
}
