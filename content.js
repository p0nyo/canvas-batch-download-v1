function isCanvasCoursePage() {
    const isCanvasHost =
      location.hostname.includes("canvas") ||
      location.hostname.includes("instructure");
  
    // const isCourseSubpage = location.pathname.includes("/courses/");
    const isCourseSubpage = location.pathname.match(/^\/courses\/\d+\/modules/);

  
    return isCanvasHost && isCourseSubpage;
}
// Targets custom canvas domain names and default instructure domain names
if (isCanvasCoursePage()) {
    console.log("WORKING!")
}


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