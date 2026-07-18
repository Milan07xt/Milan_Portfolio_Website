const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------
// Typing effect for hero role text
// ---------------------------------------------------------------
const roles = [
    "Python Developer",
    "Django Backend Developer",
    "REST API Engineer",
    "AI/ML Enthusiast",
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
// RESUME SECTION — Scroll reveal + mouse-light spotlight
// ---------------------------------------------------------------
(function initResumeEffects(){

    const resumeSection = document.querySelector(".resume-section");
    if(!resumeSection) return;

    const revealTargets = resumeSection.querySelectorAll(".reveal-up");

    const revealObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.classList.add("in-view");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px"
    });

    revealTargets.forEach(target => revealObserver.observe(target));

    if(prefersReducedMotion) return;

    resumeSection.addEventListener("mousemove", (e)=>{
        const rect = resumeSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        resumeSection.style.setProperty("--mx", x + "%");
        resumeSection.style.setProperty("--my", y + "%");
    });

    resumeSection.addEventListener("mouseleave", ()=>{
        resumeSection.style.setProperty("--mx", "50%");
        resumeSection.style.setProperty("--my", "40%");
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
    }, { threshold: 0.1 });

    stats.forEach(el => observer.observe(el));
})();

// ---------------------------------------------------------------
// Contact form submission
// ---------------------------------------------------------------
(function initContactForm(){
    const form = document.getElementById('contactForm');
    const statusEl = document.getElementById('formStatus');
    const successModal = document.getElementById("contactSuccessModal");
    const successCloseBtn = document.getElementById("successCloseBtn");
    
    if(!form) return;

    function showContactSuccessModal() {
        if (!successModal) return;
        successModal.classList.add("open");
        document.body.style.overflow = "hidden";
        setTimeout(closeSuccessModal, 4000);
    }
    
    function closeSuccessModal() {
        if (successModal) successModal.classList.remove("open");
        document.body.style.overflow = "";
    }

    if (successCloseBtn) {
        successCloseBtn.addEventListener("click", closeSuccessModal);
    }
    if (successModal) {
        successModal.addEventListener("click", (e) => {
            if (e.target === successModal) closeSuccessModal();
        });
    }

    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            number: form.number.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        statusEl.textContent = 'Sending...';

        try{
            const res = await fetch('http://localhost:3000/submit-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(res.ok){
                statusEl.textContent = '';
                form.reset();
                showContactSuccessModal();
            }else{
                const txt = await res.text();
                statusEl.textContent = 'Error: ' + (txt || res.statusText);
            }
        }catch(err){
            statusEl.textContent = 'Network error — is the server running?';
            console.error(err);
        }finally{
            submitBtn.disabled = false;
            setTimeout(()=> {
                if (statusEl.textContent.indexOf('Sending') === -1) {
                    statusEl.textContent = '';
                }
            }, 5000);
        }
    });
})();

// ---------------------------------------------------------------
// 3D tilt for contact form card specifically
// ---------------------------------------------------------------
(function initContactTilt(){
    if(prefersReducedMotion) return;
    if(window.matchMedia('(hover: none)').matches) return;

    const formWrap = document.querySelector('.contact-form-wrap');
    if(!formWrap) return;

    // stronger tilt for the contact card
    const maxTilt = 12;
    formWrap.addEventListener('mousemove', e=>{
        const rect = formWrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * maxTilt;
        const rotateX = ((y / rect.height) - 0.5) * -maxTilt;
        formWrap.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        formWrap.style.boxShadow = `0 30px 80px rgba(0,0,0,0.45), 0 0 40px rgba(${getComputedStyle(document.documentElement).getPropertyValue('--amber-rgb')},0.06)`;
        // subtle parallax for inner inputs
        const inputs = formWrap.querySelectorAll('input, textarea, label, .btn');
        inputs.forEach((el, i)=>{
            const depth = (i % 4) * 0.6; // slight depth variation
            const moveX = ((x / rect.width) - 0.5) * (maxTilt * 0.6) * (depth / 2);
            const moveY = ((y / rect.height) - 0.5) * (maxTilt * 0.3) * (depth / 2);
            el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
    });
    formWrap.addEventListener('mouseleave', ()=>{
        formWrap.style.transform = '';
        formWrap.style.boxShadow = '';
        const inputs = formWrap.querySelectorAll('input, textarea, label, .btn');
        inputs.forEach(el=> el.style.transform = '');
    });
})();

// ---------------------------------------------------------------
// ScrollSpy Navigation
// ---------------------------------------------------------------
(function initScrollSpy() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: "-20% 0px -60% 0px"
    });

    sections.forEach(section => observer.observe(section));
})();

