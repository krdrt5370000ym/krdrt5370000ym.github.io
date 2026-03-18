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
                const image = post.featured_image_src_large ? '<img src="' + post.featured_image_src_large[0].replace("-1024x768.","-300x225.") + '" width="150" height="150">' : '';

                return `
                    <div class="articles">
                        <div class="article_cover">${image}</div>
                        <div class="article_content">
                            <div class="article_category">${categories}</div>
                            <div class="article_title"><a href="${post.link}" target="_blank">
                                ${post.title.rendered}</a></div>
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

async function WPArticle(mainUrl, is_categories = true, is_author = true, is_image = true) {
    const container = document.getElementById('article-list');
    const postsUrl = `${mainUrl}/wp-json/wp/v2/posts?per_page=10`;

    try {
        const response = await fetch(postsUrl);
        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = "Brak dostępnych aktualności.";
            return;
        }

        const cache = { authors: {}, categories: {}, images: {} };

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
                categoriesDisplay = `<div class="article_category">${cats}</div>`;
            }

            // Logika pobierania obrazu
            let imageDisplay = '';
            if (is_image) {
                if (post.featured_media !== 0) {
                    if (!cache.images[post.featured_media]) {
                        try {
                            const imagesRes = await fetch(`${mainUrl}/wp-json/wp/v2/media/${post.featured_media}`);
                            const imagesData = await imagesRes.json();
                            cache.images[post.featured_media] = imagesData.media_details?.sizes?.medium?.source_url || imagesData.source_url;
                        } catch (e) { cache.images[post.featured_media] = ''; }
                    }
                    imageDisplay = cache.images[post.featured_media] ? `<img src="${cache.images[post.featured_media]}" width="150" height="150">` : '';
                }
            }

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="articles">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${categoriesDisplay}
                        <div class="article_title"><a href="${post.link}" target="_blank">
                            ${post.title.rendered}
                        </a></div>
                        <div class="article_info">
                            ${authorDisplay}${postDate}
                        </div>
                    </div>
                </div>`;
        }));

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania aktualności.";
    }
}

