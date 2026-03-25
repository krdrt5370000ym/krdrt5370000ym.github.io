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

        const htmlContent = `<div class="articles">${posts.map(post => {
            const author = post._embedded?.author?.[0];
            const authorHTML = author 
            ? `<a href="${author.link}">${author.name}</a>` 
            : 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const catsHTML = terms.length > 0 
            ? terms.map(t => `<a href="${t.link}">${t.name}</a>`).join(' • ') 
            : '<a href="https://radiorsc.pl">Aktualności</a>';
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = imgUrl ? `<img src="${imgUrl}" width="150" height="150">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        <div class="article_category">${catsHTML}</div>
                        <div class="article_title"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                        <div class="article_info">
                            <i class="fa-solid fa-user"></i> ${authorHTML} | ${postDate}
                        </div>
                    </div>
                </div>`;
        }).join('')}</div>`;

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

        const htmlContent = `<div class="articles">${posts.map(post => {
            const author = post._embedded?.author?.[0];
            const authorHTML = author 
            ? `<a href="${author.link}">${author.name}</a>` 
            : 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const catsHTML = terms.length > 0 
            ? terms.map(t => `<a href="${t.link}">${t.name}</a>`).join(' • ') 
            : '<a href="${mainUrl}">Aktualności</a>';
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = is_image && imgUrl ? `<img src="${imgUrl}" width="150" height="150">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${is_categories ? `<div class="article_category">${catsHTML}</div>` : ''}
                        <div class="article_title"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                        <div class="article_info">
                            ${is_author ? `<i class="fa-solid fa-user"></i> ${authorHTML} | ` : ''}${postDate}
                        </div>
                    </div>
                </div>`;
        }).join('')}</div>`;

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

async function WPArticlePostRSC(slug) {
    const container = document.getElementById('article-post');
    if (!container) return;

    const postsUrl = slug.slice(0, 3) === '?p=' 
        ? `https://radiorsc.pl/wp-json/wp/v2/posts/${slug.slice(3)}?_embed=true` 
        : `https://radiorsc.pl/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;

    try {
        const response = await fetch(postsUrl);
        
        // TWOJA POPRAWKA: Sprawdzamy status odpowiedzi
        if (!response.ok) throw new Error(`Błąd API: ${response.status}`);
        
        let posts = await response.json();
        
        // Standaryzacja: zamień pojedynczy obiekt na tablicę jednoelementową
        if (!Array.isArray(posts)) posts = [posts];
        
        // Sprawdź, czy mamy dane i czy ID istnieje (ważne przy błędnych slugach)
        if (posts.length === 0 || !posts[0].id) {
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }
        
        const post = posts[0];

        // Tytuł strony (dekodowanie encji HTML)
        const doc = new DOMParser().parseFromString(post.title.rendered, 'text/html');
        document.title = `${doc.body.textContent} | krdrt537000ym.github.io`;

        const htmlContent = posts.map(post => {
            const embed = post._embedded || {};

            // Autor
            let authorDisplay = '';
            if (embed.author && embed.author[0]) {
                const author = embed.author[0];
                const authorName = author.name || 'Redakcja';
                const authorLink = author.link;
                // Tworzymy link do profilu autora
                authorDisplay = `
                    <i class="fa-solid fa-user"></i> 
                    <a href="${authorLink}" target="_blank">${authorName}</a> | `;
            } else {
                authorDisplay = `<i class="fa-solid fa-user"></i> Redakcja | `;
            }

            // Kategorie
            let categoriesDisplay = '';
            if (embed['wp:term'] && embed['wp:term'][0]) {
                const catsHtml = embed['wp:term'][0]
                    .map(cat => `<a href="${cat.link}" target="_blank">${cat.name}</a>`)
                    .join(' • ');
                
                categoriesDisplay = `<div class="article_category_posts">${catsHtml || 'Aktualności'}</div>`;
            }

            // Tagi z linkami z API
            let tagsDisplay = '';
            if (embed['wp:term'] && embed['wp:term'][1] && embed['wp:term'][1].length > 0) {
                const tagsHtml = embed['wp:term'][1]
                    .map(t => `<a href="${t.link}" target="_blank">${t.name}</a>`)
                    .join(', ');
            
                tagsDisplay = `
                    <div class="article_tags_posts">
                        <div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div>
                        <div class="article_tagsprefix_list">${tagsHtml}</div>
                    </div>`;
            }

            // Obrazek wyróżniający
            let imageDisplay = '';
            if (embed['wp:featuredmedia']?.[0]) {
                const media = embed['wp:featuredmedia'][0];
                const imgUrl = media.media_details?.sizes?.large?.source_url || media.source_url;
                imageDisplay = `
                    <div class="wp-site-blocks">
                        <div class="post-thumbnail">
                            <img src="${imgUrl}" alt="${media.alt_text || ''}" style="max-width:100%; height:auto;">
                        </div>
                    </div>`;
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
        container.innerHTML = `<div class="error-msg">Nie udało się pobrać artykułu. (${error.message})</div>`;
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
        
        // Tytuł strony (dekodowanie encji HTML)
        const doc = new DOMParser().parseFromString(post.title.rendered, 'text/html');
        document.title = `${doc.body.textContent} | krdrt537000ym.github.io`;
        
        const htmlContent = posts.map(post => {
            const embed = post._embedded || {};

            // Autor z _embedded
            let authorDisplay = '';
            if (embed.author && embed.author[0]) {
                const author = embed.author[0];
                const authorName = author.name || 'Redakcja';
                const authorLink = author.link;
                // Tworzymy link do profilu autora
                authorDisplay = `
                    <i class="fa-solid fa-user"></i> 
                    <a href="${authorLink}" target="_blank">${authorName}</a> | `;
            } else {
                authorDisplay = `<i class="fa-solid fa-user"></i> Redakcja | `;
            }

            // Kategorie z _embedded (term[0])
            let categoriesDisplay = '';
            if (embed['wp:term'] && embed['wp:term'][0]) {
                const catsHtml = embed['wp:term'][0]
                    .map(cat => `<a href="${cat.link}" target="_blank">${cat.name}</a>`)
                    .join(' • ');
                
                categoriesDisplay = `<div class="article_category_posts">${catsHtml || 'Aktualności'}</div>`;
            }

            // Tagi z _embedded (term[1])
            let tagsDisplay = '';
            if (embed['wp:term'] && embed['wp:term'][1] && embed['wp:term'][1].length > 0) {
                const tagsHtml = embed['wp:term'][1]
                    .map(t => `<a href="${t.link}" target="_blank">${t.name}</a>`)
                    .join(', ');
            
                tagsDisplay = `
                    <div class="article_tags_posts">
                        <div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div>
                        <div class="article_tagsprefix_list">${tagsHtml}</div>
                    </div>`;
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
