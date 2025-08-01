const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');

function closeSidebarOnClickOutside(e) {
  if (
    sidebar &&
    !sidebar.contains(e.target) &&
    window.innerWidth <= 950 &&
    sidebar.classList.contains('show')
  ) {
    sidebar.classList.remove('show');
  }
}

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show');
});

window.addEventListener('click', closeSidebarOnClickOutside);

// Muestra el menú en móviles al cargar
window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 950) {
    sidebar.classList.remove('show');
  } else {
    sidebar.classList.add('show');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 950) {
    sidebar.classList.add('show');
  } else {
    sidebar.classList.remove('show');
  }
});
