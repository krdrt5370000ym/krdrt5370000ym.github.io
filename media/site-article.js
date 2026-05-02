let cachedCategoryIds = null;

async function WPArticleRSC(append = false) {
   const container = document.getElementById('article-list');
   const button = document.getElementById('load-more-btn');
   const proxyBase = 'https://cors.krdrt5370000ym2.workers.dev/?url=';
   const perPage = 10;

   if (!append) window.currentPage = 1;
   else window.currentPage++;

   try {
      if (button) {
         button.innerText = "Ładowanie...";
         button.disabled = true;
      }

      // 1. Czekamy na wykluczone kategorie (można to zoptymalizować wynosząc poza funkcję)
      const include18 = await fetchParentCategoriesIn(18);
      const include19 = await fetchParentCategoriesIn(19);
      const include75 = await fetchParentCategoriesIn(75);

      const postsUrl = `https://radiorsc.pl/wp-json/wp/v2/posts?categories=1,${include18},${include19},${include75}&per_page=${perPage}&page=${window.currentPage}&_embed=true`;

      const response = await fetch(proxyBase + encodeURIComponent(postsUrl));
      if (!response.ok) throw new Error("Błąd odpowiedzi sieci");

      const posts = await response.json();

      if (!Array.isArray(posts) || posts.length === 0) {
         if (!append) container.innerHTML = "Brak aktualności.";
         if (button) button.style.display = 'none';
         return;
      }

      // Mapujemy same artykuły (bez kontenera .articles wewnątrz map)
      const articlesHTML = posts.map(post => {
         const author = post._embedded?.author?.[0];
         const authorHTML = author ? `<a href="article-list?si=radiorsc&a=${author.id}">${author.name}</a>` : 'Redakcja';
         const terms = post._embedded?.['wp:term']?.[0] || [];
         const catsHTML = terms.length > 0 ?
            terms.map(t => `<a href="article-list?si=radiorsc&c=${t.id}">${t.name}</a>`).join(' • ') :
            'Aktualności';

         const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
         const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
         const imageDisplay = imgUrl ? `<img src="${imgUrl.replaceAll("https://radiorsc.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiorsc.pl/")}" width="150" height="150" style="object-fit:cover;">` : '';

         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
         });

         return `
                <article class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        <div class="article_category">${catsHTML}</div>
                        <div class="article_title">
                            <a href="article?id=${post.slug}&si=radiorsc" target="_blank">
                                ${post.title.rendered || '{Brak tytułu}'}
                            </a>
                        </div>
                        <div class="article_info">
                            <i class="fa-solid fa-user"></i> ${authorHTML} | ${postDate}
                        </div>
                    </div>
                </article>`;
      }).join('');

      if (append) {
         const articlesWrapper = container.querySelector('.articles');
         if (articlesWrapper) {
            articlesWrapper.insertAdjacentHTML('beforeend', articlesHTML);
         } else {
            container.insertAdjacentHTML('beforeend', articlesHTML);
         }
      } else {
         // Pierwsze ładowanie: tworzymy główny kontener
         container.innerHTML = `<div class="articles">${articlesHTML}</div>`;
      }

      if (button) {
         button.innerText = "Wczytaj więcej";
         button.disabled = false;
         button.style.display = posts.length < perPage ? 'none' : 'block';
         // Ważne: przypisujemy funkcję, nie wynik funkcji
         button.onclick = () => WPArticleRSC(true);
      }

   } catch (error) {
      console.error("Błąd WP API:", error);
      if (!append) container.innerHTML = 'Nie udało się pobrać artykułów.';
      if (button) button.style.display = 'none';
   }
}