// ---------------------------------------------------------------
// Canvas Particle Network Background
// ---------------------------------------------------------------
(function initParticleNetwork() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    
    // Config
    const PARTICLE_COUNT = 50;
    const CONNECT_DISTANCE = 120;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || "#e3a83b";
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = 1 - (dist / CONNECT_DISTANCE);
                    const colorStr = getComputedStyle(document.documentElement).getPropertyValue('--amber-rgb').trim() || "227,168,59";
                    ctx.strokeStyle = `rgba(${colorStr}, ${alpha * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===============================================================
// INTERACTIVE PORTFOLIO FEATURES
// ===============================================================

// 1. Terminal Tab Switching
(function initTerminalTabs() {
    const tabs = document.querySelectorAll(".term-tab");
    const contents = document.querySelectorAll(".terminal-tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");
            
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            contents.forEach(c => {
                c.classList.remove("active");
                if (c.getAttribute("id") === `tab-${target}`) {
                    c.classList.add("active");
                }
            });

            if (target === "cli") {
                const input = document.getElementById("terminal-cli-input");
                if (input) input.focus();
            }
        });
    });
})();

// 2. CLI Command Prompt
(function initTerminalCLI() {
    const input = document.getElementById("terminal-cli-input");
    const output = document.getElementById("cli-output");
    if (!input || !output) return;

    const commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: () => `
Available commands:
  <span class="accent">help</span>             - Show list of available commands
  <span class="accent">about</span>            - Info about Milan Rathod
  <span class="accent">skills</span>           - List developer technical skills
  <span class="accent">projects</span>         - Brief listing of Milan's projects
  <span class="accent">certificates</span>     - View certifications
  <span class="accent">contact</span>          - Contact email and phone number
  <span class="accent">download-resume</span>  - Trigger resume file download
  <span class="accent">clear</span>            - Clear screen
  <span class="accent">hack-mode</span>        - Toggle retro cybersecurity green theme
`,
        about: () => `
Milan Rathod is a B.ScIT graduate (Class of 2026) specializing in backend systems (Python/Django) and computer-vision toolings (OpenCV).
Currently looking for a fresher developer role.
`,
        skills: () => `
Technical Skills:
  - Languages  : Python, JavaScript, SQL, HTML5, CSS3
  - Frameworks : Django, Django REST Framework (DRF)
  - Databases  : SQLite3, MySQL
  - Vision/ML  : OpenCV (Face recognition, image processing)
  - Tools      : Git, GitHub, VS Code
`,
        projects: () => `
Featured Projects:
  1. <span class="accent">Face Attendance System</span> - OpenCV + Django REST API face logging.
  2. <span class="accent">Gym Management System</span> - Membership tracking with Django & SQL.
  3. <span class="accent">Hotel Website</span> - Modern responsive booking site.
Type "projects [number]" or click on cards below for full case-studies!
`,
        certificates: () => `
Certifications:
  - NASSCOM: Information Security Analyst, Network Security Engineer, IoT Security Analyst
  - Forage: Tata Cybersecurity Analyst Job Simulation
  - Udemy: AI DevOps Analyst, Windows Command Mastery, Microsoft Copilot
`,
        contact: () => `
Contact Details:
  - Email : <a href="mailto:rathodmilan216@gmail.com" class="accent">rathodmilan216@gmail.com</a>
  - Phone : +91 9327599254
  - Place : Junagadh, Gujarat, India
`,
        "download-resume": () => {
            const link = document.createElement('a');
            link.href = 'resume/Milankumar_Rathod_Resume 03 (1).pdf';
            link.download = 'Milankumar_Rathod_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return "Downloading resume PDF...";
        },
        clear: () => {
            output.innerHTML = '';
            return '';
        },
        "hack-mode": () => {
            document.body.classList.toggle("hack-theme");
            const isHack = document.body.classList.contains("hack-theme");
            return isHack 
                ? "<span style='color:#3ddc84;'>CYBERSECURITY HACK MODE INITIATED. Theme accent colors overridden.</span>" 
                : "Cybersecurity theme disabled. Standard accent colors restored.";
        }
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const value = input.value.trim();
            input.value = "";
            if (!value) return;

            const cmdRow = document.createElement("div");
            cmdRow.className = "cli-row";
            cmdRow.innerHTML = `<span class="cli-prompt">milan@portfolio:~$</span> ${escapeHTML(value)}`;
            output.appendChild(cmdRow);

            commandHistory.push(value);
            historyIndex = commandHistory.length;

            const cmdParts = value.split(" ");
            const mainCmd = cmdParts[0].toLowerCase();
            
            let response = "";
            if (commands[mainCmd]) {
                response = commands[mainCmd]();
            } else if (mainCmd === "neofetch") {
                response = `
   /\\_/\\
  ( o.o )
   > ^ <
  MILAN-OS
--------------------
OS: Ubuntu 22.04 LTS (Local)
Shell: zsh / bash
Stack: Python, Django, DRF, SQL
Role: Backend / CV Fresher
`;
            } else {
                response = `Command not found: '${escapeHTML(mainCmd)}'. Type 'help' to see list of valid commands.`;
            }

            if (response) {
                const respRow = document.createElement("div");
                respRow.className = "cli-row";
                respRow.innerHTML = response.trim().replace(/\n/g, "<br>");
                output.appendChild(respRow);
            }

            output.scrollTop = output.scrollHeight;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = "";
            }
        }
    });

    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
})();

// 3. OpenCV webcam scanning HUD simulator
(function initOpenCVSimulator() {
    const canvas = document.getElementById("scanner-canvas");
    const video = document.getElementById("webcam-feed");
    const toggleBtn = document.getElementById("toggle-camera-btn");
    if (!canvas || !toggleBtn || !video) return;

    const ctx = canvas.getContext("2d");
    let isStreaming = false;
    let localStream = null;
    let scanY = 0;
    let scanDirection = 1;
    let detectedBoxes = [];
    let animationId = null;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth || 300;
        canvas.height = canvas.offsetHeight || 250;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    drawStaticHUD();

    toggleBtn.addEventListener("click", async () => {
        if (isStreaming) {
            stopCamera();
        } else {
            await startCamera();
        }
    });

    function stopCamera() {
        isStreaming = false;
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        video.srcObject = null;
        cancelAnimationFrame(animationId);
        toggleBtn.innerHTML = `<i class="fa-solid fa-video"></i> Start Camera`;
        drawStaticHUD();
    }

    async function startCamera() {
        toggleBtn.innerHTML = `Connecting...`;
        try {
            const constraints = { video: { width: 640, height: 480 }, audio: false };
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = localStream;
            video.onloadedmetadata = () => {
                video.play();
                isStreaming = true;
                toggleBtn.innerHTML = `<i class="fa-solid fa-video-slash"></i> Stop Camera`;
                
                detectedBoxes = [
                    { x: 0.3, y: 0.2, w: 0.4, h: 0.55, label: "FACE: GUEST", confidence: 99.1 }
                ];
                
                animateScanner();
            };
        } catch (err) {
            console.warn("Webcam access failed. Falling back to synthetic simulation mode.", err);
            isStreaming = true;
            toggleBtn.innerHTML = `<i class="fa-solid fa-video-slash"></i> Stop Scanner`;
            detectedBoxes = [
                { x: 0.35, y: 0.2, w: 0.3, h: 0.45, label: "FACE: SCANNING", confidence: 94.2 }
            ];
            animateScanner();
        }
    }

    function drawStaticHUD() {
        ctx.fillStyle = "#020408";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = "rgba(227, 168, 59, 0.2)";
        ctx.lineWidth = 1;
        const grid = 20;
        for(let i = 0; i < canvas.width; i += grid) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for(let i = 0; i < canvas.height; i += grid) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || "#e3a83b";
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillText("OPENCV SCAN ENGINE [OFFLINE]", 15, 25);
        ctx.fillText("CLICK 'START CAMERA' TO ACTIVATE", 15, 45);
        
        drawCorners(0, 0, canvas.width, canvas.height, "rgba(227, 168, 59, 0.4)");
    }

    function drawCorners(x, y, w, h, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        const len = 12;
        
        ctx.beginPath(); ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len); ctx.stroke();
    }

    function animateScanner() {
        if (!isStreaming) return;

        if (localStream && video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#040810";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.strokeStyle = "rgba(61, 220, 132, 0.1)";
            ctx.lineWidth = 1;
            const grid = 24;
            for(let i = 0; i < canvas.width; i += grid) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for(let i = 0; i < canvas.height; i += grid) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            ctx.fillStyle = "rgba(61, 220, 132, 0.12)";
            ctx.beginPath();
            ctx.arc(canvas.width * 0.5, canvas.height * 0.42, 40, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(canvas.width * 0.5, canvas.height * 0.9, 70, 50, 0, Math.PI, 0);
            ctx.fill();
        }

        const colorStr = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || "#e3a83b";
        const colorRGB = getComputedStyle(document.documentElement).getPropertyValue('--amber-rgb').trim() || "227,168,59";

        detectedBoxes.forEach(box => {
            const bx = box.x * canvas.width;
            const by = box.y * canvas.height;
            const bw = box.w * canvas.width;
            const bh = box.h * canvas.height;

            ctx.strokeStyle = `rgba(${colorRGB}, 0.8)`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx, by, bw, bh);

            drawCorners(bx, by, bw, bh, `rgb(${colorRGB})`);

            ctx.fillStyle = "#3ddc84";
            const eyeY = by + bh * 0.35;
            const noseY = by + bh * 0.55;
            const mouthY = by + bh * 0.75;
            
            ctx.beginPath(); ctx.arc(bx + bw * 0.3, eyeY, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(bx + bw * 0.7, eyeY, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(bx + bw * 0.5, noseY, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(bx + bw * 0.35, mouthY, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(bx + bw * 0.65, mouthY, 3, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = `rgba(${colorRGB}, 0.85)`;
            ctx.fillRect(bx, by - 20, bw, 20);
            ctx.fillStyle = "#17130a";
            ctx.font = "bold 9px 'JetBrains Mono', monospace";
            ctx.fillText(`${box.label} (${box.confidence}%)`, bx + 5, by - 6);
        });

        scanY += 2 * scanDirection;
        if (scanY > canvas.height || scanY < 0) {
            scanDirection *= -1;
        }
        
        ctx.strokeStyle = `rgba(${colorRGB}, 0.6)`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
        
        const gradient = ctx.createLinearGradient(0, scanY - 8 * scanDirection, 0, scanY);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, `rgba(${colorRGB}, 0.15)`);
        ctx.fillStyle = gradient;
        if (scanDirection > 0) {
            ctx.fillRect(0, scanY - 30, canvas.width, 30);
        } else {
            ctx.fillRect(0, scanY, canvas.width, 30);
        }

        ctx.fillStyle = `rgb(${colorRGB})`;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(`FPS: 30`, 12, 20);
        ctx.fillText(`API: DRF / OPEN-CV ACTIVE`, 12, 34);
        ctx.fillText(`STREAM: RAW_RGB`, 12, 48);

        const rx = canvas.width - 35;
        const ry = 35;
        const rr = 20;
        ctx.strokeStyle = `rgba(${colorRGB}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ry, rr*0.5, 0, Math.PI*2); ctx.stroke();
        
        const angle = (Date.now() / 450) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(angle) * rr, ry + Math.sin(angle) * rr);
        ctx.stroke();

        animationId = requestAnimationFrame(animateScanner);
    }
})();

