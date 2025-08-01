document.addEventListener('DOMContentLoaded', () => {
  const btnRonda = document.getElementById('btnRonda');
  const btnHistorial = document.getElementById('btnHistorial');
  const tableContainer = document.getElementById('tableContainer');
  const historyContainer = document.getElementById('historyContainer');
  const searchInput = document.getElementById('konamiId');

  btnRonda.addEventListener('click', () => {
    btnRonda.classList.add('active');
    btnHistorial.classList.remove('active');
    tableContainer.style.display = 'block';
    historyContainer.style.display = 'none';
  });

  btnHistorial.addEventListener('click', () => {
    btnHistorial.classList.add('active');
    btnRonda.classList.remove('active');
    tableContainer.style.display = 'none';
    historyContainer.style.display = 'block';
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value.length === 10) {
      buscarEmparejamientos();
    }
  });

  const savedId = localStorage.getItem('konamiId');
  if (savedId) {
    searchInput.value = savedId;
    buscarEmparejamientos();
  }
});
