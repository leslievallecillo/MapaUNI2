document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(function () {
        const loader = document.getElementById('loader-wrapper');
        if(loader) {
            loader.classList.add('loaded');
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 500);
            }, 400);
        }
    }, 1600);

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const heroContent = document.getElementById('hero-content');
    let requestRef;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        if(window.scrollY < window.innerHeight) {
            mouseX = (window.innerWidth / 2 - e.clientX) / 50;
            mouseY = (window.innerHeight / 2 - e.clientY) / 50;
        }
    });

    const animateHero = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        if(heroContent) {
            heroContent.style.transform = `translateZ(50px) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
        }
        requestRef = requestAnimationFrame(animateHero);
    };
    
    animateHero();

    document.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden-scroll');
    hiddenElements.forEach((el) => scrollObserver.observe(el));
});