async function WPArticle(mainUrl, siteKey, is_categories = true, is_author = true, is_image = true, append = false) {
   const container = document.getElementById('article-list');
   const button = document.getElementById('load-more-btn');
   const perPage = 10;

   if (!append) {
      window.currentPage = 1;
   } else {
      window.currentPage++;
   }

   const postsUrl = `${mainUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${window.currentPage}&_embed=true`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=';

   try {
      if (button) {
         button.innerText = "Ładowanie...";
         button.disabled = true;
      }

      const response = await fetch(proxyUrl + encodeURIComponent(postsUrl));
      if (!response.ok) throw new Error("Błąd odpowiedzi sieci");

      const posts = await response.json();

      if (!Array.isArray(posts) || posts.length === 0) {
         if (!append) container.innerHTML = "Brak aktualności.";
         if (button) button.style.display = 'none';
         return;
      }

      // Mapujemy tylko pojedyncze artykuły do stringa
      const articlesHtml = posts.map(post => {
         const author = post._embedded?.author?.[0];
         const authorSite = mainUrl === "https://radiovictoria.pl" ? author?.link : `article-list?si=${siteKey}&a=${author?.id}`;
         const authorHtml = author ? `<a href="${authorSite}">${author.name}</a>` : 'Redakcja';

         const terms = post._embedded?.['wp:term']?.[0] || [];
         const catsHtml = terms.length > 0 ?
            terms.map(t => `<a href="article-list?si=${siteKey}&c=${t.id}">${t.name}</a>`).join(' • ') :
            `<a href="${mainUrl}">Aktualności</a>`;

         const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
         const imgUrl = featuredMedia?.media_details?.sizes?.medium?.source_url || featuredMedia?.source_url;
         const imageDisplay = is_image && imgUrl ? `<img src="${imgUrl.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl)}" width="150" height="150" style="object-fit:cover;" alt="">` : '';

         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
         });

         return `
                <article class="article_post">
                    <div class="article_cover">${imageDisplay}</div>
                    <div class="article_content">
                        ${is_categories ? `<div class="article_category">${catsHtml}</div>` : ''}
                        <div class="article_title">
                            <a href="article?id=${post.slug}&si=${siteKey}" target="_blank">
                                ${post.title.rendered || '{Brak tytułu}'}
                            </a>
                        </div>
                        <div class="article_info">
                            ${is_author ? `<i class="fa-solid fa-user"></i> ${authorHtml} | ` : ''}${postDate}
                        </div>
                    </div>
                </article>`;
      }).join('');

      if (append) {
         // Szukamy istniejącego wrappera .articles, jeśli nie ma, dodajemy do container
         const wrapper = container.querySelector('.articles') || container;
         wrapper.insertAdjacentHTML('beforeend', articlesHtml);
      } else {
         // Przy pierwszym ładowaniu tworzymy strukturę z wrapperem
         container.innerHTML = `<div class="articles">${articlesHtml}</div>`;
      }

      if (button) {
         button.innerText = "Wczytaj więcej";
         button.disabled = false;
         // Ukryj przycisk, jeśli pobrano mniej postów niż limit perPage (koniec listy)
         button.style.display = posts.length < perPage ? 'none' : 'block';
         button.onclick = () => WPArticle(mainUrl, siteKey, is_categories, is_author, is_image, true);
      }

   } catch (error) {
      console.error("Błąd WP API:", error);
      if (!append) container.innerHTML = 'Nie udało się pobrać artykułów.';
      if (button) button.style.display = 'none';
   }
}

