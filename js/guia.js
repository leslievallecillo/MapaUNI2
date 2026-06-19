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

    const filtros = document.querySelectorAll('.btn-filtro');
    const cards = document.querySelectorAll('.carrera-card');

    filtros.forEach(function(filtro) {
        filtro.addEventListener('click', function() {
            filtros.forEach(function(f) {
                f.classList.remove('activo');
            });
            this.classList.add('activo');

            const categoria = this.dataset.filter;

            cards.forEach(function(card) {
                if (categoria === 'all' || card.dataset.category === categoria) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400);
                }
            });
        });
    });

    cards.forEach(function(card) {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    let datosFavoritos = [];

    fetch('Json/guia.json')
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar guia.json');
            return res.json();
        })
        .then(data => {
            datosFavoritos = data;
            renderizarFavoritos(data);
        })
        .catch(err => {
            console.error('Error cargando favoritos:', err);
            document.getElementById('recomendaciones-grid').innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 16px; display: block; color: #f39c12;"></i>
                    <p style="font-size: 1.1rem;">No se pudieron cargar los favoritos.</p>
                    <p style="font-size: 0.95rem;">Verifica que el archivo <strong>Json/guia.json</strong> exista.</p>
                </div>
            `;
        });

    function renderizarFavoritos(data) {
        const grid = document.getElementById('recomendaciones-grid');
        if (!grid) return;

        grid.innerHTML = data.map(item => `
            <div class="rec-card" onclick="abrirModalSmart('${item.id}')">
                <div class="rec-image" style="background-image: url('${item.imagen}'); background-size: cover; background-position: center;">
                    <div class="rec-image-overlay"></div>
                    <span class="rec-badge">Recomendado</span>
                    <div class="rec-pulse"></div>
                </div>
                <div class="rec-content">
                    <h3>${item.titulo}</h3>
                    <p class="rec-desc">${item.descripcion.substring(0, 80)}${item.descripcion.length > 80 ? '...' : ''}</p>
                    <p class="rec-recomendacion">${item.recomendacion}</p>
                    <span class="rec-explore">Explorar <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        `).join('');
    }

    window.abrirModalSmart = function(tipo) {
        const titulo = document.getElementById('smartTitle');
        const cuerpo = document.getElementById('smartBody');
        const lugar = datosFavoritos.find(item => item.id === tipo);

        if (!lugar) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró información de este lugar.',
                confirmButtonColor: '#0f2b6b'
            });
            return;
        }

        titulo.innerText = lugar.titulo;

        const resenasGuardadas = JSON.parse(localStorage.getItem('resenas_uniway')) || [];
        const resenasLugar = resenasGuardadas.filter(r => r.lugarId === tipo);

        let htmlResenas = '';
        if (resenasLugar.length > 0) {
            htmlResenas = resenasLugar.map(r => `
                <div style="background: #f1f3f5; padding: 12px 14px; border-radius: 10px; margin-bottom: 10px; text-align: left; border-left: 3px solid ${lugar.color};">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <strong style="color: var(--text-main); font-size: 14px;">${r.nombre}</strong>
                        <span style="color: #f39c12; font-size: 13px;">
                            ${'★'.repeat(Number(r.calificacion))}${'☆'.repeat(5 - Number(r.calificacion))}
                        </span>
                    </div>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #555;">${r.mensaje}</p>
                </div>
            `).join('');
        } else {
            htmlResenas = '<p style="font-size: 13px; color: #777; text-align: center; padding: 20px 0;">Aún no hay opiniones. ¡Sé el primero!</p>';
        }

        cuerpo.innerHTML = `
            <div class="contenedor-media-modal">
                <img src="${lugar.imagen}" class="imagen-lugar" alt="${lugar.titulo}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; background: linear-gradient(135deg, ${lugar.color}, ${lugar.color}dd); align-items: center; justify-content: center; color: #fff; font-size: 3rem;">
                    <i class="fa-solid fa-${lugar.icono}"></i>
                </div>
            </div>
            
            <div class="info-texto-modal">
                <h4 style="color: ${lugar.color};">Descripción</h4>
                <p>${lugar.descripcion}</p>
            </div>
            
            <div class="info-texto-modal">
                <h4 style="color: ${lugar.color};">Por qué lo recomendamos</h4>
                <p>${lugar.recomendacion}</p>
            </div>

            <div style="margin-top: 16px;">
                <h4 style="color: var(--text-main); font-size: 15px; margin-bottom: 10px; border-bottom: 2px solid ${lugar.color}; padding-bottom: 6px; text-align: left;">Opiniones de Estudiantes</h4>
                <div id="contenedor-lista-resenas">
                    ${htmlResenas}
                </div>
            </div>

            <form id="form-comentarios" class="formulario-guia">
                <h4 style="text-align: center; margin-bottom: 12px; color: var(--text-main);">Añadir Reseña</h4>
                <label>Tu nombre:</label>
                <input type="text" name="nombre" placeholder="Ej. Juan Pérez" required>
                
                <label>Calificación:</label>
                <select name="calificacion" required>
                    <option value="" disabled selected>Seleccionar...</option>
                    <option value="5">Excelente</option>
                    <option value="4">Muy Bueno</option>
                    <option value="3">Bueno</option>
                    <option value="2">Regular</option>
                    <option value="1">Malo</option>
                </select>

                <label>Tu opinión:</label>
                <textarea name="mensaje" placeholder="Cuéntanos tu experiencia..." required></textarea>

                <button type="submit" class="btn-enviar-resena">Guardar Opinión</button>
            </form>
        `;

        const form = document.getElementById('form-comentarios');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(form);
                const nuevaResena = {
                    lugarId: tipo,
                    nombre: formData.get('nombre').trim(),
                    calificacion: formData.get('calificacion'),
                    mensaje: formData.get('mensaje').trim()
                };

                if (!nuevaResena.nombre || !nuevaResena.mensaje) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Campos incompletos',
                        text: 'Por favor completa todos los campos.',
                        confirmButtonColor: '#0f2b6b'
                    });
                    return;
                }

                const todasLasResenas = JSON.parse(localStorage.getItem('resenas_uniway')) || [];
                todasLasResenas.push(nuevaResena);
                localStorage.setItem('resenas_uniway', JSON.stringify(todasLasResenas));

                Swal.fire({
                    title: '¡Guardado!',
                    text: 'Tu comentario ha sido almacenado localmente.',
                    icon: 'success',
                    timer: 1800,
                    showConfirmButton: false
                }).then(() => {
                    abrirModalSmart(tipo);
                });
            });
        }

        document.getElementById('modalSmart').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.cerrarModalSmart = function() {
        document.getElementById('modalSmart').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.cerrarSimulacion = function() {
        document.getElementById('videoModal').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.mostrarCarreras = function(area, carreras) {
        const carrerasList = carreras.map(c => `<li><i class="fa-solid fa-check-circle" style="color: #4CAF50; margin-right: 10px;"></i>${c}</li>`).join('');

        Swal.fire({
            icon: 'info',
            title: `<span style="color: #0f2b6b;">${area}</span>`,
            html: `
                <div style="text-align: left; padding: 10px 0;">
                    <h4 style="color: #0f2b6b; margin-bottom: 15px; text-align: center;">Carreras disponibles</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${carrerasList}
                    </ul>
                </div>
            `,
            confirmButtonColor: '#0f2b6b',
            confirmButtonText: 'Cerrar'
        });
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalSmart = document.getElementById('modalSmart');
            const modalVideo = document.getElementById('videoModal');
            if (modalSmart && modalSmart.classList.contains('active')) {
                cerrarModalSmart();
            }
            if (modalVideo && modalVideo.classList.contains('active')) {
                cerrarSimulacion();
            }
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'modalSmart') cerrarModalSmart();
                if (this.id === 'videoModal') cerrarSimulacion();
            }
        });
    });

});