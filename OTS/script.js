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

  // Si el archivo parece XML, parsea normalmente
  if (text.trim().startsWith('<?xml')) {
    const parser = new DOMParser();
    tournamentData = parser.parseFromString(text, 'text/xml');
    const currentRoundNode = tournamentData.querySelector('CurrentRound');
    currentRound = parseInt(currentRoundNode?.textContent || "0", 10);
    document.getElementById('rondaInfo').textContent = `Ronda: ${currentRound}`;
    ocultarMensajePersonalizado();
    buscarEmparejamientos(noAutoSwitch);
  } else {
    // Si es texto plano, muestra como mensaje personalizado
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

function getStandingHTML(standing, nombreJugador) {
  let clase = '';
  let medalla = '';
  if (standing == 1) {
    clase = 'standing-1';
    medalla = '<span class="standing-medal">🥇</span>';
  } else if (standing == 2) {
    clase = 'standing-2';
    medalla = '<span class="standing-medal">🥈</span>';
  } else if (standing == 3) {
    clase = 'standing-3';
    medalla = '<span class="standing-medal">🥉</span>';
  } else if (standing == '-' || standing == undefined) {
    clase = '';
    medalla = '';
  }
  return `<div class="standing-box standing-${clase}">Standing: <br><span class="${clase}">${standing || '-'}</span>${medalla}</div>
  <div class="standing-nombre">${nombreJugador}</div>`;
}

function buscarEmparejamientos(noAutoSwitch) {
  const inputRaw = document.getElementById('konamiId').value.trim();
  const input = padId(inputRaw);
  localStorage.setItem('konamiId', input);

  if (!tournamentData || !input) return;

  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));

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
      <div class="card" style="margin-bottom: 22px;">
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

  // En la primera búsqueda, si no es "auto", asegúrate que el tab esté en Ronda
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

  // Mostrar standing y nombre arriba
  let content = getStandingHTML(standing, nombreJugador);

  historial.forEach(({ ronda, resultado, nombreOponente }) => {
    let colorBarra = '';
    let colorTexto = '';
    if (resultado === 'Victoria') {
      colorBarra = 'result-win';
      colorTexto = 'result-win';
    } else if (resultado
