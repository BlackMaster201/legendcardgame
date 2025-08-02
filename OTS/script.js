let tournamentData = null;
let currentRound = null;

function padId(id) {
  return String(id).padStart(10, '0');
}

function mostrarMensajePersonalizado(texto) {
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = 'none';
  let msg = document.getElementById('mensajePersonalizado');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'mensajePersonalizado';
    document.querySelector('.container').appendChild(msg);
  }
  msg.innerText = texto;
  msg.style.display = '';
}

function ocultarMensajePersonalizado() {
  let msg = document.getElementById('mensajePersonalizado');
  if (msg) msg.style.display = 'none';
  document.getElementById('tableContainer').style.display = '';
  document.getElementById('historyContainer').style.display = '';
}

async function cargarTorneo(noAutoSwitch) {
  const response = await fetch('1.txt');
  const text = await response.text();

  if (text.trim().startsWith('<?xml')) {
    const parser = new DOMParser();
    tournamentData = parser.parseFromString(text, 'text/xml');
    const currentRoundNode = tournamentData.querySelector('CurrentRound');
    currentRound = parseInt(currentRoundNode?.textContent || "0", 10);
    document.getElementById('rondaInfo').textContent = `Ronda: ${currentRound}`;
    ocultarMensajePersonalizado();
    buscarEmparejamientos(noAutoSwitch);
  } else {
    document.getElementById('rondaInfo').textContent = '';
    mostrarMensajePersonalizado(text);
  }
}

function getPlayerInfo(id) {
  const players = Array.from(tournamentData.querySelectorAll('TournPlayer'));
  const playerNode = players.find(p => padId(p.querySelector('ID')?.textContent) === id);
  if (!playerNode) return null;
  const nombre = `${playerNode.querySelector('FirstName')?.textContent || ''} ${playerNode.querySelector('LastName')?.textContent || ''}`.trim();
  const rank = playerNode.querySelector('Rank')?.textContent;
  let standing = rank ? parseInt(rank, 10) : '-';
  // Check for drop
  const dropRound = playerNode.querySelector('DropRound')?.textContent || '';
  const isDrop = dropRound && parseInt(dropRound, 10) > 0;
  return { nombre, standing, isDrop };
}

function mostrarTab(tab) {
  if (tab === "ronda") {
    document.getElementById('tableContainer').style.display = '';
    document.getElementById('historyContainer').style.display = 'none';
    document.getElementById('btnRonda').classList.add('active');
    document.getElementById('btnHistorial').classList.remove('active');
  } else {
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('historyContainer').style.display = '';
    document.getElementById('btnHistorial').classList.add('active');
    document.getElementById('btnRonda').classList.remove('active');
  }
}

function buscarEmparejamientos(noAutoSwitch) {
  const inputRaw = document.getElementById('konamiId').value.trim();
  const input = padId(inputRaw);
  localStorage.setItem('konamiId', input);

  if (!tournamentData || !input) return;

  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));
  const players = Array.from(tournamentData.querySelectorAll('TournPlayer'));

  let encontrado = false;
  let emparejamiento = null;
  let nombreJugador = '';
  let nombreOponente = '';
  let idOponente = '';
  let mesa = '';
  let standingJugador = '-';

  // Buscar Standing y Nombre del jugador
  const infoJugador = getPlayerInfo(input);
  if (infoJugador) {
    nombreJugador = infoJugador.nombre;
    standingJugador = infoJugador.standing;
  }

  // Buscar emparejamiento actual
  for (const match of matches) {
    const round = parseInt(match.querySelector('Round')?.textContent || "0", 10);
    if (round !== currentRound) continue;
    const p1 = padId(match.querySelectorAll('Player')[0]?.textContent || "");
    const p2 = padId(match.querySelectorAll('Player')[1]?.textContent || "");
    if (input === p1 || input === p2) {
      encontrado = true;
      emparejamiento = match;
      mesa = match.querySelector('Table')?.textContent || '';
      idOponente = input === p1 ? p2 : p1;
      const infoOpo = getPlayerInfo(idOponente);
      nombreOponente = infoOpo ? infoOpo.nombre : '';
      break;
    }
  }

  // Mostrar ronda actual
  const tableContainer = document.getElementById('tableContainer');
  if (encontrado) {
    tableContainer.innerHTML = `
      <div class="mesa"><span>MESA ${mesa}</span></div>
      <div class="card">
        <div class="linea-roja"></div>
          <div class="jugador">${nombreJugador}</div>
          <div class="konami">${input}</div>
          <div class="vs-label">VS</div>
          <div class="oponente">${nombreOponente || "BYE"}</div>
          <div class="konami-opo">${idOponente || ""}</div>
        <div class="linea-azul"></div>
      </div>
    `;
  } else {
    tableContainer.innerHTML = `<div style="text-align:center;font-size:1.1rem;font-weight:bold;margin-top:32px;">No se encontró el Konami ID o no tienes emparejamiento esta ronda.</div>`;
  }

  // Mostrar historial
  mostrarHistorial(input, standingJugador, nombreJugador);

  // Siempre que se busque, mostrar ronda por defecto (a menos que se especifique lo contrario)
  if (!noAutoSwitch) mostrarTab('ronda');
}