async function WPArticleSOSW() {
    const container = document.getElementById('article-list');
    // Dodajemy parametr _embed, aby pobrać kategorie i zdjęcia w jednym zapytaniu (opcjonalnie, ale przyspiesza)
    const postsUrl = 'https://soswskierniewice.pl/wp-json/wp/v2/posts?per_page=10';

    // Mapa autorów zgodna z Twoją listą
    const authorsMap = {
        2: "Hubert Rosiński",
        3: "Paweł Jaskuła",
        4: "Mari Ola",
        6: "Monika Urbańska",
        7: "Martyna Pawlewicz",
        10: "Andrzej Popiński",
        11: "Agata Sadach"
    };

    try {
        const response = await fetch(postsUrl);
        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = "Brak dostępnych aktualności.";
            return;
        }

        const cache = { categories: {}, images: {} };

        const htmlContent = await Promise.all(posts.map(async (post) => {
            
            // 1. Pobieranie Autora z mapy
            const authorName = authorsMap[post.author] || "Autor nieznany";

            // 2. Logika kategorii
            let categoriesDisplay = '';
            const categoryNames = [];
            for (const catId of post.categories) {
                if (!cache.categories[catId]) {
                    const catRes = await fetch(`https://soswskierniewice.pl/wp-json/wp/v2/categories/${catId}`);
                    const catData = await catRes.json();
                    cache.categories[catId] = catData.name;
                }
                categoryNames.push(cache.categories[catId]);
            }
            const cats = categoryNames.length > 0 ? categoryNames.join(' • ') : 'Aktualności';
            categoriesDisplay = `<div class="article_category">${cats}</div>`;

            // 3. Logika obrazu
            let imageDisplay = '';
            if (post.featured_media !== 0) {
                if (!cache.images[post.featured_media]) {
                    try {
                        const imagesRes = await fetch(`https://soswskierniewice.pl/wp-json/wp/v2/media/${post.featured_media}`);
                        const imagesData = await imagesRes.json();
                        cache.images[post.featured_media] = imagesData.media_details?.sizes?.medium?.source_url || imagesData.source_url;
                    } catch (e) { cache.images[post.featured_media] = ''; }
                }
                imageDisplay = cache.images[post.featured_media] ? `<img src="${cache.images[post.featured_media]}" width="150" height="150">` : '';
            }

            const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="articles">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${categoriesDisplay}
                        <div class="article_title">
                            <a href="${post.link}" target="_blank">
                                ${post.title.rendered}
                            </a>
                        </div>
                        <div class="article_info">
                            <i class="fa-solid fa-user"></i> ${authorName} | ${postDate}
                        </div>
                    </div>
                </div>`;
        }));

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania aktualności.";
    }
}

function WPArticleRSCPost(slug) {
    // Używamy działającej listy kategorii (z pominięciem ID 16)
    const apiUrl = slug.slice(0,3) === '?p=' ? 'https://radiorsc.pl/wp-json/wp/v2/posts/' + slug.slice(3) + '?per_page=1' : 'https://radiorsc.pl/wp-json/wp/v2/posts?slug=' + slug + '&per_page=1';
    const container = document.getElementById('article-post');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Błąd połączenia');
            return response.json(); // KLUCZOWE: musisz sparsować dane do JSON
        })
        .then(data => {
            // Standaryzacja: jeśli to obiekt (pojedynczy post), zamień go w tablicę jednoelementową
            const posts = Array.isArray(data) ? data : (data && data.id ? [data] : []);
            
            if (posts.length === 0) {
                document.getElementById('article-post').innerHTML = "Brak dostępnych postów.";
                return;
            }
            
            const htmlContent = posts.map(post => {
                // ... reszta Twojej logiki formatowania (postDate, author, image itd.) ...
                const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'
                });
                
                const categories = post.category_info ? post.category_info.map(cat => cat.name).join(' • ') : 'Aktualności';
                const author = post.author_info ? post.author_info.display_name : 'Redakcja';
                const image = post.featured_image_src_large ? `<img src="${post.featured_image_src_large[0]}" width="2560" height="1920">` : '';
        
                return `
                    <div class="articles_posts">
                        <article id="post-${post.id}">
                            <header class="article_headers_posts">
                                <div class="article_category_posts">${categories}</div>
                                <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered}</a></div>
                                <div class="article_postedon_posts"><i class="fa-solid fa-user"></i> ${author} | ${postDate}</div>
                            </header>
                            <div class="article_cover_posts">${image}</div>
                            <div class="article_singlecontent_posts">${post.content.rendered}</div>
                        </article>
                    </div>`;
            }).join('');
        
            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error("Błąd WP API:", error);
            container.innerHTML = "Błąd podczas ładowania postów.";
        });
}

async function WPArticlePost(slug, mainUrl, is_categories = true, is_tags = true, is_author = true, is_image = true) {
    const container = document.getElementById('article-post');
    const postsUrl = slug.slice(0,3) === '?p=' ? `${mainUrl}/wp-json/wp/v2/posts/${slug.slice(3)}?per_page=1` : `${mainUrl}/wp-json/wp/v2/posts?slug=${slug}&per_page=1`;

    try {
        const response = await fetch(postsUrl);
        let posts = await response.json();
        if (!Array.isArray(posts)) posts = [posts]; // Zamień pojedynczy obiekt na tablicę jednoelementową
        
        if (posts.length === 0 || !posts[0].id) { // Dodatkowe sprawdzenie czy post istnieje
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }

        const cache = { authors: {}, categories: {}, tags: {}, images: {} };

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
                categoriesDisplay = `<div class="article_category_posts">${cats}</div>`;
            }

            // Logika pobierania tagi
            let tagsDisplay = '';
            if (is_tags) {
                const tagNames = [];
                for (const tagId of post.tags) {
                    if (!cache.tags[tagId]) {
                        const tagRes = await fetch(`${mainUrl}/wp-json/wp/v2/tags/${tagId}`);
                        const tagData = await tagRes.json();
                        cache.tags[tagId] = tagData.name;
                    }
                    tagNames.push(cache.tags[tagId]);
                }
                const tags = tagNames.length > 0 ? tagNames.join(', ') : '';
                tagsDisplay = tags ? `<div class="article_tags_posts"><div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div><div class="article_tagsprefix_list">${tags}</div></div>` : '';
            }

            // Logika pobierania obrazu
            let imageDisplay = '';
            if (is_image) {
                if (post.featured_media !== 0) {
                    if (!cache.images[post.featured_media]) {
                        try {
                            const imagesRes = await fetch(`${mainUrl}/wp-json/wp/v2/media/${post.featured_media}`);
                            const imagesData = await imagesRes.json();
                            cache.images[post.featured_media] = imagesData.media_details?.sizes?.large?.source_url || imagesData.source_url;
                        } catch (e) { cache.images[post.featured_media] = ''; }
                    }
                    imageDisplay = cache.images[post.featured_media] ? `<img src="${cache.images[post.featured_media]}" width="2560" height="1920">` : '';
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
                        <div class="article_cover_posts">${imageDisplay}</div>
                        <div class="article_singlecontent_posts">${post.content.rendered}</div>
                    </article>
                </div>`;
        }));

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania postów.";
    }
}

