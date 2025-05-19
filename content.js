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
    const moduleUrls = Array.from(anchors).map((a) => 
        new URL(a.getAttribute('href'), window.location.origin).toString()
    );
    return moduleUrls
}

async function fetchModulePages(urls) {
  const fetches = urls.map(async (url) => {
    try {
      const res = await fetch(url, { credentials: "include" });
      const text = await res.text();
      return { url, html: text };
    } catch (err) {
      console.error(`Error fetching ${url}`, err);
      return null;
    }
  });

  const results = await Promise.all(fetches);
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
        const pdfUrl = new URL(anchor.getAttribute("href"), baseUrl).toString();
        return pdfUrl;
    }

    return null;
}


// Targets custom canvas domain names and default instructure domain names
if (isCanvasCoursePage()) {
    console.log("WORKING!")
}   

(async () => {
    const moduleUrls = await getModuleItemLinks();
    const modulePages = await fetchModulePages(moduleUrls); 

    const pdfLinks = modulePages
        .map(({ url, html }) => extractPdfLinkFromHTML(html, url))
        .filter((link) => link !== null);

    console.log("Found PDF Links:", pdfLinks);
})();

chrome.storage.local.set({ pdfLinks: linksArray });



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