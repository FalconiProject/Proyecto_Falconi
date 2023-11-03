document.addEventListener("DOMContentLoaded", function () {
  const summaries = document.querySelectorAll("summary");

  summaries.forEach((summary) => {
    summary.addEventListener("click", function () {
      const icon = summary.querySelector(".info-icon");
      icon.classList.toggle("clicked");
    });
  });
});

// Obtenemos los enlaces de la barra de navegación
const polizaLink = document.querySelector('a[href="#Poliza"]');
const facturacionLink = document.querySelector('a[href="#Facturacion"]');

// Obtenemos las secciones de la página
const polizaSection = document.getElementById("Poliza1");
const facturacionSection = document.getElementById("Facturacion1");

// Función para mostrar una sección y ocultar las demás
function mostrarSeccion(seccion) {
  polizaSection.style.display = "none";
  facturacionSection.style.display = "none";

  seccion.style.display = "block";
}

// Agregamos eventos de clic a los enlaces de la barra de navegación
polizaLink.addEventListener("click", () => mostrarSeccion(polizaSection));
facturacionLink.addEventListener("click", () =>
  mostrarSeccion(facturacionSection)
);

// Mostramos la sección de "Poliza" por defecto
mostrarSeccion(polizaSection);
