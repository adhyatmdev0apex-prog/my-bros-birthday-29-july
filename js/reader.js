import * as pdfjsLib from "./pdfjs/pdf.mjs";
const pdfReader = {
    element: document.getElementById('pdfReader'),
    canvas: document.getElementById('pdfCanvas'),
    ctx: null,
    closeBtn: document.getElementById('pdfReaderClose'),
    prevBtn: document.getElementById('pdfReaderPrev'),
    nextBtn: document.getElementById('pdfReaderNext'),
    pageNumSpan: document.getElementById('pdfReaderPageNum'),
    loadingIndicator: null, // To be created dynamically

    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    pdfPath: 'assets/fonts/cache/internal/glyphmap/a7f0b91e/test.pdf',

    init() {
        console.log("Initializing pdfReader...");
        console.log("pdfjsLib:", pdfjsLib); // Verification as requested
        pdfjsLib.GlobalWorkerOptions.workerSrc = "./js/pdfjs/pdf.worker.mjs";

        if (this.pdfDoc) { // Already initialized
            console.log("pdfReader already initialized.");
            return;
        }

        if (!pdfjsLib) {
            console.error("PDF.js library (pdfjsLib) is not loaded. Cannot initialize pdfReader.");
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // The workerSrc property must be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdfjs/pdf.worker.mjs';
        console.log("PDF.js workerSrc set to:", pdfjsLib.GlobalWorkerOptions.workerSrc);

        this.addEventListeners();
        this.createLoadingIndicator();
        this.loadDocument();
    },

    createLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'pdf-loading-indicator';
        this.loadingIndicator.textContent = 'Loading page...';
        this.element.querySelector('.pdf-reader-content').appendChild(this.loadingIndicator);
    },

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('visible');
        }
    },

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('visible');
        }
    },

    addEventListeners() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.prevBtn.addEventListener('click', () => this.onPrevPage());
        this.nextBtn.addEventListener('click', () => this.onNextPage());

        window.addEventListener('keydown', (e) => {
            if (this.isOpen()) {
                if (e.key === 'ArrowLeft') this.onPrevPage();
                if (e.key === 'ArrowRight') this.onNextPage();
                if (e.key === 'Escape') this.close();
            }
        });

        // Swipe detection
        let touchstartX = 0;
        let touchendX = 0;

        this.canvas.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.canvas.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    },

    handleSwipe() {
        // Add a threshold to prevent accidental swipes
        if (touchendX < touchstartX - 50) { // Swiped left
            this.onNextPage();
        }
        if (touchendX > touchstartX + 50) { // Swiped right
            this.onPrevPage();
        }
    },

async loadDocument() {

    console.log("==================================");
    console.log("Loading PDF...");
    console.log("Path:", this.pdfPath);
    console.log("pdfjsLib:", pdfjsLib);

    this.showLoading();

    try {

        const res = await fetch(this.pdfPath);

        console.log("Fetch status:", res.status);

        if (!res.ok) {
            throw new Error("PDF not found");
        }

        const bytes = await res.arrayBuffer();

        console.log("Downloaded bytes:", bytes.byteLength);

        const loadingTask = pdfjsLib.getDocument({
            data: bytes
        });

        console.log("Loading task:", loadingTask);

        loadingTask.onProgress = (p) => {
            console.log("Progress:", p);
        };

        this.pdfDoc = await loadingTask.promise;

        console.log("SUCCESS");
        console.log(this.pdfDoc);

        this.hideLoading();

    } catch (err) {

        console.error("PDF ERROR:", err);

        this.hideLoading();

    }

},

renderPage(num) {

    this.pageRendering = true;
    this.pageNumSpan.textContent = "Loading...";
    this.showLoading();

    this.pdfDoc.getPage(num).then(page => {

        const container = document.querySelector(".pdf-reader-content");

        if (!container) return;

        // Original PDF page
        const viewport = page.getViewport({ scale: 1 });

        // Fit ONLY to width
        const scale =
            (container.clientWidth - 24) / viewport.width;

        const scaledViewport = page.getViewport({
            scale
        });

        // High-DPI rendering
        const outputScale = window.devicePixelRatio || 1;

        this.canvas.width =
            Math.floor(scaledViewport.width * outputScale);

        this.canvas.height =
            Math.floor(scaledViewport.height * outputScale);

        this.canvas.style.width =
            scaledViewport.width + "px";

        this.canvas.style.height =
            scaledViewport.height + "px";

        this.ctx.setTransform(
            outputScale,
            0,
            0,
            outputScale,
            0,
            0
        );

        const renderContext = {

            canvasContext: this.ctx,

            viewport: scaledViewport

        };

        page.render(renderContext).promise.then(() => {

            this.pageRendering = false;

            this.pageNumSpan.textContent =
                `${this.pageNum} / ${this.pdfDoc.numPages}`;

            this.hideLoading();

            if (this.pageNumPending !== null) {

                this.renderPage(this.pageNumPending);

                this.pageNumPending = null;

            }

        });

    });

},

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    },

    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    },

    onNextPage() {
        if (!this.pdfDoc || this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    },

    open() {
        this.init(); // Initialize if not already
        this.element.classList.remove('hidden');
        
        // Hide main app content
        const mainContent = document.getElementById("app");
        if(mainContent) mainContent.style.display = 'none';

        // Wait for CSS transition before rendering to get correct container size
        setTimeout(() => {
             if (this.pdfDoc) {
                this.renderPage(this.pageNum);
            } else {
                console.warn("PDF document not yet loaded when trying to open reader.");
                this.loadDocument(); // Try loading again if not ready
            }
        }, 50);
    },

    close() {
        this.element.classList.add('hidden');
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pageNumSpan.textContent = ''; // Clear page number display

        // Show main app content again
        const mainContent = document.getElementById("app");
        if(mainContent) mainContent.style.display = '';

        // Hide loading indicator
        this.hideLoading();
    },

    isOpen() {
        return !this.element.classList.contains('hidden');
    }
};

// This function should be called from js/scenes.js after successful authentication.
function openConfidentialDocument() {
    pdfReader.open();
}

// Expose pdfReader and openConfidentialDocument to the global scope
// so that other legacy scripts can access it.
window.pdfReader = pdfReader;
window.openConfidentialDocument = openConfidentialDocument;
