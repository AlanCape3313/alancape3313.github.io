export function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    let currentIndex = 0;

    slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(btn);
    });

    const indicators = Array.from(indicatorsContainer.querySelectorAll('button'));

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    function updateCarousel() {
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;

        indicators.forEach((btn, i) => {
            btn.disabled = i === currentIndex;
        });
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    updateCarousel();
}