async function WPArticleList(
   mainUrl,
   siteKey,
   type = 'post',
   search = null,
   categoryID = null,
   tagID = null,
   authorID = null,
   is_categories = true,
   is_author = true,
   is_image = true,
   append = false
) {
   const container = document.getElementById('article-list');
   const containerS = document.getElementById('article-s-result');
   const containerC = document.getElementById('article-c-result');
   const containerT = document.getElementById('article-t-result');
   const containerA = document.getElementById('article-a-result');
   const button = document.getElementById('load-more-btn');

   const proxyBase = 'https://cors.krdrt5370000ym2.workers.dev/?url=';
   const perPage = 10;

   if (!append) {
      window.currentPage = 1;
      window.cachedCategoryIds = null;
   } else {
      window.currentPage++;
   }

   try {
      if (button) {
         button.innerText = "Ładowanie...";
         button.disabled = true;
      }

      let finalCategoryIds = categoryID;

      if (categoryID) {
         if (!window.cachedCategoryIds) {
            window.cachedCategoryIds = await fetchParentCategories(categoryID, proxyBase + encodeURIComponent(mainUrl));
         }
         finalCategoryIds = window.cachedCategoryIds;
      }

      const params = new URLSearchParams({
         per_page: perPage,
         page: window.currentPage,
         _embed: true
      });

      if (search) params.append('search', search);
      if (categoryID) params.append('categories', finalCategoryIds);
      if (tagID) params.append('tags', tagID);

      if (authorID) {
         if (siteKey === 'radiolodz') {
            params.append('ppma_author', authorID);
         } else {
            params.append('author', authorID);
         }
      }

      const endpoint = type === 'post' ? 'posts' : 'pages';
      const url = `${mainUrl}/wp-json/wp/v2/${endpoint}?${params.toString()}`;
      const response = await fetch(proxyBase + encodeURIComponent(url));

      if (!response.ok) throw new Error("Błąd API");

      const posts = await response.json();

      if (!Array.isArray(posts) || posts.length === 0) {
         if (!append) container.innerHTML = "Brak wyników.";
         if (button) button.style.display = 'none';
         return;
      }

      // 🔹 Pobieranie nazw
      let categoryName = '';
      let categoryLink = '';
      let categoryParent = false;
      let subcategoryID = '';
      let subcategoryName = '';
      let tagName = '';
      let tagLink = '';
      let authorName = '';
      let authorLink = '';

      // 🔹 KATEGORIA
      if (categoryID) {
         const res = await fetch(`${proxyBase}${encodeURIComponent(`${mainUrl}/wp-json/wp/v2/categories/${categoryID}?_embed=true`)}`);
         const data = await res.json();

         categoryName = data.name;
         categoryLink = data.link;
         categoryParent = data.parent !== 0;

         if (categoryParent && data._embedded?.up?.[0]) {
            subcategoryID = data._embedded.up[0].id;
            subcategoryName = data._embedded.up[0].name;
         }
      }

      // 🔹 TAG
      if (tagID) {
         const res = await fetch(`${proxyBase}${encodeURIComponent(`${mainUrl}/wp-json/wp/v2/tags/${tagID}?_embed=true`)}`);
         const data = await res.json();

         tagName = data.name;
         tagLink = data.link;
      }

      // 🔹 AUTOR
      if (authorID) {
         try {
            let res;

            if (siteKey === 'radiolodz') {
               res = await fetch(`${proxyBase}${encodeURIComponent(`${mainUrl}/wp-json/wp/v2/ppma_author/${authorID}?_embed=true`)}`);
            } else {
               res = await fetch(`${proxyBase}${encodeURIComponent(`${mainUrl}/wp-json/wp/v2/users/${authorID}?_embed=true`)}`);
            }

            const data = await res.json();

            authorName = data.name || '';
            authorLink = data.link || '';
         } catch (e) {
            console.warn('Błąd pobierania autora', e);
         }
      }

      // 🔹 Wyniki nagłówków
      if (containerS) {
         containerS.innerHTML = search ?
            `Wyniki dla: <b>${search}</b>` :
            '';
      }

      if (containerC) {
         containerC.innerHTML = categoryName ?
            `Kategoria: ${
               categoryParent
               ? `<a href="article-list?si=${siteKey}&c=${subcategoryID}">${subcategoryName}</a> / `
               : ''
            }<b><a href="${categoryLink}">${categoryName}</a></b>` :
            '';
      }

      if (containerT) {
         containerT.innerHTML = tagName ?
            `Tag: <b><a href="${tagLink}">${tagName}</a></b>` :
            '';
      }

      if (containerA) {
         containerA.innerHTML = authorName ?
            `Autor: <b><a href="${authorLink}">${authorName}</a></b>` :
            '';
      }

      // 🔹 Tytuł strony
      const searchTitle = search ? 'Wyniki wyszukiwania: ' + search : '';

      const docTitle = [
         searchTitle,
         categoryName,
         tagName,
         authorName
      ].filter(Boolean).join(' | ') || 'Artykuły';

      document.title = docTitle + ' | krdrt5370000ym.github.io';

      // 🔹 Generowanie HTML
      const postsHTML = posts.map(post => {
         const title = post.title.rendered.replace(/<[^>]+>/g, '');

         // 🔹 Autor
         let authorHTML = 'Redakcja';

         if (siteKey === 'radiolodz') {

            // 🔹 POSTY (mają tablicę authors)
            if (type === 'post' && post.authors && post.authors.length > 0) {
               authorHTML = post.authors.map(a =>
                  `<a href="article-list?si=${siteKey}&a=${a.term_id}">${a.display_name}</a>`
               ).join(', ');
            }

            // 🔹 STRONY (autor w taksonomii)
            else if (type === 'page') {
               const terms = post._embedded?.['wp:term'] || [];

               let authors = [];

               terms.forEach(group => {
                  group.forEach(term => {
                     // często autorzy mają slug lub taxonomy zawierające "author"
                     if (
                        term.taxonomy?.includes('author') ||
                        term.slug?.includes('autor') ||
                        term.slug?.includes('author')
                     ) {
                        authors.push(term);
                     }
                  });
               });

               if (authors.length > 0) {
                  authorHTML = authors.map(a =>
                     `<a href="article-list?si=${siteKey}&a=${a.id}">${a.name}</a>`
                  ).join(', ');
               } else {
                  authorHTML = 'Radio Łódź';
               }
            }

         } else {
            // 🔹 NORMALNY WORDPRESS
            if (post._embedded?.author?.[0]) {
               const author = post._embedded.author[0];
               const link = mainUrl === "https://radiovictoria.pl" ? author.link : `article-list?si=${siteKey}&a=${author.id}`;
               authorHTML = `<a href="${link}">${author.name}</a>`;
            }
         }

         // 🔹 Kategorie
         const terms = post._embedded?.['wp:term']?.[0] || [];
         const catsHTML = terms.map(t =>
            `<a href="article-list?si=${siteKey}&c=${t.id}">${t.name}</a>`
         ).join(' • ');

         // 🔹 Obrazek
         const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
         const imgUrl = featuredMedia?.source_url || '';

         const imageHTML = (is_image && imgUrl) ?
            `<img src="${imgUrl.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl)}" width="150" height="150" style="object-fit:cover;" loading="lazy">` :
            '';

         // 🔹 Data
         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
         });

         return `
            <article class="article_post">
                <div class="article_cover">${imageHTML}</div>
                <div class="article_content">
                    ${is_categories && type === 'post'
                        ? `<div class="article_category">${catsHTML}</div>`
                        : ''}

                    <div class="article_title">
                        <a href="article?id=${post.slug}&si=${siteKey}" target="_blank">
                            ${title || '{Brak tytułu}'}
                        </a>
                    </div>

                    <div class="article_info">
                        ${is_author ? `<i class="fa-solid fa-user"></i> ${authorHTML} | ` : ''}
                        ${postDate}
                    </div>
                </div>
            </article>`;
      }).join('');

      if (append) {
         container.querySelector('.articles')?.insertAdjacentHTML('beforeend', postsHTML);
      } else {
         container.innerHTML = `<div class="articles">${postsHTML}</div>`;
      }

      if (button) {
         button.innerText = "Wczytaj więcej";
         button.disabled = false;
         button.style.display = posts.length < perPage ? 'none' : 'block';

         button.onclick = () => WPArticleList(
            mainUrl,
            siteKey,
            type,
            search,
            categoryID,
            tagID,
            authorID,
            is_categories,
            is_author,
            is_image,
            true
         );
      }

   } catch (error) {
      console.error(error);
      container.innerHTML = 'Błąd ładowania artykułów.';
      if (button) button.style.display = 'none';
   }
}

