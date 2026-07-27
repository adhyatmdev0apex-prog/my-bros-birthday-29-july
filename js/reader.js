const pdfReader = {
    element: document.getElementById('pdfReader'),
    canvas: document.getElementById('pdfCanvas'),
    closeBtn: document.getElementById('pdfReaderClose'),
    prevBtn: document.getElementById('pdfReaderPrev'),
    nextBtn: document.getElementById('pdfReaderNext'),
    pageNumSpan: document.getElementById('pdfReaderPageNum'),

    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    pdfPath: 'assets/fonts/.cache/.internal/.glyphmap/a7f0b91e/test.pdf',

    init() {
        if (this.pdfDoc) { // Already initialized
            return;
        }

        // The workerSrc property must be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        this.addEventListeners();
        this.loadDocument();
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

        this.element.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.element.addEventListener('touchend', e => {
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

    loadDocument() {
        const loadingTask = pdfjsLib.getDocument(this.pdfPath);
        loadingTask.promise.then(pdfDoc_ => {
            this.pdfDoc = pdfDoc_;
            // Initial render is triggered by open()
        }).catch(error => {
            console.error('Error loading PDF:', error);
            if(this.pageNumSpan) this.pageNumSpan.textContent = 'Error';
        });
    },

    renderPage(num) {
        this.pageRendering = true;
        this.pageNumSpan.textContent = 'Loading...';

        this.pdfDoc.getPage(num).then(page => {
            const container = this.canvas.parentElement;
            if (!container) return;
            
            const viewport = page.getViewport({ scale: 1 });

            // Fit page to container, with some padding
            const scale = Math.min(
                container.clientWidth / viewport.width,
                container.clientHeight / viewport.height
            ) * 0.95; // Use 95% of the container space
            
            const scaledViewport = page.getViewport({ scale });

            this.canvas.height = scaledViewport.height;
            this.canvas.width = scaledViewport.width;

            const renderContext = {
                canvasContext: this.canvas.getContext('2d'),
                viewport: scaledViewport
            };

            const renderTask = page.render(renderContext);
            renderTask.promise.then(() => {
                this.pageRendering = false;
                this.pageNumSpan.textContent = `${this.pageNum} / ${this.pdfDoc.numPages}`;

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
        
        // Wait for CSS transition before rendering to get correct container size
        setTimeout(() => {
             if (this.pdfDoc) {
                this.renderPage(this.pageNum);
            }
        }, 50);
    },

    close() {
        this.element.classList.add('hidden');
    },

    isOpen() {
        return !this.element.classList.contains('hidden');
    }
};

// This function should be called from js/scenes.js after successful authentication.
function openConfidentialDocument() {
    pdfReader.open();
}