// 4. Project Case Studies details modal controller
(function initProjectModals() {
    const modal = document.getElementById("projectModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    if (!modal || !closeBtn) return;

    const projectData = {
        "face recognition attendance system": {
            title: "Face Recognition Attendance System",
            category: "Python / Django / OpenCV / SQLite",
            desc: `
                <div class="case-study-block">
                    <p style="margin-bottom: 12px;"><strong>Problem & Motivation:</strong> Traditional attendance tracking via paper rolls or ID card swipes is slow, error-prone, and prone to proxy attendance. For modern workplaces or academic institutions, a contactless, high-speed, and secure logging system is required.</p>
                    <p><strong>Proposed Solution:</strong> Built an automated real-time biometric tracking solution. By combining computer vision pipelines (OpenCV Haar Cascades/deep embeddings) with a robust Django REST API backend, the system scans video feeds, recognizes student face templates instantly, and logs check-ins directly into a secure SQLite database.</p>
                </div>
            `,
            features: [
                "Real-time face detection and recognition using Haar Cascades and deep learning-based embeddings.",
                "Custom Django REST framework APIs to receive attendance records from edge device scanners.",
                "Admin panel with analytics for logs, exports to CSV, and student registration.",
                "SQLite3 backend configured with optimal indexes for speedy lookup queries."
            ],
            architecture: `
SQLite Database:
  - Table: Students (ID, Name, FaceDataBlob, CreatedAt)
  - Table: AttendanceLog (LogID, StudentID, Timestamp, DeviceID)

API Routes:
  - POST /api/attendance/check-in/ (registers live face match)
  - GET  /api/attendance/report/ (returns attendance statistics)
`,
            tags: ["Python", "Django", "DRF", "OpenCV", "SQLite3", "REST API"],
            live: "https://face-detection-attendance-woad.vercel.app/home/",
            code: "https://github.com/Milan07xt/SEM-06"
        },
        "gym management system": {
            title: "Gym Management System",
            category: "Python / Django / SQLite",
            desc: `
                <div class="case-study-block">
                    <p style="margin-bottom: 12px;"><strong>Problem & Motivation:</strong> Local gyms struggle to monitor client subscription renewals, handle membership tier transitions, and log daily payments. Manual books lead to revenue leaks and administrative overhead.</p>
                    <p><strong>Proposed Solution:</strong> Developed a responsive management portal built on Django. The solution allows staff to register users, track active plan timelines, and generate payment audits, while members log into a personalized profile page to inspect their billing history.</p>
                </div>
            `,
            features: [
                "Member registration and dynamic subscription tier tracking.",
                "Visual charts mapping active members, monthly billing, and renewals.",
                "Flexible member portal displaying attendance records and profile status.",
                "Secure Django administrative tools with tiered user permissions."
            ],
            architecture: `
Relational Schema:
  - Table: Member (MemberID, Name, PlanID, ExpiryDate)
  - Table: Payment (PaymentID, MemberID, Amount, Date, Status)
  - Table: Plans (PlanID, PlanName, Duration, Price)
`,
            tags: ["Python", "Django", "SQLite3", "CSS3", "Membership API"],
            live: "https://django-gym-management-system-websit-one.vercel.app/",
            code: "https://github.com/Milan07xt/Django-Gym-Management-System-Website"
        },
        "hotel management website": {
            title: "Hotel Management Website",
            category: "HTML5 / CSS3 / JavaScript",
            desc: `
                <div class="case-study-block">
                    <p style="margin-bottom: 12px;"><strong>Problem & Motivation:</strong> Boutique hotels need a visually stunning and responsive landing page to drive room reservations directly. Simple static text lists fail to engage modern travel shoppers.</p>
                    <p><strong>Proposed Solution:</strong> Engineered a premium booking frontend featuring glassmorphism cards, parallax background scrolling, dynamic room amenity search filters, and an interactive reservation calculator that updates pricing instantly in client-side state.</p>
                </div>
            `,
            features: [
                "Dynamic booking form that computes price differences by room selection.",
                "Polished interactive layouts, hover micro-animations, and full mobile responsiveness.",
                "Integrated room gallery with filtering options by amenities and ratings."
            ],
            architecture: `
Client Side Model:
  - LocalStorage booking logs caching.
  - Form validation validating check-in/check-out dates.
`,
            tags: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "UI/UX"],
            live: "https://hotel-website-project-kappa.vercel.app/index.html",
            code: "https://github.com/Milan07xt/Hotel-Website-Project"
        }
    };

    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
        const titleEl = card.querySelector("h3");
        if (!titleEl) return;
        
        const viewLink = card.querySelector(".project-links a:first-child");
        if (!viewLink) return;

        const linksDiv = card.querySelector(".project-links");
        if (linksDiv) {
            const caseBtn = document.createElement("a");
            caseBtn.className = "btn-link";
            caseBtn.style.cursor = "pointer";
            caseBtn.innerHTML = `<i class="fa-solid fa-circle-info"></i> Case Study`;
            
            caseBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const key = titleEl.textContent.trim().toLowerCase();
                let data = null;
                for (let k in projectData) {
                    if (key.includes(k) || k.includes(key)) {
                        data = projectData[k];
                        break;
                    }
                }
                if (data) {
                    openModal(data);
                } else {
                    window.open(viewLink.getAttribute("href"), "_blank");
                }
            });
            
            linksDiv.appendChild(caseBtn);
        }
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    function openModal(data) {
        document.getElementById("modalCategory").textContent = data.category;
        document.getElementById("modalTitle").textContent = data.title;
        document.getElementById("modalDesc").innerHTML = data.desc;
        
        const featuresEl = document.getElementById("modalFeatures");
        featuresEl.innerHTML = "";
        data.features.forEach(f => {
            const li = document.createElement("li");
            li.textContent = f;
            featuresEl.appendChild(li);
        });

        document.getElementById("modalArchitecture").innerHTML = data.architecture.trim().replace(/\n/g, "<br>");

        const tagsEl = document.getElementById("modalTags");
        tagsEl.innerHTML = "";
        data.tags.forEach(t => {
            const span = document.createElement("span");
            span.className = "chip";
            span.textContent = t;
            tagsEl.appendChild(span);
        });

        document.getElementById("modalLiveLink").setAttribute("href", data.live);
        document.getElementById("modalCodeLink").setAttribute("href", data.code);

        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("open");
        document.body.style.overflow = "";
    }
})();