async function WPArticleSOSWPost(slug) {
    const container = document.getElementById('article-post');
    const postsUrl = slug.slice(0,3) === '?p=' ? `https://soswskierniewice.pl/wp-json/wp/v2/posts/${slug.slice(3)}?per_page=1` : `https://soswskierniewice.pl/wp-json/wp/v2/posts?slug=${slug}&per_page=1`;

    // Mapa autorów zgodna z Twoją listą
    const authorsMap = {
        2: "Hubert Rosiński",
        3: "Paweł Jaskuła",
        4: "Mari Ola",
        6: "Monika Urbańska",
        7: "Martyna Pawlewicz",
        10: "Andrzej Popiński",
        11: "Agata Sadach"
    };

    try {
        const response = await fetch(postsUrl);
        const posts = await response.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = "Brak dostępnych postów.";
            return;
        }

        const cache = { categories: {}, tags: {}, images: {} };

        const htmlContent = await Promise.all(posts.map(async (post) => {
            
            // 1. Pobieranie Autora z mapy
            const authorName = authorsMap[post.author] || "Autor nieznany";

            // 2. Logika kategorii
            let categoriesDisplay = '';
            const categoryNames = [];
            for (const catId of post.categories) {
                if (!cache.categories[catId]) {
                    const catRes = await fetch(`https://soswskierniewice.pl/wp-json/wp/v2/categories/${catId}`);
                    const catData = await catRes.json();
                    cache.categories[catId] = catData.name;
                }
                categoryNames.push(cache.categories[catId]);
            }
            const cats = categoryNames.length > 0 ? categoryNames.join(' • ') : 'Aktualności';
            categoriesDisplay = `<div class="article_category_posts">${cats}</div>`;

            // 3. Logika tagi
            let tagsDisplay = '';
            const tagNames = [];
            for (const tagId of post.tags) {
                if (!cache.tags[tagId]) {
                    const tagRes = await fetch(`https://soswskierniewice.pl/wp-json/wp/v2/tags/${tagId}`);
                    const tagData = await tagRes.json();
                    cache.tags[tagId] = tagData.name;
                }
                tagNames.push(cache.tags[tagId]);
            }
            const tags = tagNames.length > 0 ? tagNames.join(', ') : '';
            tagsDisplay = tags ? `<div class="article_tags_posts"><div class="article_tagsprefix_posts"><i class="fa-solid fa-tags"></i> Tagi: </div><div class="article_tagsprefix_list">${tags}</div></div>` : '';

            // 4. Logika obrazu
            let imageDisplay = '';
            if (post.featured_media !== 0) {
                if (!cache.images[post.featured_media]) {
                    try {
                        const imagesRes = await fetch(`https://soswskierniewice.pl/wp-json/wp/v2/media/${post.featured_media}`);
                        const imagesData = await imagesRes.json();
                        cache.images[post.featured_media] = imagesData.media_details?.sizes?.large?.source_url || imagesData.source_url;
                    } catch (e) { cache.images[post.featured_media] = ''; }
                }
                imageDisplay = cache.images[post.featured_media] ? `<img src="${cache.images[post.featured_media]}" width="2560" height="1920">` : '';
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
                            <div class="article_postedon_posts"><i class="fa-solid fa-user"></i> ${authorName} | ${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        <div class="article_cover_posts">${imageDisplay}</div>
                        <div class="article_singlecontent_posts">${post.content.rendered}</div>
                    </article>
                </div>`;
        }));

        container.innerHTML = htmlContent.join('');

    } catch (error) {
        console.error("Błąd WP API:", error);
        container.innerHTML = "Błąd podczas ładowania postów.";
    }
}
