// Navegación entre vistas (inicio / apps)
const homeBtn = document.getElementById('homeBtn');
const preregBtn = document.getElementById('preregBtn');
const otsBtn = document.getElementById('otsBtn');
const regionalBtn = document.getElementById('regionalBtn');

const mainCards = document.getElementById('main-cards');
const preregSection = document.getElementById('preregSection');
const otsSection = document.getElementById('otsSection');
const regionalSection = document.getElementById('regionalSection');

function showSection(section) {
  mainCards.style.display = section === 'main' ? 'flex' : 'none';
  preregSection.style.display = section === 'prereg' ? 'block' : 'none';
  otsSection.style.display = section === 'ots' ? 'block' : 'none';
  regionalSection.style.display = section === 'regional' ? 'block' : 'none';

  // Quitar todos los .active
  document.querySelectorAll('.sidebar nav ul li a').forEach(a => a.classList.remove('active'));
  if(section === 'main') homeBtn.classList.add('active');
  if(section === 'prereg') preregBtn.classList.add('active');
  if(section === 'ots') otsBtn.classList.add('active');
  if(section === 'regional') regionalBtn.classList.add('active');
}

// Clic en menú lateral
homeBtn.onclick = e => { e.preventDefault(); showSection('main'); }
preregBtn.onclick = e => { e.preventDefault(); showSection('prereg'); }
otsBtn.onclick = e => { e.preventDefault(); showSection('ots'); }
regionalBtn.onclick = e => { e.preventDefault(); showSection('regional'); }

// Clic en cards
document.getElementById('preregCard').onclick = () => showSection('prereg');
document.getElementById('otsCard').onclick = () => showSection('ots');
document.getElementById('regionalCard').onclick = () => showSection('regional');
