function isCanvasCoursePage() {
    const isCanvasHost =
      location.hostname.includes("canvas") ||
      location.hostname.includes("instructure");
  
    // const isCourseSubpage = location.pathname.includes("/courses/");
    const isCourseSubpage = location.pathname.match(/^\/courses\/\d+\/modules/);

  
    return isCanvasHost && isCourseSubpage;
}

async function getModuleItemLinks() {
    const anchors = document.querySelectorAll('a.ig-title.title.item_link');
    
    const moduleItems = Array.from(anchors).map((a) => ({
        url: new URL(a.getAttribute('href'), window.location.origin).toString(),
        text: a.textContent.trim()
    }));

    return moduleItems;
}


async function fetchModulePagesWithLimit(urls, limit = 5) {
    const results = [];
    let index = 0;

    async function worker() {
        while (index < urls.length) {
        const currentIndex = index++;
        const url = urls[currentIndex];

        try {
            const res = await fetch(url, { credentials: "include" });
            const text = await res.text();
            results[currentIndex] = { url, html: text };
        } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            results[currentIndex] = null;
        }
        }
    }

    const workers = Array.from({ length: limit }, () => worker());
    await Promise.all(workers);

    return results.filter(Boolean);
}


function extractPdfLinkFromHTML(html, baseUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let anchor = doc.querySelector('a[download]');

    if (!anchor) {
        anchor = Array.from(doc.querySelectorAll("a")).find((a) => 
            a.href.endsWith(".pdf")
        );
    }

    if (anchor) {
        const href = anchor.getAttribute("href");
        const pdfUrl = new URL(href, baseUrl).toString();
        return pdfUrl;
    }

    return null;
}


window.addEventListener("load", () => {
  chrome.storage.local.clear(() => {
    console.log("Extension storage cleared on page reload");
  });
});

// Targets custom canvas domain names and default instructure domain names
if (isCanvasCoursePage()) {
    console.log("WORKING!")
}   

(async () => {
    const moduleItems = await getModuleItemLinks(); // now contains { url, text }
    console.log(moduleItems);

    const modulePages = await fetchModulePagesWithLimit(moduleItems.map(item => item.url), 30);

    const pdfLinks = modulePages
        .map(({ html, url }, index) => {
            const pdfUrl = extractPdfLinkFromHTML(html, url);
            if (!pdfUrl) return null;

            const text = moduleItems[index].text;
            return { text, url: pdfUrl };
        })
        .filter(link => link !== null);

    console.log("Found PDF Links:", pdfLinks);
    chrome.storage.local.set({ pdfLinks });
})();





{/* 
    <span class="item_name">
    <a title="Whārangi kāinga | Home Page" class="ig-title title item_link" href="/courses/120717/modules/items/2352694">
        Whārangi kāinga | Home Page
    </a> 
    </span>    


    1. find <a> tag with this class name: ig-title title item_link 

    2. for each of these items check the href and go to URL + href

    3. for each of these URLs, check for an <a> tag with a download="true"

    4. if found, store href in the google local store

    5. use a pdf reader module to view it in the extension popup

    6. give users chance to select which pdfs they want

    7. batch download pdfs to a zip file 
*/}