async function WPArticlePostRSC(slug) {
   const container = document.getElementById('article-post');
   if (!container) return;

   const postsUrl = slug.startsWith('post-') ?
      `https://radiorsc.pl/wp-json/wp/v2/posts/${slug.slice(5)}?_embed=true` :
      `https://radiorsc.pl/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl);

   try {
      const response = await fetch(proxyUrl);
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
            authorDisplay = `<i class="fa-solid fa-user"></i> <a href="article-list?si=radiorsc&a=${embed.author[0].id}" target="_blank">${embed.author[0].name}</a> | `;
         }

         // 3. Kategorie
         let categoriesDisplay = '';
         if (embed['wp:term']?.[0]) {
            const catsHtml = embed['wp:term'][0]
               .map(cat => `<a href="article-list?si=radiorsc&c=${cat.id}" target="_blank">${cat.name}</a>`)
               .join(' • ');
            categoriesDisplay = `<div class="article_category_posts">${catsHtml}</div>`;
         }

         // 4. Tagi
         let tagsDisplay = '';
         if (embed['wp:term']?.[1]?.length > 0) {
            const tagsHtml = embed['wp:term'][1]
               .map(t => `<a href="article-list?si=radiorsc&t=${t.id}" target="_blank">${t.name}</a>`)
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
            imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl.replaceAll("https://radiorsc.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiorsc.pl/")}" alt="${media.alt_text || ''}"></div></div>`;
         }

         // 6. Pobieranie Audio (Player) - CZEKAMY NA WYNIK
         const playerHtml = await WPArticlePostRSCPlayer(post.link);

         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
         });

         return `
                <div class="articles_posts">
                    <article id="post-${post.id}">
                        <header class="article_headers_posts">
                            ${categoriesDisplay}
                            <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered || '{Brak tytułu}'}</a></div>
                            <div class="article_postedon_posts">${authorDisplay}${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        ${imageDisplay}
                        ${playerHtml}
                        <div class="article_singlecontent_posts">${post.content.rendered.replaceAll("https://radiorsc.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiorsc.pl/").replaceAll(/href="https:\/\/cors\.krdrt5370000ym2\.workers\.dev\/\?url=/g, 'href="')}</div>
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

async function WPArticlePostRLodz(slug) {
   const container = document.getElementById('article-post');
   if (!container) return;

   const postsUrl = slug.startsWith('post-') ?
      `https://radiolodz.pl/wp-json/wp/v2/posts/${slug.slice(5)}?_embed=true` :
      `https://radiolodz.pl/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl);

   try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Błąd API: ${response.status}`);

      let posts = await response.json();
      if (!Array.isArray(posts)) posts = [posts];

      if (posts.length === 0 || !posts[0].id) {
         container.innerHTML = "Brak dostępnych postów.";
         return;
      }

      const postPromises = posts.map(async (post) => {
         const embed = post._embedded || {};

         // 1. Tytuł
         const titleDoc = new DOMParser().parseFromString(post.title.rendered, 'text/html');
         const cleanTitle = titleDoc.body.textContent;
         document.title = `${cleanTitle} | krdrt537000ym.github.io`;

         // 2. Autorzy (Zaktualizowano: obsługa wielu autorów przez .map)
         let authorDisplay = '<i class="fa-solid fa-user"></i> Redakcja | ';
         if (post.authors && post.authors.length > 0) {
            const authorsLinks = post.authors.map(author =>
               `<a href="article-list?si=radiolodz&a=${author.term_id}" target="_blank">${author.display_name}</a>`
            ).join(', ');
            authorDisplay = `<i class="fa-solid fa-user"></i> ${authorsLinks} | `;
         }

         // 3. Kategorie
         let categoriesDisplay = '';
         if (embed['wp:term']?.[0]) {
            const catsHtml = embed['wp:term'][0]
               .map(cat => `<a href="article-list?si=radiolodz&c=${cat.id}" target="_blank">${cat.name}</a>`)
               .join(' • ');
            categoriesDisplay = `<div class="article_category_posts">${catsHtml}</div>`;
         }

         // 4. Tagi
         let tagsDisplay = '';
         if (embed['wp:term']?.[1]?.length > 0) {
            const tagsHtml = embed['wp:term'][1]
               .map(t => `<a href="article-list?si=radiolodz&t=${t.id}" target="_blank">${t.name}</a>`)
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
            imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl.replaceAll("https://radiolodz.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiolodz.pl/")}" alt="${media.alt_text || ''}"></div></div>`;
         }

         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
         });

         return `
                <div class="articles_posts">
                    <article id="post-${post.id}">
                        <header class="article_headers_posts">
                            ${categoriesDisplay}
                            <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered || '{Brak tytułu}'}</a></div>
                            <div class="article_postedon_posts">${authorDisplay}${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        ${imageDisplay}
                        <div class="article_singlecontent_posts">${post.content.rendered.replaceAll("https://radiolodz.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiolodz.pl/").replaceAll(/href="https:\/\/cors\.krdrt5370000ym2\.workers\.dev\/\?url=/g, 'href="')}</div>
                    </article>
                </div>`;
      });

      const results = await Promise.all(postPromises);
      container.innerHTML = results.join('');

   } catch (error) {
      console.error("Błąd WP API:", error);
      container.innerHTML = `<div class="error-msg">Nie udało się pobrać artykułu.</div>`;
   }
}

