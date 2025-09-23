export function initPanorama() {
    const panorama = document.querySelector('.panorama');
    const container = document.querySelector('.panorama-container');

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let maxTranslate = 0;

    panorama.addEventListener('load', () => {
        maxTranslate = Math.max(panorama.offsetWidth - container.offsetWidth, 0);
    });

    // --- Desktop ---
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        startX = e.clientX;
        currentTranslate -= dx;
        currentTranslate = Math.max(0, Math.min(currentTranslate, maxTranslate));
        panorama.style.transform = `translateX(${-currentTranslate}px)`;
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    // --- Mobile ---
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        startX = e.touches[0].clientX;
        currentTranslate -= dx;
        currentTranslate = Math.max(0, Math.min(currentTranslate, maxTranslate));
        panorama.style.transform = `translateX(${-currentTranslate}px)`;
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });

    container.addEventListener('touchcancel', () => {
        isDragging = false;
    });
}