// Obtén el elemento de la alerta por su ID
let alerta = document.getElementById("alerta");

// Verifica si la URL actual contiene una query string que indica un intento fallido
let urlParams = new URLSearchParams(window.location.search);
let intentoFallido = urlParams.get("error");

// Si hay un intento fallido, muestra la alerta y la oculta después de 5 segundos
if (intentoFallido) {
  alerta.style.display = "block";
  setTimeout(function () {
    alerta.style.display = "none";
  }, 5000); // 5000 milisegundos (5 segundos)
}
