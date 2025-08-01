
let tournamentData = null;
let currentRound = null;
let playerList = [];
let matches = [];
let isTournament = false;

// Utilidad para rellenar ceros a la izquierda a los IDs
function padId(id) {
  return String(id).padStart(10, '0');
}

// Lee el archivo 1.txt
fetch('1.txt')
  .then(response => response.text())
  .then(str => {
    if (!str.includes('<Tournament>')) {
      // Muestra el texto libre si no es XML válido de torneo
      document.getElementById('rondaInfo').textContent = '';
      document.getElementById('tableContainer').innerHTML = `
        <div class="aviso-previo">${str.replace(/\n/g, '<br>')}</div>
      `;
      document.getElementById('searchID').style.display = 'none';
      document.getElementById('btnRonda').style.display = 'none';
      document.getElementById('btnHistorial').style.display = 'none';
      isTournament = false;
      return;
    }
    // --------- SÍ hay torneo, carga normalmente ----------
    isTournament = true;
    const parser = new DOMParser();
    const xml = parser.parseFromString(str, 'text/xml');
    tournamentData = xml;

    // Carga ronda actual
    const currentRoundNode = tournamentData.querySelector('CurrentRound');
    currentRound = parseInt(currentRoundNode?.textContent || "0", 10);

    const label = document.getElementById('rondaInfo');
    if (label) label.textContent = `Ronda: ${currentRound}`;

    // Carga listas para búsquedas rápidas
    playerList = Array.from(tournamentData.querySelectorAll('TournPlayer'));
    matches = Array.from(tournamentData.querySelectorAll('TournMatch'));

    // Si ya hay ID, busca (por recarga)
    const lastId = localStorage.getItem('konamiId');
    if (lastId) {
      document.getElementById('searchID').value = lastId;
      mostrarRonda(lastId);
    }
  })
  .catch(() => {
    const label = document.getElementById('rondaInfo');
    if (label) label.textContent = 'No se encontró el archivo de torneo.';
  });

// ------------ Emparejamientos y render ------------

function buscarEmparejamientos() {
  if (!isTournament) return; // No hacer nada si solo es aviso previo
  const inputRaw = document.getElementById('searchID').value.trim();
  const input = padId(inputRaw);
  localStorage.setItem('konamiId', input);

  mostrarRonda(input);
}

function mostrarRonda(konamiId) {
  // Limpiar contenedores
  document.getElementById('tableContainer').innerHTML = '';
  document.getElementById('historyContainer').innerHTML = '';

  // Buscar emparejamiento actual
  const matchesCurrent = matches.filter(m => parseInt(m.querySelector('Round').textContent) === currentRound);
  let found = false;
  let mesa = null, yo = null, op = null, yoId = null, opId = null;

  matchesCurrent.forEach(match => {
    const ids = match.querySelectorAll('Player');
    const p1 = padId(ids[0]?.textContent || "");
    const p2 = padId(ids[1]?.textContent || "");
    if (konamiId === p1 || konamiId === p2) {
      found = true;
      mesa = match.querySelector('Table')?.textContent || '-';
      yoId = konamiId;
      opId = konamiId === p1 ? p2 : p1;
    }
  });

  if (!found) {
    document.getElementById('tableContainer').innerHTML = `<div class="card card-error">No se encontró el Konami ID.</div>`;
    return;
  }

  // Obtener nombres
  const yoData = playerList.find(p => padId(p.querySelector('ID')?.textContent) === yoId);
  const opData = playerList.find(p => padId(p.querySelector('ID')?.textContent) === opId);
  const yoNombre = yoData
    ? `<span class="nombre-jugador">${yoData.querySelector('FirstName').textContent} ${yoData.querySelector('LastName').textContent}</span>
      <span class="konami-id">${yoId}</span>`
    : 'Desconocido';
  const opNombre = opData
    ? `<span class="nombre-jugador">${opData.querySelector('FirstName').textContent} ${opData.querySelector('LastName').textContent}</span>
      <span class="konami-id">${opId}</span>`
    : 'Desconocido';

  // Mostrar ronda
  document.getElementById('tableContainer').innerHTML = `
    <div class="mesa-card"><span>Mesa: ${mesa}</span></div>
    <div class="nombre-card arriba">${yoNombre}</div>
    <div class="vs-card">VS</div>
    <div class="nombre-card abajo">${opNombre}</div>
  `;

  mostrarHistorial(konamiId);
}

