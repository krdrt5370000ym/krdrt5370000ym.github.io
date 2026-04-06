let currentPage = 1;
const perPage = 10;

async function WPArticleRSC(append = false) {
    const container = document.getElementById('article-list');
    const button = document.getElementById('load-more-btn');
    
    if (!append) currentPage = 1;

    const postsUrl = `https://radiorsc.pl/wp-json/wp/v2/posts?categories=1,18,19,20,44,46,47,50,63,73,74,75&per_page=${perPage}&page=${currentPage}&_embed=true`;

    try {
        if (button) button.innerText = "Ładowanie...";
        
        const response = await fetch(postsUrl);
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
            const authorHTML = author ? `<a href="${author.link}">${author.name}</a>` : 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const catsHTML = terms.length > 0 
                ? terms.map(t => `<a href="${t.link}">${t.name}</a>`).join(' • ') 
                : 'Aktualności';
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = imgUrl ? `<img src="${imgUrl}" width="150" height="150" style="object-fit:cover;">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // WAŻNE: Wywołujemy WPArticlePostRSCLoad bezpośrednio w onclick
            return `
                <article class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        <div class="article_category">${catsHTML}</div>
                        <div class="article_title">
                            <a href="javascript:void(0)" onclick="WPArticlePostRSCLoad('${post.slug}')">
                                ${post.title.rendered}
                            </a>
                        </div>
                        <div class="article_info">
                            <i class="fa-solid fa-user"></i> ${authorHTML} | ${postDate}
                        </div>
                    </div>
                </article>`;
        }).join('')}</div>`;

        if (append) {
            container.innerHTML += htmlContent;
        } else {
            container.innerHTML = htmlContent;
        }

        if (button) {
            button.innerText = "Wczytaj więcej";
            button.style.display = posts.length < perPage ? 'none' : 'block';
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

async function WPArticle(mainUrl, is_categories = true, is_author = true, is_image = true, is_http = false, append = false) {
    const container = document.getElementById('article-list');
    const button = document.getElementById('load-more-btn');
    
    if (!append) currentPage = 1;

    const postsUrl = `${mainUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${currentPage}&_embed=true`;
    const httpUrl = is_http ? 'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl) : postsUrl;

    try {
        if (button) button.innerText = "Ładowanie...";
        const response = await fetch(httpUrl);
        
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
            const authorHTML = author ? `<a href="${author.link}">${author.name}</a>` : 'Redakcja';
            const terms = post._embedded?.['wp:term']?.[0] || [];
            const catsHTML = terms.length > 0 
                ? terms.map(t => `<a href="${t.link}">${t.name}</a>`).join(' • ') 
                : `<a href="${mainUrl}">Aktualności</a>`;
            
            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
            const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
            const imageDisplay = is_image && imgUrl ? `<img src="${imgUrl}" width="150" height="150" style="object-fit:cover;">` : '';

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <article class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${is_categories ? `<div class="article_category">${catsHTML}</div>` : ''}
                        <div class="article_title">
                            <a href="javascript:void(0)" onclick="WPArticlePostLoad('${post.slug}','${mainUrl}')">
                                ${post.title.rendered}
                            </a>
                        </div>
                        <div class="article_info">
                            ${is_author ? `<i class="fa-solid fa-user"></i> ${authorHTML} | ` : ''}${postDate}
                        </div>
                    </div>
                </article>`;
        }).join('')}</div>`;

        if (append) {
            container.innerHTML += htmlContent;
        } else {
            container.innerHTML = htmlContent;
        }

        if (button) {
            button.innerText = "Wczytaj więcej";
            button.style.display = posts.length < perPage ? 'none' : 'block';
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
        if (!response.ok) throw new Error(`Błąd API: ${response.status}`);
        
        let posts = await response.json();
        if (!Array.isArray(posts)) posts = [posts];
        
        if (posts.length === 0 || !posts[0].id) {
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }

        // Mapujemy posty na obietnice HTML (obsługa wielu postów i asynchronicznego playera)
        const postPromises = posts.map(async (post) => {
            const embed = post._embedded || {};

            // 1. Tytuł (dekodowanie encji i ustawianie title strony)
            const titleDoc = new DOMParser().parseFromString(post.title.rendered, 'text/html');
            const cleanTitle = titleDoc.body.textContent;
            document.title = `${cleanTitle} | krdrt537000ym.github.io`;

            // 2. Autor
            let authorDisplay = '<i class="fa-solid fa-user"></i> Redakcja | ';
            if (embed.author?.[0]) {
                authorDisplay = `<i class="fa-solid fa-user"></i> <a href="${embed.author[0].link}" target="_blank">${embed.author[0].name}</a> | `;
            }

            // 3. Kategorie
            let categoriesDisplay = '';
            if (embed['wp:term']?.[0]) {
                const catsHtml = embed['wp:term'][0]
                    .map(cat => `<a href="${cat.link}" target="_blank">${cat.name}</a>`)
                    .join(' • ');
                categoriesDisplay = `<div class="article_category_posts">${catsHtml}</div>`;
            }

            // 4. Tagi
            let tagsDisplay = '';
            if (embed['wp:term']?.[1]?.length > 0) {
                const tagsHtml = embed['wp:term'][1]
                    .map(t => `<a href="${t.link}" target="_blank">${t.name}</a>`)
                    .join(', ');
                tagsDisplay = `
                    <div class="article_tags_posts">
                        <div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div>
                        <div class="article_tagsprefix_list">${tagsHtml}</div>
                    </div>`;
            }

            // 5. Obrazek wyróżniający
            let imageDisplay = '';
            if (embed['wp:featuredmedia']?.[0]) {
                const media = embed['wp:featuredmedia'][0];
                const imgUrl = media.media_details?.sizes?.large?.source_url || media.source_url;
                imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl}" alt="${media.alt_text || ''}"></div></div>`;
            }

            // 6. Pobieranie Audio (Player) - CZEKAMY NA WYNIK
            const playerHtml = await WPArticlePostRSCPlayer(post.link);

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
                        ${playerHtml}
                        <div class="article_singlecontent_posts">${post.content.rendered}</div>
                    </article>
                </div>`;
        });

        // Czekamy na wygenerowanie wszystkich postów (wraz z audio)
        const results = await Promise.all(postPromises);
        container.innerHTML = results.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = `<div class="error-msg">Nie udało się pobrać artykułu.</div>`;
    }
}

async function WPArticlePost(slug, mainUrl, is_categories = true, is_tags = true, is_author = true, is_image = true, is_http = false) {
    const container = document.getElementById('article-post');
    // Dodajemy _embed do URL
    const connector = slug.includes('?') ? '&' : '?';
    const postsUrl = slug.slice(0,3) === '?p=' 
        ? `${mainUrl}/wp-json/wp/v2/posts/${slug.slice(3)}?_embed=true` 
        : `${mainUrl}/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;
    const httpUrl = is_http ? 'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl) : postsUrl;

    try {
        const response = await fetch(httpUrl);
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

async function WPArticlePostRSCPlayer(targetUrl) {
    const proxyUrl = 'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev?url=' + encodeURIComponent(targetUrl);
    // XPath celujący w kontener audio
    const xpath = "//div[contains(@class, 'custom-audio-block')]//audio/@src";
    
    try {
        const response = await fetch(proxyUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!response.ok) return '';

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        // Szukanie atrybutu src
        const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const audioNode = result.singleNodeValue;
        
        // .value pobiera treść atrybutu @src
        const audioSrc = audioNode ? audioNode.value.trim() : null;

        if (audioSrc && audioSrc.endsWith('.mp3')) {
            return `
                <div class="article_player_posts">
                    <small>Posłuchaj tutaj:</small><br>
                    <audio controls src="${audioSrc}"></audio>
                </div>`;
        }
        return '';
    } catch (e) {
        return '';
    }
}

async function WPArticlePage(slug, mainUrl, is_http = false) {
    const container = document.getElementById('article-post');
    
    // Budowanie poprawnego URL (obsługa ID lub sluga)
    const postsUrl = slug.startsWith('?p=') 
        ? `${mainUrl}/wp-json/wp/v2/pages/${slug.slice(3)}?_embed=true` 
        : `${mainUrl}/wp-json/wp/v2/pages?slug=${slug}&per_page=1&_embed=true`;
    const httpUrl = is_http ? 'https://tiny-pond-4c8d.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl) : postsUrl;

    try {
        const response = await fetch(httpUrl);
        let data = await response.json();
        
        // WP API zwraca obiekt dla pojedynczego ID lub tablicę dla sluga
        const page = Array.isArray(data) ? data[0] : data;

        if (!page || !page.id) {
            container.innerHTML = "Brak dostępnej strony.";
            return;
        }
        
        // Dekodowanie tytułu i ustawienie dokumentu
        const doc = new DOMParser().parseFromString(page.title.rendered, 'text/html');
        document.title = `${doc.body.textContent} | krdrt537000ym.github.io`;

        // Obsługa obrazka wyróżniającego (Featured Media)
        const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        const imageHTML = featuredImage ? `<img src="${featuredImage}" class="article-image">` : '';

        // Generowanie HTML
        container.innerHTML = `
            <div class="articles_posts">
                <article id="page-${page.id}">
                    <header class="article_headers_posts">
                        <div class="article_title_posts">
                            <a href="${page.link}" target="_blank">${page.title.rendered}</a>
                        </div>
                    </header>
                    ${imageHTML}
                    <div class="article_singlecontent_posts">${page.content.rendered}</div>
                </article>
            </div>`;

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania treści.";
    }
}

function WPArticlePostRSCLoad(id) {
    // 1. Otwieramy okno NATYCHMIAST (to omija filtry na mobile)
    const win = window.open("", "_blank");

    if (!win) {
        alert("Przeglądarka zablokowała wyskakujące okno. Proszę zezwolić na pop-upy dla tej strony w ustawieniach przeglądarki.");
        return;
    }

    // 2. Przygotowujemy szkielet HTML
  const htmlContent = `<!DOCTYPE html>
                       <html>
                          <head>
                             <meta charset="UTF-8">
                             <meta name='robots' content='noindex, follow' />
                             <title> | krdrt537000ym.github.io</title>
                             <script src="https://krdrt5370000ym.github.io/site-head.js"><\/script>
                          </head>
                          <body class="w3-light-grey">
                             <link rel="stylesheet" href="https://krdrt5370000ym.github.io/media/media-a.css">
                             <link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css">
                             <script src="https://krdrt5370000ym.github.io/site-topscreen.js"><\/script>
                             <div class="w3-main" style="margin-left:300px;margin-top:43px;">
                                <!-- Header -->
                                <header class="w3-container" style="padding-top:22px">
                                   <h5><b><i class="fa-solid fa-newspaper"></i> Artykuł</b></h5>
                                </header>
                                <div class="w3-row-padding w3-margin-bottom">
                                   <div style="margin-left: 10px;" id="article-post">Ładowanie postów...</div>
                                </div>
                                <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
                             </div>
                             <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
                             <script src="https://krdrt5370000ym.github.io/media/site-article.js"><\/script>
                             <script>
                                // Czekamy na załadowanie skryptów zewnętrznych
                                window.onload = function() {
                                  if (typeof WPArticlePostRSC === 'function') {
                                     WPArticlePostRSC('${id}');
                                  } else {
                                     document.getElementById('article-post').innerHTML = 'Błąd: Nie można załadować modułu artykułów.';
                                   }
                                  };
                             <\/script>
                        </body>
                    </html>`;

    // 3. Wstrzykujemy treść do otwartego okna
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
}

function WPArticlePostLoad(id, mainUrl, is_http = false) {
    // 1. Otwieramy okno natychmiast (User Gesture)
    const win = window.open("", "_blank");

    if (!win) {
        alert("Zablokowano wyskakujące okienko. Zezwól na pop-upy w ustawieniach przeglądarki.");
        return;
    }

    // 2. Budujemy treść dokumentu (bez Bloba)
    const htmlContent = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name='robots' content='noindex, follow' />
            <title> | krdrt537000ym.github.io</title>
            <script src="https://krdrt5370000ym.github.io/site-head.js"><\/script>
        </head>
        <body class="w3-light-grey">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/media/media-a.css">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css">
            <script src="https://krdrt5370000ym.github.io/site-topscreen.js"><\/script>
            <div class="w3-main" style="margin-left:300px;margin-top:43px;">
                <!-- Header -->
                <header class="w3-container" style="padding-top:22px">
                    <h5><b><i class="fa-solid fa-newspaper"></i> Artykuł</b></h5>
                </header>
                <div class="w3-row-padding w3-margin-bottom">
                    <div style="margin-left: 10px;" id="article-post">Ładowanie postów...</div>
                    </div>
                    <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
                </div>
          <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
          <script src="https://krdrt5370000ym.github.io/media/site-article.js"><\/script>
          <script>
             window.onload = function() {
                if (typeof WPArticlePost === 'function') {
                   WPArticlePost(${is_http ? `'${id}', '${mainUrl}', ${is_http}` : `'${id}', '${mainUrl}'`});
                }
             };
          <\/script>
       </body>
    </html>`;

    // 3. Wpisujemy treść do otwartego okna
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
}

function WPArticlePageLoad(id, mainUrl, is_http = false) {
    // 1. Otwieramy okno natychmiast (User Gesture)
    const win = window.open("", "_blank");

    if (!win) {
        alert("Zablokowano wyskakujące okienko. Zezwól na pop-upy w ustawieniach przeglądarki.");
        return;
    }

    // 2. Budujemy treść dokumentu (bez Bloba)
    const htmlContent = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name='robots' content='noindex, follow' />
            <title> | krdrt537000ym.github.io</title>
            <script src="https://krdrt5370000ym.github.io/site-head.js"><\/script>
        </head>
        <body class="w3-light-grey">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/media/media-a.css">
            <link rel="stylesheet" href="https://krdrt5370000ym.github.io/style.css">
            <script src="https://krdrt5370000ym.github.io/site-topscreen.js"><\/script>
            <div class="w3-main" style="margin-left:300px;margin-top:43px;">
                <!-- Header -->
                <header class="w3-container" style="padding-top:22px">
                    <h5><b><i class="fa-solid fa-newspaper"></i> Artykuł</b></h5>
                </header>
                <div class="w3-row-padding w3-margin-bottom">
                    <div style="margin-left: 10px;" id="article-post">Ładowanie postów...</div>
                    </div>
                    <script src="https://krdrt5370000ym.github.io/site-bottomscreen.js"><\/script>
                </div>
          <script src="https://krdrt5370000ym.github.io/site-sidebar.js"><\/script>
          <script src="https://krdrt5370000ym.github.io/media/site-article.js"><\/script>
          <script>
             window.onload = function() {
                if (typeof WPArticlePage === 'function') {
                   WPArticlePage(${is_http ? `'${id}', '${mainUrl}', ${is_http}` : `'${id}', '${mainUrl}'`});
                }
             };
          <\/script>
       </body>
    </html>`;

    // 3. Wpisujemy treść do otwartego okna
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
}
