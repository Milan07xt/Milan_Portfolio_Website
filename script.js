const roles = [
"Python Developer",
"Django Developer",
"Backend Developer",
"Software Developer"
];

let roleIndex = 0;
let charIndex = 0;

function typeText(){

const typing = document.getElementById("typing");

let current = roles[roleIndex];

typing.textContent =
current.substring(0,charIndex);

charIndex++;

if(charIndex > current.length){

setTimeout(()=>{

charIndex = 0;

roleIndex++;

if(roleIndex >= roles.length){
roleIndex = 0;
}

},1500);

}

setTimeout(typeText,120);
}

typeText();

const themeBtn =
document.getElementById("theme-toggle");

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("light");

});