function mostrarHistorial(konamiId) {
  const historial = [];
  let standing = '-';

  // Standing
  const yoData = playerList.find(p => padId(p.querySelector('ID')?.textContent) === konamiId);
  if (yoData) {
    let rank = yoData.querySelector('Rank')?.textContent || '-';
    let medalla = '';
    if (rank === '1') medalla = '🥇 ';
    else if (rank === '2') medalla = '🥈 ';
    else if (rank === '3') medalla = '🥉 ';
    if (yoData.innerHTML && yoData.innerHTML.includes('Drop')) rank += ' - Drop';
    standing = `${medalla}${rank}º`;
  }

  // Construir historial
  matches.forEach(match => {
    const ids = match.querySelectorAll('Player');
    const p1 = padId(ids[0]?.textContent || "");
    const p2 = padId(ids[1]?.textContent || "");
    const round = parseInt(match.querySelector('Round')?.textContent || "0", 10);
    const winner = padId(match.querySelector('Winner')?.textContent || "");
    let resultado = 'Empate';
    if (winner === konamiId) resultado = 'Victoria';
    else if ((winner === p1 || winner === p2) && winner !== konamiId) resultado = 'Derrota';

    if (konamiId === p1 || konamiId === p2) {
      const opId = konamiId === p1 ? p2 : p1;
      const opData = playerList.find(p => padId(p.querySelector('ID')?.textContent) === opId);
      const opNombre = opData
        ? `${opData.querySelector('FirstName').textContent} ${opData.querySelector('LastName').textContent}`
        : 'Oponente desconocido';
      historial.push({ ronda: round, resultado, opNombre });
    }
  });

  // Ordenar de más reciente a más antiguo
  historial.sort((a, b) => b.ronda - a.ronda);

  // Mostrar standing y historial
  let html = '';
  html += `<div class="standing-card"><b>Standing:</b> ${standing}</div>`;
  html += `<div class="historial-label"><b>Historial:</b></div>`;

  historial.forEach(({ ronda, resultado, opNombre }) => {
    let color = '#B0BEC5', resultadoTexto = 'Empate';
    if (resultado === 'Victoria') {
      color = '#4CAF50';
      resultadoTexto = 'Victoria';
    } else if (resultado === 'Derrota') {
      color = '#F44336';
      resultadoTexto = 'Derrota';
    }
    html += `
      <div class="historial-caja">
        <div class="historial-resultado" style="color:${color}">Ronda ${ronda} - ${resultadoTexto}</div>
        <div class="historial-oponente">VS ${opNombre}</div>
      </div>
    `;
  });

  document.getElementById('historyContainer').innerHTML = html;
}

// ------- Cambio de pestañas (Ronda / Historial) -------
document.addEventListener('DOMContentLoaded', () => {
  const lastId = localStorage.getItem('konamiId');
  if (lastId && isTournament) {
    document.getElementById('searchID').value = lastId;
    mostrarRonda(lastId);
  }

  document.getElementById('btnRonda').addEventListener('click', () => {
    document.getElementById('btnRonda').classList.add('active');
    document.getElementById('btnHistorial').classList.remove('active');
    document.getElementById('tableContainer').style.display = '';
    document.getElementById('historyContainer').style.display = 'none';
  });
  document.getElementById('btnHistorial').addEventListener('click', () => {
    document.getElementById('btnHistorial').classList.add('active');
    document.getElementById('btnRonda').classList.remove('active');
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('historyContainer').style.display = '';
  });

  // Buscar al escribir ID y presionar Enter
  document.getElementById('searchID').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') buscarEmparejamientos();
  });
});
