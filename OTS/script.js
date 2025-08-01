function mostrarSoloMensaje(mensaje) {
  document.getElementById("mensajePersonalizado").style.display = "block";
  document.getElementById("mensajePersonalizado").textContent = mensaje;

  document.getElementById("konamiId").style.display = "none";
  document.getElementById("tableContainer").style.display = "none";
  document.getElementById("historyContainer").style.display = "none";
  document.getElementById("btnRonda").style.display = "none";
  document.getElementById("btnHistorial").style.display = "none";
  document.getElementById("rondaInfo").style.display = "none";
}

function mostrarAppNormal() {
  document.getElementById("mensajePersonalizado").style.display = "none";
  document.getElementById("konamiId").style.display = "";
  document.getElementById("tableContainer").style.display = "";
  document.getElementById("historyContainer").style.display = "none";
  document.getElementById("btnRonda").style.display = "";
  document.getElementById("btnHistorial").style.display = "";
  document.getElementById("rondaInfo").style.display = "";
}

fetch('1.txt')
  .then(resp => resp.text())
  .then(texto => {
    if (!texto.includes('<Tournament>')) {
      mostrarSoloMensaje(texto.trim());
    } else {
      mostrarAppNormal();
      // Aquí va el código normal para leer el archivo XML y mostrar la app
      // ...
      // Si usas otro archivo JS para la lógica del torneo, aquí lo puedes importar dinámicamente
      // O llamar tu función principal aquí
    }
  })
  .catch(() => {
    mostrarSoloMensaje('No se encontró el archivo 1.txt');
  });
