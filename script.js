// Sidebar open/close logic
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const openSidebar = document.getElementById('openSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const goHome = document.getElementById('goHome');
const goPre = document.getElementById('goPre');
const goOTS = document.getElementById('goOTS');
const goRQ = document.getElementById('goRQ');

// Open menu
openSidebar.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.add('show');
});
// Close menu
closeSidebar.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

function closeMenu() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// Fake navigation (to replace with real routes later)
goHome.onclick = () => { closeMenu(); document.getElementById('mainContent').innerHTML = document.querySelector('.cards-container').outerHTML; };
goPre.onclick = () => { closeMenu(); document.getElementById('mainContent').innerHTML = '<div class="main-card" style="margin:48px auto;">Próximamente: Preregistro Regional Puebla 2025</div>'; };
goOTS.onclick = () => { closeMenu(); document.getElementById('mainContent').innerHTML = '<div class="main-card" style="margin:48px auto;">Próximamente: Pareos OTS Championship</div>'; };
goRQ.onclick = () => { closeMenu(); document.getElementById('mainContent').innerHTML = '<div class="main-card" style="margin:48px auto;">Próximamente: Pareos Regional Qualifier Puebla 2025</div>'; };

// Also allow menu to be shown with swipe (mobile only)
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { if (e.touches[0].clientX < 25) touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  if (touchStartX < 25 && e.changedTouches[0].clientX - touchStartX > 60) {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
});