// 5. GitHub API stats fetcher
(function initGitHubFetcher() {
    const avatarImg = document.getElementById("github-avatar");
    const nameEl = document.getElementById("github-name");
    const usernameLink = document.getElementById("github-username");
    const bioEl = document.getElementById("github-bio");
    const reposCountEl = document.getElementById("github-repos-count");
    const followersEl = document.getElementById("github-followers");
    const starsEl = document.getElementById("github-stars");
    const reposGrid = document.getElementById("github-repos-grid");

    if (!reposGrid) return;

    const fallbackProfile = {
        name: "Milan Rathod",
        bio: "Python / Django Developer. Building backend systems & computer-vision applications.",
        public_repos: 4,
        followers: 1,
        stars: 4
    };

    const fallbackRepos = [
        {
            name: "SEM-06",
            html_url: "https://github.com/Milan07xt/SEM-06",
            description: "Face Recognition Attendance System using OpenCV and Django REST Framework API logging.",
            language: "Python",
            stargazers_count: 2,
            forks_count: 0
        },
        {
            name: "Django-Gym-Management-System-Website",
            html_url: "https://github.com/Milan07xt/Django-Gym-Management-System-Website",
            description: "A comprehensive membership and payment management dashboard for gyms built with Django and SQLite.",
            language: "Python",
            stargazers_count: 1,
            forks_count: 1
        },
        {
            name: "Hotel-Website-Project",
            html_url: "https://github.com/Milan07xt/Hotel-Website-Project",
            description: "Responsive hotel booking reservation homepage built using HTML5, CSS3, and native JavaScript.",
            language: "HTML",
            stargazers_count: 1,
            forks_count: 0
        }
    ];

    const langColors = {
        "Python": "#3572A5",
        "JavaScript": "#f1e05a",
        "HTML": "#e34c26",
        "CSS": "#563d7c"
    };

    fetchProfile();
    fetchRepos();

    async function fetchProfile() {
        try {
            const res = await fetch("https://api.github.com/users/Milan07xt");
            if (res.ok) {
                const data = await res.json();
                if (avatarImg) avatarImg.src = data.avatar_url;
                if (nameEl) nameEl.textContent = data.name || "Milan Rathod";
                if (bioEl) bioEl.textContent = data.bio || fallbackProfile.bio;
                if (reposCountEl) reposCountEl.textContent = data.public_repos;
                if (followersEl) followersEl.textContent = data.followers;
            } else {
                useProfileFallback();
            }
        } catch (err) {
            console.warn("GitHub Profile Fetch failed, utilizing fallbacks", err);
            useProfileFallback();
        }
    }

    async function fetchRepos() {
        try {
            const res = await fetch("https://api.github.com/users/Milan07xt/repos?sort=updated");
            if (res.ok) {
                const repos = await res.json();
                const filtered = repos.filter(r => !r.fork).slice(0, 6);
                
                if (filtered.length > 0) {
                    renderRepos(filtered);
                    calculateStars(repos);
                } else {
                    renderRepos(fallbackRepos);
                }
            } else {
                renderRepos(fallbackRepos);
            }
        } catch (err) {
            console.warn("GitHub Repos Fetch failed, utilizing offline cache list", err);
            renderRepos(fallbackRepos);
        }
    }

    function useProfileFallback() {
        if (avatarImg) avatarImg.src = "images/gym.jpeg"; 
        if (nameEl) nameEl.textContent = fallbackProfile.name;
        if (bioEl) bioEl.textContent = fallbackProfile.bio;
        if (reposCountEl) reposCountEl.textContent = fallbackProfile.public_repos;
        if (followersEl) followersEl.textContent = fallbackProfile.followers;
        if (starsEl) starsEl.textContent = fallbackProfile.stars;
    }

    function calculateStars(repos) {
        if (!starsEl) return;
        const total = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        starsEl.textContent = total || fallbackProfile.stars;
    }

    function renderRepos(repos) {
        reposGrid.innerHTML = "";
        
        repos.forEach(repo => {
            const card = document.createElement("div");
            card.className = "repo-card";
            
            const color = langColors[repo.language] || "#8e8e8e";
            
            card.innerHTML = `
                <div>
                    <div class="repo-card-head">
                        <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                        <i class="fab fa-github repo-icon-git"></i>
                    </div>
                    <p class="repo-desc">${repo.description || 'No description available for this project.'}</p>
                </div>
                <div class="repo-footer">
                    <div class="repo-lang">
                        <span class="repo-lang-dot" style="background: ${color};"></span>
                        <span>${repo.language || 'Code'}</span>
                    </div>
                    <div class="repo-stats">
                        <span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count || 0}</span>
                    </div>
                </div>
            `;
            reposGrid.appendChild(card);
        });
    }
})();

