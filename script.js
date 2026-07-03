const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------
// Typing effect for hero role text
// ---------------------------------------------------------------
const roles = [
    "Python Developer",
    "Django Developer",
    "Backend Developer",
    "REST API Developer"
];

let roleIndex = 0;
let charIndex = 0;

function typeText(){

    const typing = document.getElementById("typing");
    if(!typing) return;

    let current = roles[roleIndex];

    typing.textContent = current.substring(0, charIndex);

    charIndex++;

    if(charIndex > current.length){
        setTimeout(()=>{
            charIndex = 0;
            roleIndex++;
            if(roleIndex >= roles.length){
                roleIndex = 0;
            }
        }, 1500);
    }

    setTimeout(typeText, 120);
}

typeText();

// ---------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------
const themeBtn = document.getElementById("theme-toggle");

if(themeBtn){
    themeBtn.addEventListener("click", ()=>{
        document.body.classList.toggle("light");
        const icon = themeBtn.querySelector("i");
        if(icon){
            icon.classList.toggle("fa-moon");
            icon.classList.toggle("fa-sun");
        }
    });
}

// ---------------------------------------------------------------
// EDUCATION SECTION — Scroll reveal + mouse-light spotlight
// ---------------------------------------------------------------
(function initEducationEffects(){

    const eduSection = document.querySelector(".education-section");
    if(!eduSection) return;

    const revealTargets = eduSection.querySelectorAll(".reveal-up");

    const revealObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.classList.add("in-view");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -60px 0px"
    });

    revealTargets.forEach(target => revealObserver.observe(target));

    if(prefersReducedMotion) return;

    eduSection.addEventListener("mousemove", (e)=>{
        const rect = eduSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        eduSection.style.setProperty("--mx", x + "%");
        eduSection.style.setProperty("--my", y + "%");
    });

    eduSection.addEventListener("mouseleave", ()=>{
        eduSection.style.setProperty("--mx", "50%");
        eduSection.style.setProperty("--my", "30%");
    });

})();

// ---------------------------------------------------------------
// Generic scroll reveal for other sections (fade-up on first view)
// ---------------------------------------------------------------
(function initGeneralReveal(){
    const targets = document.querySelectorAll(
        "#about .about-grid, #skills .skill-group, #projects .project-card, #contact .contact-card, #certificates .certificate-card"
    );
    if(!targets.length) return;

    targets.forEach(el=>{
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    const observer = new IntersectionObserver((entries)=>{
        entries.forEach((entry, i)=>{
            if(entry.isIntersecting){
                entry.target.style.transitionDelay = (i % 3) * 0.08 + "s";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(el => observer.observe(el));
})();

// ---------------------------------------------------------------
// Unified 3D tilt effect — applied to project, certificate & contact cards
// ---------------------------------------------------------------
(function initTilt(){
    if(prefersReducedMotion) return;
    if(window.matchMedia("(hover: none)").matches) return; // skip on touch devices

    const selectors = ".project-card, .certificate-card, .contact-card";
    const cards = document.querySelectorAll(selectors);

    cards.forEach(card=>{
        const maxTilt = 10;

        card.addEventListener("mousemove", e=>{
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * maxTilt;
            const rotateX = ((y / rect.height) - 0.5) * -maxTilt;

            card.style.transform = `
                perspective(1200px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
                scale(1.015)
            `;
        });

        card.addEventListener("mouseleave", ()=>{
            card.style.transform = "";
        });
    });
})();

// ---------------------------------------------------------------
// Theme switcher — persists choice via localStorage
// ---------------------------------------------------------------
(function initThemeSwitcher(){
    const root = document.documentElement;
    const toggleBtn = document.getElementById("themeToggleBtn");
    const panel = document.getElementById("themePanel");
    const swatches = document.querySelectorAll(".swatch");

    if(!toggleBtn || !panel || !swatches.length) return;

    const saved = localStorage.getItem("accentTheme") || "";
    if(saved){
        root.setAttribute("data-theme", saved);
    }
    swatches.forEach(s=>{
        s.classList.toggle("active", (s.getAttribute("data-theme") || "") === saved);
    });

    toggleBtn.addEventListener("click", ()=>{
        panel.classList.toggle("open");
    });

    document.addEventListener("click", (e)=>{
        if(!panel.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)){
            panel.classList.remove("open");
        }
    });

    swatches.forEach(swatch=>{
        swatch.addEventListener("click", ()=>{
            const theme = swatch.getAttribute("data-theme") || "";
            if(theme){
                root.setAttribute("data-theme", theme);
            }else{
                root.removeAttribute("data-theme");
            }
            localStorage.setItem("accentTheme", theme);
            swatches.forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
        });
    });
})();

// ---------------------------------------------------------------
// Custom cursor — glow dot + trailing ring
// ---------------------------------------------------------------
(function initCustomCursor(){
    if(prefersReducedMotion) return;
    if(window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if(!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener("mousemove", e=>{
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + "px";
        dot.style.top = mouseY + "px";
    });

    function animateRing(){
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = ringX + "px";
        ring.style.top = ringY + "px";
        requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = document.querySelectorAll(
        "a, button, .chip, .swatch, .project-card, .certificate-card, .contact-card"
    );
    hoverTargets.forEach(el=>{
        el.addEventListener("mouseenter", ()=> ring.classList.add("hovering"));
        el.addEventListener("mouseleave", ()=> ring.classList.remove("hovering"));
    });
})();

// ---------------------------------------------------------------
// Magnetic buttons
// ---------------------------------------------------------------
(function initMagneticButtons(){
    if(prefersReducedMotion) return;
    if(window.matchMedia("(hover: none)").matches) return;

    const buttons = document.querySelectorAll(".btn, .theme-toggle-btn, .back-to-top");

    buttons.forEach(btn=>{
        btn.addEventListener("mousemove", e=>{
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
        });
        btn.addEventListener("mouseleave", ()=>{
            btn.style.transform = "";
        });
    });
})();

// ---------------------------------------------------------------
// Hero aurora — subtle mouse-follow glow
// ---------------------------------------------------------------
(function initHeroAurora(){
    if(prefersReducedMotion) return;

    const hero = document.querySelector(".hero");
    if(!hero) return;

    hero.addEventListener("mousemove", e=>{
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--hx", x + "%");
        hero.style.setProperty("--hy", y + "%");
    });
})();

// ---------------------------------------------------------------
// Back to top button
// ---------------------------------------------------------------
(function initBackToTop(){
    const btn = document.querySelector(".back-to-top");
    if(!btn) return;

    window.addEventListener("scroll", ()=>{
        btn.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener("click", ()=>{
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
(function initScrollProgress(){
    const bar = document.querySelector(".scroll-progress");
    if(!bar) return;

    function updateBar(){
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateBar, { passive: true });
    updateBar();
})();

// ---------------------------------------------------------------
// Count-up stats
// ---------------------------------------------------------------
(function initStatCounters(){
    const stats = document.querySelectorAll(".stat-num");
    if(!stats.length) return;

    function animateCount(el){
        const target = parseFloat(el.getAttribute("data-count"));
        const isDecimal = el.getAttribute("data-decimal") === "true";
        const duration = 1400;
        const start = performance.now();

        if(prefersReducedMotion){
            el.textContent = isDecimal ? target.toFixed(2) : target;
            return;
        }

        function tick(now){
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = isDecimal ? value.toFixed(2) : Math.round(value);
            if(progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.closest(".stat-item").classList.add("in-view");
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    stats.forEach(el => observer.observe(el));
})();