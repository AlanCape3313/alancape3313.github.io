import {initCarousel} from './carousel.js';
import { initPanorama } from './panorama.js';

const buttons = document.querySelectorAll('.page-button');
const panelContainer = document.getElementById('page-container');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const routeName = button.textContent.trim()
        loadRoute(routeName);       // carga el HTML y CSS
        setActiveButton(button);    // marca el botón como presionado
    });
});

function setActiveButton(button) {
    buttons.forEach(b => b.disabled = false);
    button.disabled = true;
};

let currentRouteCSS;
function loadRoute(routeName) {
    //Load html of each page
    fetch(`/resources/routes/${routeName}/page.html`)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar la ruta');
            return response.text();
        })
        .then(html => {
            panelContainer.innerHTML = html;

            //Loads and Remove each CSS
            if (currentRouteCSS) {
                currentRouteCSS.remove();
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/resources/routes/${routeName}/stylePage.css`;
            document.head.appendChild(link);
            currentRouteCSS = link;

            if (routeName === `projects`) {
                initCarousel()
                initPanorama()
            }
        })
        .catch(err => {
            console.error(err);
            panelContainer.innerHTML = `<p>Failed to load content for "${routeName}"</p>`;
        });
};

//Load by default
if (buttons.length > 0) {
    const firstButton = buttons[0];
    loadRoute(firstButton.textContent.trim().toLowerCase());
    setActiveButton(firstButton);
}