
// ---------------------------------------------------------------
// Reveal animations & CGPA Ring
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-up');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // If this is the education card with the CGPA ring, animate the ring
                const ringFill = entry.target.querySelector('.ring-fill');
                if (ringFill) {
                    const value = parseFloat(ringFill.getAttribute('data-value'));
                    const max = parseFloat(ringFill.getAttribute('data-max'));
                    const r = ringFill.getAttribute('r');
                    const circumference = 2 * Math.PI * r;
                    const offset = circumference - (value / max) * circumference;
                    
                    setTimeout(() => {
                        ringFill.style.strokeDashoffset = offset;
                    }, 500); // delay to sync with card reveal
                }
                
                observer.unobserve(entry.target);
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
});
