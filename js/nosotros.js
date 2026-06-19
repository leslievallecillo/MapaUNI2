document.addEventListener('DOMContentLoaded', function() {

    setTimeout(function() {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.classList.add('loaded');
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 500);
            }, 400);
        }
    }, 1600);

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-scroll');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden-scroll');
    hiddenElements.forEach(function(el) {
        scrollObserver.observe(el);
    });

    const equipoContainer = document.getElementById('react-equipo-root');
    if (equipoContainer && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        const EquipoComponent = function() {
            const miembros = [
                {
                    nombre: "Luis Zelaya",
                    rol: "Desarrollador Full Stack",
                    descripcion: "Especialista en frontend y backend, apasionado por crear experiencias digitales fluidas.",
                    icono: "fa-solid fa-laptop-code"
                },
                {
                    nombre: "Leslie Vallecillo",
                    rol: "Desarrolladora Frontend",
                    descripcion: "Enfocada en la interfaz de usuario y la experiencia visual de la plataforma.",
                    icono: "fa-solid fa-palette"
                },
                {
                    nombre: "Uriel Palacios",
                    rol: "Desarrollador Backend",
                    descripcion: "Responsable de la lógica del servidor y la integración de datos en tiempo real.",
                    icono: "fa-solid fa-server"
                },
                {
                    nombre: "Erling Aleman",
                    rol: "Desarrollador",
                    descripcion: "Apasionado por el desarrollo web y la optimización de sistemas.",
                    icono: "fa-solid fa-code"
                },
                {
                    nombre: "Andrea Chavarria",
                    rol: "Diseñadora UI/UX",
                    descripcion: "Crea interfaces intuitivas y accesibles para toda la comunidad universitaria.",
                    icono: "fa-solid fa-pen-ruler"
                }
            ];

            return React.createElement(
                'div',
                { className: 'equipo-grid' },
                miembros.map(function(miembro, index) {
                    return React.createElement(
                        'div',
                        { 
                            className: 'member-card hidden-scroll',
                            key: index,
                            style: { transitionDelay: (index * 0.12) + 's' }
                        },
                        React.createElement(
                            'div',
                            { className: 'member-avatar' },
                            React.createElement('i', { className: miembro.icono })
                        ),
                        React.createElement('h3', null, miembro.nombre),
                        React.createElement('p', { className: 'member-role' }, miembro.rol),
                        React.createElement('p', { className: 'member-desc' }, miembro.descripcion)
                    );
                })
            );
        };

        const root = ReactDOM.createRoot(equipoContainer);
        root.render(React.createElement(EquipoComponent));

        setTimeout(function() {
            const memberCards = document.querySelectorAll('.member-card');
            memberCards.forEach(function(card) {
                scrollObserver.observe(card);
            });
        }, 100);
    }
});