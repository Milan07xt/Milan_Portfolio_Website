// 3D Animation with Three.js
function init3D(){
const canvas = document.getElementById('canvas3d');
if(!canvas) return;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

camera.position.z = 50;

// Create floating cubes
const cubes = [];
const geometry = new THREE.BoxGeometry(5, 5, 5);

for(let i = 0; i < 10; i++){
const material = new THREE.MeshPhongMaterial({
color: Math.random() * 0xffffff,
emissive: 0x3b82f6,
wireframe: false
});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(
(Math.random() - 0.5) * 100,
(Math.random() - 0.5) * 100,
(Math.random() - 0.5) * 100
);
cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
cube.velocity = {
x: (Math.random() - 0.5) * 2,
y: (Math.random() - 0.5) * 2,
z: (Math.random() - 0.5) * 2,
rotX: (Math.random() - 0.5) * 0.05,
rotY: (Math.random() - 0.5) * 0.05
};
scene.add(cube);
cubes.push(cube);
}

// Add lighting
const light1 = new THREE.PointLight(0x3b82f6, 1, 100);
light1.position.set(50, 50, 50);
scene.add(light1);

const light2 = new THREE.PointLight(0xff006e, 0.5, 100);
light2.position.set(-50, -50, 50);
scene.add(light2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

function animate(){
requestAnimationFrame(animate);

cubes.forEach(cube => {
cube.position.x += cube.velocity.x;
cube.position.y += cube.velocity.y;
cube.position.z += cube.velocity.z;

cube.rotation.x += cube.velocity.rotX;
cube.rotation.y += cube.velocity.rotY;

// Bounce at boundaries
if(Math.abs(cube.position.x) > 60) cube.velocity.x *= -1;
if(Math.abs(cube.position.y) > 60) cube.velocity.y *= -1;
if(Math.abs(cube.position.z) > 60) cube.velocity.z *= -1;
});

renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});
}

// Initialize 3D animation on page load
window.addEventListener('load', init3D);

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