// ---------------------------------------------------------------
// 6. Skills progress animation
// ---------------------------------------------------------------
(function initSkillsProgress() {
    const fills = document.querySelectorAll(".skill-progress-fill");
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const progress = fill.getAttribute("data-progress");
                fill.style.width = progress;
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.1 });

    fills.forEach(fill => observer.observe(fill));
})();

// ---------------------------------------------------------------
// 7. Simulated GitHub contribution grid & tooltips
// ---------------------------------------------------------------
(async function initGitHubContributions() {
    const grid = document.getElementById("contrib-grid");
    if (!grid) return;

    let tooltip = document.querySelector(".calendar-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.className = "calendar-tooltip";
        document.body.appendChild(tooltip);
    }

    try {
        const username = "Milan07xt";
        // Fetch the contribution JSON data from the unofficial API
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
        if (!res.ok) throw new Error("GitHub Contributions API returned an error");
        
        const data = await res.json();
        if (!data || !data.contributions || !data.contributions.length) {
            throw new Error("Invalid contributions data format");
        }
        
        // Sort contributions chronologically
        const sorted = data.contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Align ending date to the Saturday of the current week to keep a perfect 53x7 rectangular layout
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - dayOfWeek));
        const saturdayStr = saturday.toISOString().split('T')[0];
        
        // Filter out any dates after the current week's Saturday
        const pastContributions = sorted.filter(day => day.date <= saturdayStr);
        
        // Slice the last 371 days (53 weeks * 7 days)
        const recent = pastContributions.slice(-371);
        
        grid.innerHTML = "";
        recent.forEach(day => {
            const cell = document.createElement("div");
            cell.className = `contrib-cell lvl-${day.level}`;
            
            const cellDate = new Date(day.date);
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateStr = cellDate.toLocaleDateString('en-US', options);
            const commitsText = day.count === 0 ? "No contributions" : `${day.count} contribution${day.count > 1 ? 's' : ''}`;
            
            cell.addEventListener("mouseenter", (e) => {
                tooltip.textContent = `${commitsText} on ${dateStr}`;
                tooltip.classList.add("visible");
                
                const rect = cell.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + 5}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
            });

            cell.addEventListener("mouseleave", () => {
                tooltip.classList.remove("visible");
            });

            grid.appendChild(cell);
        });
        
    } catch (err) {
        console.warn("Failed to fetch real GitHub contribution graph. Utilizing fallback simulation.", err);
        renderSimulatedContributions(grid, tooltip);
    }
    
    function renderSimulatedContributions(grid, tooltip) {
        const totalCells = 371; 
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - totalCells + 1);

        grid.innerHTML = "";
        for (let i = 0; i < totalCells; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);

            const rand = Math.random();
            let level = 0;
            let commits = 0;
            
            if (rand > 0.88) {
                level = 4;
                commits = Math.floor(Math.random() * 5) + 6;
            } else if (rand > 0.74) {
                level = 3;
                commits = Math.floor(Math.random() * 3) + 3;
            } else if (rand > 0.58) {
                level = 2;
                commits = Math.floor(Math.random() * 2) + 1;
            } else if (rand > 0.38) {
                level = 1;
                commits = 1;
            }

            const cell = document.createElement("div");
            cell.className = `contrib-cell lvl-${level}`;
            
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateStr = cellDate.toLocaleDateString('en-US', options);
            const commitsText = commits === 0 ? "No contributions" : `${commits} contribution${commits > 1 ? 's' : ''}`;
            
            cell.addEventListener("mouseenter", (e) => {
                tooltip.textContent = `${commitsText} on ${dateStr}`;
                tooltip.classList.add("visible");
                
                const rect = cell.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + 5}px`;
                tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
            });

            cell.addEventListener("mouseleave", () => {
                tooltip.classList.remove("visible");
            });

            grid.appendChild(cell);
        }
    }
})();

// ---------------------------------------------------------------
// 8. Projects filtering tabs
// ---------------------------------------------------------------
(function initProjectFilters() {
    const filters = document.querySelectorAll(".project-filters .filter-btn");
    const cards = document.querySelectorAll(".project-grid .project-card");
    if (!filters.length || !cards.length) return;

    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(f => f.classList.remove("active"));
            btn.classList.add("active");

            const filterVal = btn.getAttribute("data-filter").toLowerCase();

            cards.forEach(card => {
                const chips = Array.from(card.querySelectorAll(".chip")).map(c => c.textContent.toLowerCase());
                const title = card.querySelector("h3").textContent.toLowerCase();
                const desc = card.querySelector("p").textContent.toLowerCase();

                let isMatch = false;
                if (filterVal === "all") {
                    isMatch = true;
                } else if (filterVal === "python") {
                    isMatch = chips.includes("python") || title.includes("python");
                } else if (filterVal === "django") {
                    isMatch = chips.includes("django") || chips.includes("django rest framework") || title.includes("django");
                } else if (filterVal === "opencv") {
                    isMatch = chips.includes("opencv") || title.includes("opencv") || title.includes("face");
                } else if (filterVal === "frontend") {
                    isMatch = chips.includes("html5") || chips.includes("css3") || chips.includes("javascript") || chips.includes("ui/ux") || title.includes("hotel") || title.includes("web");
                }

                if (isMatch) {
                    card.classList.remove("hide");
                    card.style.opacity = "0";
                    setTimeout(() => {
                        card.style.opacity = "1";
                    }, 50);
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });
})();

// ---------------------------------------------------------------
// 9. Certificates filtering tabs
// ---------------------------------------------------------------
(function initCertificateFilters() {
    const filters = document.querySelectorAll(".certificate-filters .cert-filter-btn");
    const cards = document.querySelectorAll(".certificate-grid .certificate-card");
    if (!filters.length || !cards.length) return;

    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(f => f.classList.remove("active"));
            btn.classList.add("active");

            const filterVal = btn.getAttribute("data-filter").toLowerCase();

            cards.forEach(card => {
                const text = card.textContent.toLowerCase();

                let isMatch = false;
                if (filterVal === "all") {
                    isMatch = true;
                } else if (filterVal === "nasscom") {
                    isMatch = text.includes("nasscom");
                } else if (filterVal === "forage") {
                    isMatch = text.includes("forage");
                } else if (filterVal === "udemy") {
                    isMatch = text.includes("udemy");
                }

                if (isMatch) {
                    card.classList.remove("hide");
                    card.style.opacity = "0";
                    setTimeout(() => {
                        card.style.opacity = "1";
                    }, 50);
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });
})();

// ---------------------------------------------------------------
// 10. Testimonials Slider Carousel
// ---------------------------------------------------------------
(function initTestimonialsCarousel() {
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".testimonial-controls .dot");
    const prevBtn = document.getElementById("prevTestimonial");
    const nextBtn = document.getElementById("nextTestimonial");
    if (!slides.length) return;

    let currentIndex = 0;
    let autoPlayTimer = null;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove("active"));
        dots.forEach(d => d.classList.remove("active"));

        currentIndex = (index + slides.length) % slides.length;
        slides[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            showSlide(currentIndex - 1);
            resetAutoplay();
        });
        nextBtn.addEventListener("click", () => {
            showSlide(currentIndex + 1);
            resetAutoplay();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const idx = parseInt(dot.getAttribute("data-index"));
            showSlide(idx);
            resetAutoplay();
        });
    });

    function startAutoplay() {
        autoPlayTimer = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 6000);
    }

    function resetAutoplay() {
        clearInterval(autoPlayTimer);
        startAutoplay();
    }

    startAutoplay();
})();