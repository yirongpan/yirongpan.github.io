const pages = document.querySelector('#pdf-pages');
const status = document.querySelector('#pdf-status');
const previous = document.querySelector('#pdf-prev');
const next = document.querySelector('#pdf-next');
const zoomOut = document.querySelector('#pdf-zoom-out');
const zoomIn = document.querySelector('#pdf-zoom-in');
const fit = document.querySelector('#pdf-fit');
const count = document.querySelector('#pdf-page-count');
let documentPdf, pageNumber = 1, zoom = 1, generation = 0;

async function render() {
  const current = ++generation;
  pages.setAttribute('aria-busy', 'true');
  try {
    const page = await documentPdf.getPage(pageNumber);
    const padding = parseFloat(getComputedStyle(pages).paddingLeft) * 2;
    const width = pages.clientWidth - padding;
    const viewport = page.getViewport({scale: width / page.getViewport({scale: 1}).width * zoom});
    const canvas = document.createElement('canvas');
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(viewport.width * pixelRatio);
    canvas.height = Math.ceil(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `CV page ${pageNumber}. Use Open PDF in a new tab to read the original document.`);
    await page.render({canvasContext: canvas.getContext('2d'), viewport,
      transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]}).promise;
    if (current !== generation) return;
    pages.replaceChildren(canvas);
    status.hidden = true;
    count.textContent = `Page ${pageNumber} / ${documentPdf.numPages}`;
    previous.disabled = pageNumber === 1;
    next.disabled = pageNumber === documentPdf.numPages;
    zoomOut.disabled = zoom <= 0.5;
    zoomIn.disabled = zoom >= 2;
    fit.disabled = false;
  } catch (error) {
    if (current !== generation) return;
    status.hidden = false;
    status.textContent = 'Preview could not load. Please open or download the PDF using the links above.';
    console.error(error);
  } finally {
    if (current === generation) pages.setAttribute('aria-busy', 'false');
  }
}

try {
  const pdfjs = await import('./vendor/pdfjs/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  documentPdf = await pdfjs.getDocument(new URL('./Yirong-Pan-CV.pdf', import.meta.url).href).promise;
  await render();
  previous.addEventListener('click', () => { if (pageNumber > 1) { pageNumber--; render(); } });
  next.addEventListener('click', () => { if (pageNumber < documentPdf.numPages) { pageNumber++; render(); } });
  zoomOut.addEventListener('click', () => { zoom = Math.max(0.5, zoom - 0.25); render(); });
  zoomIn.addEventListener('click', () => { zoom = Math.min(2, zoom + 0.25); render(); });
  fit.addEventListener('click', () => { zoom = 1; render(); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
} catch (error) {
  status.textContent = 'Preview could not load. Please open or download the PDF using the links above.';
  pages.setAttribute('aria-busy', 'false');
  console.error(error);
}