async function WPArticlePost(slug, mainUrl, is_categories = true, is_tags = true, is_author = true, is_image = true) {
   const container = document.getElementById('article-post');

   // Mapowanie URL na klucz strony (używane w linkach do list)
   const siteKeys = {
      'https://radiorsc.pl': 'radiorsc',
      'https://radiovictoria.pl': 'radiovictoria',
      'https://radiokolor.pl': 'radiokolor',
      'https://soswskierniewice.pl': 'sosw',
      'https://cekis.pl': 'ckis',
      'https://radiolodz.pl': 'radiolodz',
      'https://elradio.pl': 'elradio'
   };
   const currentSiteKey = siteKeys[mainUrl] || 'default';
   // Dodajemy _embed do URL
   const postsUrl = slug.startsWith('post-') ?
      `${mainUrl}/wp-json/wp/v2/posts/${slug.slice(5)}?_embed=true` :
      `${mainUrl}/wp-json/wp/v2/posts?slug=${slug}&per_page=1&_embed=true`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl);

   try {
      const response = await fetch(proxyUrl);
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
            const authorId = author.id;
            const authorSite = mainUrl === "https://radiovictoria.pl" ? author.link : `article-list?si=${currentSiteKey}&a=${authorId}`;
            // Tworzymy link do profilu autora
            authorDisplay = `
                    <i class="fa-solid fa-user"></i> 
                    <a href="${authorSite}" target="_blank">${authorName}</a> | `;
         } else {
            authorDisplay = `<i class="fa-solid fa-user"></i> Redakcja | `;
         }

         // Kategorie z _embedded (term[0])
         let categoriesDisplay = '';
         if (embed['wp:term'] && embed['wp:term'][0]) {
            const catsHtml = embed['wp:term'][0]
               .map(cat => `<a href="article-list?si=${currentSiteKey}&c=${cat.id}" target="_blank">${cat.name}</a>`)
               .join(' • ');

            categoriesDisplay = `<div class="article_category_posts">${catsHtml || 'Aktualności'}</div>`;
         }

         // Tagi z _embedded (term[1])
         let tagsDisplay = '';
         if (embed['wp:term'] && embed['wp:term'][1] && embed['wp:term'][1].length > 0) {
            const tagsHtml = embed['wp:term'][1]
               .map(t => `<a href="article-list?si=${currentSiteKey}&t=${t.id}" target="_blank">${t.name}</a>`)
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
               imageDisplay = `<div class="wp-site-blocks"><div class="post-thumbnail"><img src="${imgUrl.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl)}" alt="${media.alt_text || ''}"></div></div>`;
            }
         }

         const postDate = new Date(post.date).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
         });

         return `
                <div class="articles_posts">
                    <article id="post-${post.id}">
                        <header class="article_headers_posts">
                            ${categoriesDisplay}
                            <div class="article_title_posts"><a href="${post.link}" target="_blank">${post.title.rendered || '{Brak tytułu}'}</a></div>
                            <div class="article_postedon_posts">${authorDisplay}${postDate}</div>
                            ${tagsDisplay}
                        </header>
                        ${imageDisplay}
                        <div class="article_singlecontent_posts">${post.content.rendered.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl).replaceAll(/href="https:\/\/cors\.krdrt5370000ym2\.workers\.dev\/\?url=/g, 'href="')}</div>
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
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev?url=' + encodeURIComponent(targetUrl);
   // XPath celujący w kontener audio
   const xpath = "//div[contains(@class, 'custom-audio-block')]//audio/@src";

   try {
      const response = await fetch(proxyUrl, {
         headers: {
            'X-Requested-With': 'XMLHttpRequest'
         }
      });
      if (!response.ok) return '';

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Szukanie atrybutu src
      const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const audioNode = result.singleNodeValue;

      // .value pobiera treść atrybutu @src
      const audioSrc = audioNode ? audioNode.value.trim() : null;
      const extensions = [".mp3", ".wav", ".wma", ".ogg", ".m4a", ".flac", ".aiff", ".aac", ".ac3", ".caf", ".mpga", ".mpeg", ".mp4", ".oga", ".opus", ".aif", ".aifc"];

      if (audioSrc && extensions.some(ext => audioSrc.endsWith(ext))) {
         return `
                <div class="article_player_posts">
                    <small>Posłuchaj tutaj:</small><br>
                    <audio controls src="${audioSrc.replaceAll("https://radiorsc.pl/","https://cors.krdrt5370000ym2.workers.dev/?url=https://radiorsc.pl/")}"></audio>
                </div>`;
      }
      return '';
   } catch (e) {
      return '';
   }
}

async function fetchParentCategories(parentId, mainUrl) {
   const baseUrl = `${mainUrl}/wp-json/wp/v2/categories`;
   try {
      // Pobieramy listę kategorii raz (max 100)
      const response = await fetch(`${baseUrl}?per_page=100`);
      const allCats = await response.json();

      const resultIds = new Set([parseInt(parentId)]);

      // Znajdź dzieci
      const children = allCats.filter(c => c.parent === parseInt(parentId));
      children.forEach(c => {
         resultIds.add(c.id);
         // Znajdź wnuki dla każdego dziecka
         allCats.filter(gc => gc.parent === c.id).forEach(gc => resultIds.add(gc.id));
      });

      return Array.from(resultIds).join(',');
   } catch (e) {
      return parentId; // W razie błędu wróć do samego ID rodzica
   }
}

async function fetchParentCategoriesIn(parentId) {
   const baseUrl = `https://radiorsc.pl/wp-json/wp/v2/categories`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(baseUrl);
   try {
      // Pobieramy listę kategorii raz (max 100)
      const response = await fetch(`${proxyUrl}${encodeURIComponent(`?per_page=100`)}`);
      const allCats = await response.json();

      const resultIds = new Set([parseInt(parentId)]);

      // Znajdź dzieci
      const children = allCats.filter(c => c.parent === parseInt(parentId));
      children.forEach(c => {
         resultIds.add(c.id);
         // Znajdź wnuki dla każdego dziecka
         allCats.filter(gc => gc.parent === c.id).forEach(gc => resultIds.add(gc.id));
      });

      return Array.from(resultIds).join(',');
   } catch (e) {
      return parentId; // W razie błędu wróć do samego ID rodzica
   }
}

