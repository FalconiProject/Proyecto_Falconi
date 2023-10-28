const agregarConductorBtn = document.getElementById("agregarConductor");
const conductoresAdicionales = document.getElementById("conductoresAdicionales");
let conductorCounter = 1;

agregarConductorBtn.addEventListener("click", () => {
  conductorCounter++;

  if (conductorCounter <= 3) {
    const conductorFieldset = document.createElement("fieldset");
    conductorFieldset.className = "conductor";

    const legend = document.createElement("legend");
    legend.textContent = `Conductor ${conductorCounter}`;
    conductorFieldset.appendChild(legend);

    // Nombre del Conductor
    const nombreLabel = document.createElement("label");
    nombreLabel.textContent = "Nombre del Conductor:";
    const nombreInput = document.createElement("input");
    nombreInput.type = "text";
    nombreInput.id = `nombreConductor${conductorCounter}`;
    nombreInput.name = `nombreConductor${conductorCounter}`;
    conductorFieldset.appendChild(nombreLabel);
    conductorFieldset.appendChild(nombreInput);

    // Relacion del Conductor
    const relacionLabel = document.createElement("label");
    relacionLabel.textContent = "Relacion del Conductor:";
    const relacionInput = document.createElement("input");
    relacionInput.type = "text";
    relacionInput.id = `relacionConductor${conductorCounter}`;
    relacionInput.name = `relacionConductor${conductorCounter}`;
    conductorFieldset.appendChild(relacionLabel);
    conductorFieldset.appendChild(relacionInput);

    // Fecha de Nacimiento del Conductor
    const fechaNacimientoLabel = document.createElement("label");
    fechaNacimientoLabel.textContent = "Fecha de Nacimiento del Conductor:";
    const fechaNacimientoInput = document.createElement("input");
    fechaNacimientoInput.type = "date";
    fechaNacimientoInput.id = `fechaNacimientoConductor${conductorCounter}`;
    fechaNacimientoInput.name = `fechaNacimientoConductor${conductorCounter}`;
    conductorFieldset.appendChild(fechaNacimientoLabel);
    conductorFieldset.appendChild(fechaNacimientoInput);

    // Género del Conductor
    const generoLabel = document.createElement("label");
    generoLabel.textContent = "Género del Conductor:";
    const generoSelect = document.createElement("select");
    generoSelect.id = `generoConductor${conductorCounter}`;
    generoSelect.name = `generoConductor${conductorCounter}`;

    const generoOpciones = ["Masculino", "Femenino", "Otro"];
    generoOpciones.forEach((opcion) => {
      const generoOpcion = document.createElement("option");
      generoOpcion.value = opcion;
      generoOpcion.textContent = opcion;
      generoSelect.appendChild(generoOpcion);
    });

    conductorFieldset.appendChild(generoLabel);
    conductorFieldset.appendChild(generoSelect);

    conductoresAdicionales.appendChild(conductorFieldset);
  }

  if (conductorCounter >= 3) {
    agregarConductorBtn.disabled = true;
  }
});
