(function () {
    "use strict";

    const params = new URLSearchParams(window.location.search);

    const site = params.get("si");
    const search = params.get("s") || "";
    const category = params.get("c") || "";
    const tag = params.get("t") || "";
    const author = params.get("a") || "";
    const type = params.get("tp") || "post";

    const siteMap = {
        radiorsc: { url: "https://radiorsc.pl", is_http: false },
        radiovictoria: { url: "https://radiovictoria.pl", is_http: false },
        radiokolor: { url: "https://radiokolor.pl", is_http: false },
        sosw: { url: "https://soswskierniewice.pl", is_http: false },
        ckis: { url: "https://cekis.pl", is_http: true }
    };

    const container = document.getElementById("article-post");

    function showError(msg) {
        if (container) container.innerHTML = msg;
    }

    // Walidacja site
    if (!site || !siteMap[site]) {
        showError("Błąd: Nieprawidłowe parametry URL.");
        return;
    }

    const { url: mainUrl, is_http } = siteMap[site];

    function init() {
        try {
            if (typeof window.WPArticleList === "function") {
                window.WPArticleList(
                    mainUrl,
                    site,
                    is_http,
                    type,
                    search,
                    category,
                    tag,
                    author
                );
            } else {
                throw new Error("Nie znaleziono funkcji WPArticleList.");
            }
        } catch (err) {
            console.error(err);
            showError("Błąd podczas ładowania modułu.");
        }
    }

    window.addEventListener("DOMContentLoaded", init);
})();