function mostrarHistorial(input, standing, nombreJugador) {
  const historyContainer = document.getElementById('historyContainer');
  if (!tournamentData) {
    historyContainer.innerHTML = '';
    return;
  }
  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));

  // Historial, de ronda más reciente a más antigua
  let historial = [];
  matches.forEach(match => {
    const p1 = padId(match.querySelectorAll('Player')[0]?.textContent || "");
    const p2 = padId(match.querySelectorAll('Player')[1]?.textContent || "");
    const round = parseInt(match.querySelector('Round')?.textContent || "0", 10);
    const winner = padId(match.querySelector('Winner')?.textContent || "");
    if (input === p1 || input === p2) {
      const idOponente = input === p1 ? p2 : p1;
      const infoOpo = getPlayerInfo(idOponente);
      const nombreOponente = infoOpo ? infoOpo.nombre : '';
      let resultado = 'Empate';
      if (winner === input) resultado = 'Victoria';
      else if (winner === idOponente) resultado = 'Derrota';
      historial.push({
        ronda: round,
        resultado,
        nombreOponente,
        idOponente,
      });
    }
  });

  historial.sort((a, b) => b.ronda - a.ronda);

  // Medallas standings
  let medalla = '';
  if (parseInt(standing, 10) === 1) medalla = '🥇';
  else if (parseInt(standing, 10) === 2) medalla = '🥈';
  else if (parseInt(standing, 10) === 3) medalla = '🥉';

  let standingHTML = `<div class="standing-box">Standing: <span>${standing || '-'}</span>${medalla ? `<span class="medalla">${medalla}</span>` : ''}</div>
  <div class="jugador-historial">${nombreJugador}</div>`;

  let content = standingHTML;

  historial.forEach(({ ronda, resultado, nombreOponente }) => {
    let colorBarra = '';
    let colorTexto = '';
    if (resultado === 'Victoria') {
      colorBarra = 'result-win';
      colorTexto = 'result-win';
    } else if (resultado === 'Derrota') {
      colorBarra = 'result-loss';
      colorTexto = 'result-loss';
    } else {
      colorBarra = 'result-draw';
      colorTexto = 'result-draw';
    }

    content += `
      <div class="historial-caja">
        <div class="historial-barra ${colorBarra}"></div>
        <div class="contenido-historial">
          <div class="ronda-resultado ${colorTexto}">Ronda ${ronda} - ${resultado}</div>
          <div class="vs-nombre">VS ${nombreOponente}</div>
        </div>
      </div>
    `;
  });

  historyContainer.innerHTML = content;
}

// Alternar pestañas
document.getElementById('btnRonda').addEventListener('click', () => {
  mostrarTab('ronda');
});
document.getElementById('btnHistorial').addEventListener('click', () => {
  mostrarTab('historial');
});

// Botón buscar
document.getElementById('buscarBtn').addEventListener('click', () => {
  buscarEmparejamientos(false);
});

document.getElementById('konamiId').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    buscarEmparejamientos(false);
  }
});

// Al cambiar el ID o al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarTorneo(true); // No autoswitch tab, solo carga datos
  mostrarTab('ronda');
  const lastId = localStorage.getItem('konamiId');
  if (lastId) {
    document.getElementById('konamiId').value = lastId;
    setTimeout(() => buscarEmparejamientos(true), 300);
