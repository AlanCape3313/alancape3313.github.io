export function initCarousel() {
    console.log(`adwas`)
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');

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
    });
}