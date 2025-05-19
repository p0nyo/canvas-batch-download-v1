document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("pdfLinks", ({ pdfLinks }) => {
    const container = document.getElementById("pdf-list");

    console.log(pdfLinks);

    if (!pdfLinks || pdfLinks.length === 0) {
      container.textContent = "No PDFs found.";
      return;
    }

    pdfLinks.forEach(link => {
      const a = document.createElement("a");
      a.href = link;
      a.textContent = link.split("/").pop();
      a.target = "_blank";
      a.style.display = "block";
      container.appendChild(a);
    });
  });
});
