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

    // Scroll reveal using IntersectionObserver
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

    // Mouse-follow spotlight effect
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
        "#about .about-grid, #skills .skill-group, #projects .project-card, #contact .contact-card"
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
document.querySelectorAll(".project-card").forEach(card=>{

card.addEventListener("mousemove",e=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateY=((x/rect.width)-0.5)*18;

const rotateX=((y/rect.height)-0.5)*-18;

card.style.transform=`
perspective(1200px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-10px)
`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});