async function WPArticlePage(slug, mainUrl) {
   const container = document.getElementById('article-post');

   // Budowanie poprawnego URL (obsługa ID lub sluga)
   const postsUrl = slug.startsWith('page-') ?
      `${mainUrl}/wp-json/wp/v2/pages/${slug.slice(5)}?_embed=true` :
      `${mainUrl}/wp-json/wp/v2/pages?slug=${slug}&per_page=1&_embed=true`;
   const proxyUrl = 'https://cors.krdrt5370000ym2.workers.dev/?url=' + encodeURIComponent(postsUrl);

   try {
      const response = await fetch(proxyUrl);
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
      const imageHTML = featuredImage ? `<img src="${featuredImage.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl)}" class="article-image">` : '';

      // Generowanie HTML
      container.innerHTML = `
            <div class="articles_posts">
                <article id="page-${page.id}">
                    <header class="article_headers_posts">
                        <div class="article_title_posts">
                            <a href="${page.link}" target="_blank">${page.title.rendered || '{Brak tytułu}'}</a>
                        </div>
                    </header>
                    ${imageHTML}
                    <div class="article_singlecontent_posts">${page.content.rendered.replaceAll(mainUrl,"https://cors.krdrt5370000ym2.workers.dev/?url=" + mainUrl).replaceAll(/href="https:\/\/cors\.krdrt5370000ym2\.workers\.dev\/\?url=/g, 'href="')}</div>
                </article>
            </div>`;

   } catch (error) {
      console.error("Błąd WP API:", error);
      container.innerHTML = "Błąd podczas ładowania treści.";
   }
}
