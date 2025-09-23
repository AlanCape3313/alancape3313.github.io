const buttons = document.querySelectorAll('.page-button');
const panelContainer = document.getElementById('page-container');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const routeName = button.textContent.trim().toLowerCase();
        loadRoute(routeName);       // carga el HTML y CSS
        setActiveButton(button);    // marca el botón como presionado
    });
});

function setActiveButton(button) {
    buttons.forEach(b => b.disabled = false); // desbloquea todos
    button.disabled = true; // desactiva el presionado
}
function loadRoute(routeName) {
    //Load html of each page
    fetch(`resources/routes/${routeName}/index.html`)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar la ruta');
            return response.text();
        })
        .then(html => {
            panelContainer.innerHTML = html;

            // Load .css of each page
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `routes/${routeName}/style.css`;
            document.head.appendChild(link);
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