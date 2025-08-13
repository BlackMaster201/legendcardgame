/* ================== Datos ================== */
/* Ajusta aquí tus páginas reales y miniaturas */
const CARDS = [
  {
    badge: "In Progress",
    title: "Preregistro Regional Puebla 2025",
    desc: "Inscríbete para el Regional Puebla 2025.",
    img: "assets/thumbs/preregister.jpg",
    primary: { label: "Entrar", href: "preregistro/index.html" },
    ghost:   { label: "Detalles", href: "preregistro/index.html#info" }
  },
  {
    badge: "In Progress",
    title: "Pareos OTS Championship",
    desc: "Consulta tus pareos del OTS Championship.",
    img: "assets/thumbs/ots.jpg",
    primary: { label: "Entrar", href: "OTS/index.html" },            // carpeta OTS
    ghost:   { label: "Schedule", href: "OTS/index.html#schedule" }
  },
  {
    badge: "In Progress",
    title: "Pareos Regional Qualifier Puebla 2025",
    desc: "Duelos y standing en el Regional Puebla 2025.",
    img: "assets/thumbs/regional.jpg",
    primary: { label: "Entrar", href: "regional/index.html" },       // carpeta regional
    ghost:   { label: "Resultados", href: "regional/index.html#historial" }
  }
];

/* ================== Render de Cards ================== */
const list = document.getElementById('cardsList');

function createCard(item){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="thumb"><img src="${item.img}" alt="${item.title}" loading="lazy"></div>
    <div class="card-body">
      <span class="badge">${item.badge}</span>
      <h3 class="title">${item.title}</h3>
      <p class="desc">${item.desc}</p>
      <div class="actions">
        <a class="btn primary" href="${item.primary.href}">${item.primary.label}</a>
        <a class="btn ghost" href="${item.ghost.href}">${item.ghost.label}</a>
      </div>
    </div>
  `;
  return el;
}

CARDS.forEach(c => list.appendChild(createCard(c)));

/* ================== Carrusel ================== */
const track = document.getElementById('carouselTrack');
const dots = document.getElementById('carouselDots');
const slides = Array.from(track.children);
let idx = 0;
let timer = null;

function goTo(i){
  idx = (i + slides.length) % slides.length;
  const w = slides[0].getBoundingClientRect().width + 10; // +gap
  track.scrollTo({ left: idx * w, behavior: 'smooth' });
  [...dots.children].forEach((d,j) => d.classList.toggle('active', j===idx));
  resetAutoplay();
}
function next(){ goTo(idx+1); }
function prev(){ goTo(idx-1); }

document.querySelector('.carousel .next').addEventListener('click', next);
document.querySelector('.carousel .prev').addEventListener('click', prev);

/* Dots */
slides.forEach((_,i)=>{
  const b = document.createElement('button');
  if(i===0) b.classList.add('active');
  b.addEventListener('click', ()=>goTo(i));
  dots.appendChild(b);
});

/* Autoplay */
function resetAutoplay(){
  if (timer) clearInterval(timer);
  timer = setInterval(next, 5000);
}
resetAutoplay();

/* Swipe táctil */
let sx=0, dx=0;
track.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; }, {passive:true});
track.addEventListener('touchmove', e=>{ dx = e.touches[0].clientX - sx; }, {passive:true});
track.addEventListener('touchend', ()=>{
  if (dx > 40) prev();
  else if (dx < -40) next();
  sx=dx=0;
});

/* Sincroniza índice cuando el usuario hace scroll manual */
track.addEventListener('scroll', ()=>{
  const w = slides[0].getBoundingClientRect().width + 10;
  const n = Math.round(track.scrollLeft / w);
  if (n !== idx) {
    idx = n;
    [...dots.children].forEach((d,j)=>d.classList.toggle('active', j===idx));
  }
}, {passive:true});
