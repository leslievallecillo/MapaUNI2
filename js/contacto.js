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

    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const nombre = form.querySelector('input[name="nombre"]').value.trim();
            const email = form.querySelector('input[name="email"]').value.trim();
            const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim();

            if (!nombre || !email || !mensaje) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor completa todos los campos del formulario.',
                    confirmButtonColor: '#0f2b6b'
                });
                return;
            }

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Mensaje enviado!',
                        text: 'Gracias por contactarnos. Te responderemos a la brevedad.',
                        confirmButtonColor: '#0f2b6b',
                        confirmButtonText: '¡Excelente!'
                    });
                    form.reset();
                } else {
                    throw new Error('Error al enviar el formulario');
                }
            })
            .catch(function(error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar',
                    text: 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.',
                    confirmButtonColor: '#0f2b6b'
                });
                console.error('Error:', error);
            });
        });
    }

    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(function(card, index) {
        card.style.transitionDelay = (index * 0.15) + 's';
        scrollObserver.observe(card);
    });

});