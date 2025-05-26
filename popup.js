document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pdf-list");
  const selectAllCheckbox = document.getElementById("select-all");
  const downloadBtn = document.getElementById("download-zip");

  chrome.storage.local.get("pdfLinks", ({ pdfLinks }) => {
    if (!pdfLinks || pdfLinks.length === 0) {
      container.textContent = "No PDFs found.";
      return;
    }

    pdfLinks.forEach((link, index) => {
      const wrapper = document.createElement("div");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "pdf-checkbox";
      checkbox.dataset.index = index;

      const a = document.createElement("a");
      a.href = link.url;
      a.textContent = link.text.replace(/^Download\s*/, "");
      a.target = "_blank";
      a.style.marginLeft = "8px";

      wrapper.appendChild(checkbox);
      wrapper.appendChild(a);
      container.appendChild(wrapper);
    });

    // Toggle all checkboxes
    selectAllCheckbox.addEventListener("change", () => {
      const checkboxes = container.querySelectorAll(".pdf-checkbox");
      checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    });

    // Download selected PDFs as ZIP
    downloadBtn.addEventListener("click", async () => {
        const checkboxes = container.querySelectorAll(".pdf-checkbox:checked");
        if (checkboxes.length === 0) {
            alert("No PDFs selected.");
            return;
        }

        const zip = new JSZip();

        for (const cb of checkboxes) {
          console.log(cb);
          const idx = cb.dataset.index;
          const { url, text } = pdfLinks[idx];

          try {
            console.log(url);
            const res = await fetch(url, { credentials: "include" });
            const blob = await res.blob();
            const cleanName = text.replace(/^Download\s*/, "").replace(/[^a-z0-9.\-_\s]/gi, "_") || `file${idx}.pdf`;
            zip.file(cleanName, blob);
          } catch (err) {
            console.error("Failed to fetch:", url, err);
          }
        }


        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "canvas_batch_download.zip");
    });
  });
});
