import express from "express";
import { auth } from "./auth.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import connection, { dbConfig } from "./db.js";
import bodyParser from "body-parser";
import bcryptjs from "bcryptjs";
import multer from "multer";
import methodOverride from "method-override";

dotenv.config({ path: "./.env" });

// Configura la ubicación donde se guardarán los archivos PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/PDF"); // Ruta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    // Obtén la extensión del archivo original
    const fileExtension = file.originalname.split(".").pop();

    // Genera un nombre de archivo único con la fecha y hora actual y la extensión del archivo
    const uniqueFileName = Date.now() + "-" + file.originalname;

    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static("public"));

app.use(bodyParser.json());

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public/HTML")));

// Configura EJS como motor de plantillas
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "public/EJS"));

app.use(
  cookieSession({
    name: "session",
    keys: ["tu_clave_secreta_aqui"],
    maxAge: 24 * 60 * 60 * 1000, // Tiempo de vida de la sesión en milisegundos (1 día en este caso)
  })
);

app.use(express.urlencoded({ extended: true }));

app.get("/", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/index.html");
  res.sendFile(indexPath);
});

app.get("/modificar-estado-poliza", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(
    __dirname,
    "public",
    "/HTML/modificar_estado_poliza.html"
  );
  res.sendFile(indexPath);
});

app.get("/modificar-poliza", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(
    __dirname,
    "public",
    "/HTML/modificar_poliza.html"
  );
  res.sendFile(indexPath);
});

app.get("/perfil-usuarioaB3dFXYZa", auth, (req, res) => {
  if (!req.session.username) {
    res.redirect("/login");
    return;
  }

  res.render("Perfil", { username: req.session.username.username });
});

app.get("/subir-archivos", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/subir_archivos.html");
  res.sendFile(indexPath);
});

app.get("/agregar-conductores", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/agregar_conductores.html");
  res.sendFile(indexPath);
});

app.get("/adicionar-facturacion", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/adicionar_datos_facturación.html");
  res.sendFile(indexPath);
});

app.get("/eliminar-conductores", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/eliminar_conductores.html");
  res.sendFile(indexPath);
});

app.get("/eliminar-archivos", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(
    __dirname,
    "public",
    "/HTML/eliminar_archivos.html"
  );
  res.sendFile(indexPath);
});

// Ruta para servir documentos PDF
app.get("/descargar-documento/:nombreDocumento", (req, res) => {
  const nombreDocumento = req.params.nombreDocumento;
  const rutaDocumento = path.join(
    __dirname,
    "public",
    "/PDF/",
    nombreDocumento
  );

  // Utiliza el módulo `express.static` para servir el archivo
  res.download(rutaDocumento, nombreDocumento, (err) => {
    if (err) {
      // Maneja errores, por ejemplo, enviando una respuesta de error al cliente.
      res.status(500).send("Error al descargar el documento");
    }
  });
});

app.get("/registeraB3dFXYZa", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/register.html");
  res.sendFile(indexPath);
});

app.get("/loginaB3dFXYZa", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/login.html");
  res.sendFile(indexPath);
});

app.get("/mostrar-datos/:numeroPolizaOVin", function (req, res) {
  const numeroPolizaOVin = req.params.numeroPolizaOVin;
  const isNumeroPoliza = /^\d+$/.test(numeroPolizaOVin);

  let query;
  let queryParams;

  if (isNumeroPoliza) {
    query = `
      SELECT *
      FROM Poliza AS P
      INNER JOIN Propietario AS Prop ON P.idPoliza = Prop.idPoliza
      INNER JOIN Conductores AS Cond ON P.idPoliza = Cond.idPoliza
      INNER JOIN Vehiculos AS Veh ON P.idPoliza = Veh.idPoliza
      LEFT JOIN Facturacion AS Fact ON P.idPoliza = Fact.idPoliza
      WHERE P.numeroPoliza = ?
      ORDER BY Fact.fechaFacturacion DESC
    `;
    queryParams = [numeroPolizaOVin];
  } else {
    query = `
      SELECT *
      FROM Poliza AS P
      INNER JOIN Propietario AS Prop ON P.idPoliza = Prop.idPoliza
      INNER JOIN Conductores AS Cond ON P.idPoliza = Cond.idPoliza
      INNER JOIN Vehiculos AS Veh ON P.idPoliza = Veh.idPoliza
      LEFT JOIN Facturacion AS Fact ON P.idPoliza = Fact.idPoliza
      WHERE Veh.vinVehiculo = ?
      ORDER BY Fact.fechaFacturacion DESC
    `;
    queryParams = [numeroPolizaOVin];
  }

  connection.query(query, queryParams, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error interno del servidor");
    } else if (result.length > 0) {
      const polizaData = {
        poliza: result[0],
        conductores: [],
        facturaciones: new Set(),
      };

      // Iterar sobre los resultados para obtener conductores y facturaciones
      result.forEach((row) => {
        // Conductores
        const conductor = {
          idConductor: row.idConductor,
          nombreConductor: row.nombreConductor,
          relacionConductor: row.relacionConductor,
          fechaNacimientoConductor: row.fechaNacimientoConductor,
          generoConductor: row.generoConductor,
        };

        // Agregar conductor al array solo si no está ya presente
        if (!polizaData.conductores.some((c) => c.idConductor === conductor.idConductor)) {
          polizaData.conductores.push(conductor);
        }

        // Facturaciones
        if (row.cantidadFacturacion !== null) {
          const facturacion = {
            cantidadFacturacion: row.cantidadFacturacion,
            fechaFacturacion: row.fechaFacturacion,
            archivo_pdf: row.archivo_pdf,
          };

          // Agregar facturación al conjunto (Set) para evitar duplicados
          polizaData.facturaciones.add(JSON.stringify(facturacion));
        }
      });

      // Convertir el conjunto de facturaciones a un array
      polizaData.facturaciones = Array.from(polizaData.facturaciones).map((facturacionString) =>
        JSON.parse(facturacionString)
      );

      // Mostrar información en la consola del servidor
      console.log("Datos de la póliza:", polizaData.poliza);
      console.log("Datos de conductores:", polizaData.conductores);
      console.log("Datos de facturaciones:", polizaData.facturaciones);

      res.render("mostrar_datos", { polizaData });
    } else {
      res.status(404).send("Póliza no encontrada");
    }
  });
});


app.post("/registrar", upload.single("archivo_pdf"), (req, res) => {
  const data = req.body;
  const pdfFilename = req.file.filename;

  try {
    // Primera consulta: Insertar en Poliza
    const queryPoliza = `
      INSERT INTO Poliza (estadoPoliza, numeroPoliza, fechaInicio, fechaFinalizacion)
      VALUES ('${req.body.estadoPoliza}', '${req.body.numeroPoliza}', '${req.body.fechaInicio}', '${req.body.fechaFinalizacion}');
    `;

    connection.query(queryPoliza, (err, resultPoliza) => {
      if (err) {
        console.error("Error al insertar en Poliza:", err);
        return res.status(500).send("Error al insertar en Poliza");
      }

      // Obtener el ID de la póliza recién insertada
      const polizaId = resultPoliza.insertId;

      // Segunda consulta: Insertar en Propietario
      const queryPropietario = `
        INSERT INTO Propietario (idPoliza, nombreCompleto, correoElectronico, telefono, direccionPostal, direccionGaraje)
        VALUES (${polizaId}, '${req.body.nombreCompleto}', '${req.body.correoElectronico}', '${req.body.telefono}', '${req.body.direccionPostal}', '${req.body.direccionGaraje}');
      `;

      connection.query(queryPropietario, (err, resultPropietario) => {
        if (err) {
          console.error("Error al insertar en Propietario:", err);
          return res.status(500).send("Error al insertar en Propietario");
        }

        // Tercera consulta: Insertar en Conductores (Conductor 1)
        const queryConductor1 = `
          INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
          VALUES (${polizaId}, '${req.body.nombreConductor1}', '${req.body.relacionConductor1}', '${req.body.fechaNacimientoConductor1}', '${req.body.generoConductor1}');
        `;

        connection.query(queryConductor1, (err, resultConductor1) => {
          if (err) {
            console.error("Error al insertar en Conductor 1:", err);
            return res.status(500).send("Error al insertar en Conductor 1");
          }

          // Cuarta consulta: Insertar en Vehiculos
          const queryVehiculo = `
            INSERT INTO Vehiculos (idPoliza, anoVehiculo, marcaVehiculo, modeloVehiculo, vinVehiculo, tipoCuerpoVehiculo, arrendamientoVehiculo)
            VALUES (${polizaId}, ${req.body.anoVehiculo}, '${req.body.marcaVehiculo}', '${req.body.modeloVehiculo}', '${req.body.vinVehiculo}', '${req.body.tipoCuerpoVehiculo}', '${req.body.arrendamientoVehiculo}');
          `;

          connection.query(queryVehiculo, (err, resultVehiculo) => {
            if (err) {
              console.error("Error al insertar en Vehiculo:", err);
              return res.status(500).send("Error al insertar en Vehiculo");
            }

            // Quinta consulta: Insertar en Facturacion
            const queryFacturacion = `
              INSERT INTO Facturacion (idPoliza, cantidadFacturacion, fechaFacturacion, archivo_pdf)
              VALUES (${polizaId}, ${req.body.cantidadFacturacion}, '${req.body.fechaFacturacion}', '${pdfFilename}');
            `;

            connection.query(queryFacturacion, (err, resultFacturacion) => {
              if (err) {
                console.error("Error al insertar en Facturacion:", err);
                return res.status(500).send("Error al insertar en Facturacion");
              }

              // Verificar si se proporcionaron datos para el segundo conductor
              if (req.body.nombreConductor2) {
                // Sexta consulta: Insertar en Conductores (Conductor 2)
                const queryConductor2 = `
                  INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
                  VALUES (${polizaId}, '${req.body.nombreConductor2}', '${req.body.relacionConductor2}', '${req.body.fechaNacimientoConductor2}', '${req.body.generoConductor2}');
                `;

                connection.query(queryConductor2, (err, resultConductor2) => {
                  if (err) {
                    console.error("Error al insertar en Conductor 2:", err);
                    return res
                      .status(500)
                      .send("Error al insertar en Conductor 2");
                  }

                  // Verificar si se proporcionaron datos para el tercer conductor
                  if (req.body.nombreConductor3) {
                    // Séptima consulta: Insertar en Conductores (Conductor 3)
                    const queryConductor3 = `
                      INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
                      VALUES (${polizaId}, '${req.body.nombreConductor3}', '${req.body.relacionConductor3}', '${req.body.fechaNacimientoConductor3}', '${req.body.generoConductor3}');
                    `;

                    connection.query(
                      queryConductor3,
                      (err, resultConductor3) => {
                        if (err) {
                          console.error(
                            "Error al insertar en Conductor 3:",
                            err
                          );
                          return res
                            .status(500)
                            .send("Error al insertar en Conductor 3");
                        }

                        console.log(
                          "Datos registrados con éxito en la base de datos"
                        );
                        res.status(200).send("Datos registrados con éxito");
                      }
                    );
                  } else {
                    console.log(
                      "Datos registrados con éxito en la base de datos"
                    );
                    res.status(200).send("Datos registrados con éxito");
                  }
                });
              } else {
                console.log("Datos registrados con éxito en la base de datos");
                res.status(200).send("Datos registrados con éxito");
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.put("/poliza-modificar-estado/:numeroPoliza", function (req, res) {
  const numeroPoliza = req.params.numeroPoliza;
  const nuevoEstadoPoliza = req.body.estadoPoliza; // Supongo que enviarás el nuevo estado en el cuerpo de la solicitud

  // Realiza una consulta SQL para actualizar el estado de la póliza en la base de datos
  const query = `
    UPDATE Poliza
    SET estadoPoliza = ?
    WHERE numeroPoliza = ?;
  `;

  connection.query(query, [nuevoEstadoPoliza, numeroPoliza], (err, result) => {
    if (err) {
      console.error("Error al modificar el estado de la póliza:", err);
      res.status(500).send("Error al modificar el estado de la póliza");
    } else {
      res.status(200).send("Estado de la póliza modificado con éxito");
    }
  });
});

app.put("/modificar-poliza/:numeroPoliza", upload.single("archivo_pdf"), (req, res) => {
  const numeroPoliza = req.params.numeroPoliza;
  const pdfFilename = req.file ? req.file.filename : null;

  try {
    const updatesPoliza = []; // Actualizaciones en la tabla "Poliza"

    // Actualizar campos en la tabla "Poliza"
    if (req.body.estadoPoliza) {
      updatesPoliza.push(`estadoPoliza = '${req.body.estadoPoliza}'`);
    }
    if (req.body.fechaInicio) {
      updatesPoliza.push(`fechaInicio = '${req.body.fechaInicio}'`);
    }
    if (req.body.fechaFinalizacion) {
      updatesPoliza.push(`fechaFinalizacion = '${req.body.fechaFinalizacion}'`);
    }

    // Construir la consulta SQL para actualizar la tabla "Poliza"
    if (updatesPoliza.length > 0) {
      const updateQueryPoliza = `UPDATE Poliza SET ${updatesPoliza.join(", ")} WHERE numeroPoliza = '${numeroPoliza}'`;

      connection.query(updateQueryPoliza, (err, resultPoliza) => {
        if (err) {
          console.error("Error al actualizar la póliza:", err);
          return res.status(500).send("Error al actualizar la póliza");
        }

        console.log("Datos de póliza actualizados con éxito en la base de datos");
      });
    }

    // Actualizar campos en la tabla "Propietario"
    const updatesPropietario = [];
    if (req.body.nombreCompleto) {
      updatesPropietario.push(`nombreCompleto = '${req.body.nombreCompleto}'`);
    }
    if (req.body.correoElectronico) {
      updatesPropietario.push(`correoElectronico = '${req.body.correoElectronico}'`);
    }
    if (req.body.telefono) {
      updatesPropietario.push(`telefono = '${req.body.telefono}'`);
    }
    if (req.body.direccionPostal) {
      updatesPropietario.push(`direccionPostal = '${req.body.direccionPostal}'`);
    }
    if (req.body.direccionGaraje) {
      updatesPropietario.push(`direccionGaraje = '${req.body.direccionGaraje}'`);
    }

    // Construir la consulta SQL para actualizar la tabla "Propietario"
    if (updatesPropietario.length > 0) {
      const updateQueryPropietario = `UPDATE Propietario SET ${updatesPropietario.join(", ")} WHERE idPoliza = (SELECT idPoliza FROM Poliza WHERE numeroPoliza = '${numeroPoliza}')`;

      connection.query(updateQueryPropietario, (err, resultPropietario) => {
        if (err) {
          console.error("Error al actualizar el propietario:", err);
          return res.status(500).send("Error al actualizar el propietario");
        }

        console.log("Datos de propietario actualizados con éxito en la base de datos");
      });
    }

    // Actualizar campos en la tabla "Vehiculos"
    const updatesVehiculos = [];
    if (req.body.anoVehiculo) {
      updatesVehiculos.push(`anoVehiculo = '${req.body.anoVehiculo}'`);
    }
    if (req.body.marcaVehiculo) {
      updatesVehiculos.push(`marcaVehiculo = '${req.body.marcaVehiculo}'`);
    }
    if (req.body.modeloVehiculo) {
      updatesVehiculos.push(`modeloVehiculo = '${req.body.modeloVehiculo}'`);
    }
    if (req.body.vinVehiculo) {
      updatesVehiculos.push(`vinVehiculo = '${req.body.vinVehiculo}'`);
    }
    if (req.body.tipoCuerpoVehiculo) {
      updatesVehiculos.push(`tipoCuerpoVehiculo = '${req.body.tipoCuerpoVehiculo}'`);
    }
    if (req.body.arrendamientoVehiculo) {
      updatesVehiculos.push(`arrendamientoVehiculo = '${req.body.arrendamientoVehiculo}'`);
    }

    // Construir la consulta SQL para actualizar la tabla "Vehiculos"
    if (updatesVehiculos.length > 0) {
      const updateQueryVehiculos = `UPDATE Vehiculos SET ${updatesVehiculos.join(", ")} WHERE idPoliza = (SELECT idPoliza FROM Poliza WHERE numeroPoliza = '${numeroPoliza}')`;

      connection.query(updateQueryVehiculos, (err, resultVehiculos) => {
        if (err) {
          console.error("Error al actualizar los vehículos:", err);
          return res.status(500).send("Error al actualizar los vehículos");
        }

        console.log("Datos de vehículos actualizados con éxito en la base de datos");
      });
    }

    // Actualizar campos en la tabla "Facturacion"
    const updatesFacturacion = [];
    if (req.body.cantidadFacturacion) {
      updatesFacturacion.push(`cantidadFacturacion = '${req.body.cantidadFacturacion}'`);
    }
    if (req.body.fechaFacturacion) {
      updatesFacturacion.push(`fechaFacturacion = '${req.body.fechaFacturacion}'`);
    }
    if (pdfFilename !== null) {
      updatesFacturacion.push(`archivo_pdf = '${pdfFilename}'`);
    }

    // Construir la consulta SQL para actualizar la tabla "Facturacion"
    if (updatesFacturacion.length > 0) {
      const updateQueryFacturacion = `UPDATE Facturacion SET ${updatesFacturacion.join(", ")} WHERE idPoliza = (SELECT idPoliza FROM Poliza WHERE numeroPoliza = '${numeroPoliza}')`;

      connection.query(updateQueryFacturacion, (err, resultFacturacion) => {
        if (err) {
          console.error("Error al actualizar la facturación:", err);
          return res.status(500).send("Error al actualizar la facturación");
        }

        console.log("Datos de facturación actualizados con éxito en la base de datos");
      });
    }

    // Finalmente, responder al cliente
    res.status(200).send("Datos actualizados con éxito");
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/agregar-facturacion", upload.single("archivo_pdf"), (req, res) => {
  const numeroPoliza = req.body.numeroPoliza;
  const pdfFilename = req.file.filename;

  // Consulta SQL para obtener el idPoliza correspondiente al número de póliza
  const buscarPolizaQuery = "SELECT idPoliza FROM Poliza WHERE numeroPoliza = ?";
  
  connection.query(buscarPolizaQuery, [numeroPoliza], (err, results) => {
    if (err) throw err;

    const idPoliza = results[0].idPoliza;

    // Consulta SQL para contar la cantidad de datos de facturación asociados a la póliza
    const contarFacturacionQuery = "SELECT COUNT(*) AS cantidadFacturacion FROM Facturacion WHERE idPoliza = ?";
    
    connection.query(contarFacturacionQuery, [idPoliza], (err, results) => {
      if (err) throw err;

      const cantidadFacturacion = results[0].cantidadFacturacion;

      // Si hay 12 o más datos de facturación, elimina la más antigua
      if (cantidadFacturacion >= 12) {
        const eliminarFacturacionQuery = "DELETE FROM Facturacion WHERE idPoliza = ? ORDER BY fechaFacturacion ASC LIMIT 1";
        
        connection.query(eliminarFacturacionQuery, [idPoliza], (err) => {
          if (err) throw err;

          // Ahora puedes agregar la nueva facturación
          const agregarNuevaFacturacionQuery = "INSERT INTO Facturacion (idPoliza, cantidadFacturacion, fechaFacturacion, archivo_pdf) VALUES (?, ?, ?, ?)";
          
          connection.query(
            agregarNuevaFacturacionQuery,
            [idPoliza, req.body.cantidadFacturacion, req.body.fechaFacturacion, pdfFilename],
            (err) => {
              if (err) throw err;

              // Resto del código como antes...

              res.send("Facturación agregada correctamente.");
            }
          );
        });
      } else {
        // Si hay menos de 12 datos de facturación, simplemente agrega la nueva facturación
        const agregarNuevaFacturacionQuery = "INSERT INTO Facturacion (idPoliza, cantidadFacturacion, fechaFacturacion, archivo_pdf) VALUES (?, ?, ?, ?)";
        
        connection.query(
          agregarNuevaFacturacionQuery,
          [idPoliza, req.body.cantidadFacturacion, req.body.fechaFacturacion, pdfFilename],
          (err) => {
            if (err) throw err;

            // Resto del código como antes...

            res.send("Facturación agregada correctamente.");
          }
        );
      }
    });
  });
});


//Eliminar Poliza
app.delete("/eliminar/:numeroPoliza", (req, res) => {
  const numeroPoliza = req.params.numeroPoliza;

  // Primero, obtén el ID de la póliza que coincida con el número de póliza proporcionado
  const queryBuscarPoliza = `
    SELECT idPoliza FROM Poliza WHERE numeroPoliza = '${numeroPoliza}';
  `;

  connection.query(queryBuscarPoliza, (err, resultsBuscarPoliza) => {
    if (err) {
      console.error("Error al buscar la póliza:", err);
      res.status(500).send("Error interno del servidor");
    } else if (resultsBuscarPoliza.length === 0) {
      res.status(404).send("Póliza no encontrada");
    } else {
      const polizaId = resultsBuscarPoliza[0].idPoliza;

      // Luego, elimina los registros relacionados en las otras tablas
      const queryEliminarConductores = `DELETE FROM Conductores WHERE idPoliza = ${polizaId}`;
      const queryEliminarVehiculo = `DELETE FROM Vehiculos WHERE idPoliza = ${polizaId}`;
      const queryEliminarFacturacion = `DELETE FROM Facturacion WHERE idPoliza = ${polizaId}`;
      const queryEliminarPropietario = `DELETE FROM Propietario WHERE idPoliza = ${polizaId}`;
      const queryEliminarPoliza = `DELETE FROM Poliza WHERE idPoliza = ${polizaId}`;

      connection.query(queryEliminarConductores, (errConductores) => {
        if (errConductores) {
          console.error("Error al eliminar conductores:", errConductores);
          res.status(500).send("Error interno del servidor");
        } else {
          connection.query(queryEliminarVehiculo, (errVehiculo) => {
            if (errVehiculo) {
              console.error("Error al eliminar vehículo:", errVehiculo);
              res.status(500).send("Error interno del servidor");
            } else {
              connection.query(queryEliminarFacturacion, (errFacturacion) => {
                if (errFacturacion) {
                  console.error(
                    "Error al eliminar facturación:",
                    errFacturacion
                  );
                  res.status(500).send("Error interno del servidor");
                } else {
                  connection.query(
                    queryEliminarPropietario,
                    (errPropietario) => {
                      if (errPropietario) {
                        console.error(
                          "Error al eliminar propietario:",
                          errPropietario
                        );
                        res.status(500).send("Error interno del servidor");
                      } else {
                        connection.query(queryEliminarPoliza, (errPoliza) => {
                          if (errPoliza) {
                            console.error(
                              "Error al eliminar póliza:",
                              errPoliza
                            );
                            res.status(500).send("Error interno del servidor");
                          } else {
                            res.status(200).send("Datos eliminados con éxito");
                          }
                        });
                      }
                    }
                  );
                }
              });
            }
          });
        }
      });
    }
  });
});

app.delete("/eliminar-conductores/:numeroPoliza", (req, res) => {
  const numeroPoliza = req.params.numeroPoliza;

  // Primero, obtén el ID de la póliza que coincida con el número de póliza proporcionado
  const queryBuscarPoliza = `
    SELECT idPoliza FROM Poliza WHERE numeroPoliza = ?;
  `;

  connection.query(queryBuscarPoliza, [numeroPoliza], (err, resultsBuscarPoliza) => {
    if (err) {
      console.error("Error al buscar la póliza:", err);
      res.status(500).send("Error interno del servidor");
    } else if (resultsBuscarPoliza.length === 0) {
      res.status(404).send("Póliza no encontrada");
    } else {
      const polizaId = resultsBuscarPoliza[0].idPoliza;

      // Luego, elimina los registros de conductores relacionados a la póliza
      const queryEliminarConductores = `DELETE FROM Conductores WHERE idPoliza = ?`;

      connection.query(queryEliminarConductores, [polizaId], (errConductores) => {
        if (errConductores) {
          console.error("Error al eliminar conductores:", errConductores);
          res.status(500).send("Error interno del servidor");
        } else {
          res.status(200).send("Conductores eliminados con éxito");
        }
      });
    }
  });
});

app.post("/agregar-conductor", (req, res) => {
  const data = req.body;

  // Realiza una consulta SQL para buscar el idPoliza correspondiente al número de póliza
  const buscarPolizaQuery = "SELECT idPoliza FROM Poliza WHERE numeroPoliza = ?";
  
  connection.query(buscarPolizaQuery, [data.numeroPoliza], (err, results) => {
    if (err) {
      console.error("Error al buscar póliza:", err);
      res.status(500).send("Error al buscar póliza");
    } else {
      if (results.length > 0) {
        // Se encontró una póliza con el número de póliza proporcionado
        const idPoliza = results[0].idPoliza;

        // Realiza una consulta SQL para insertar el conductor relacionado a la póliza
        const insertarConductorQuery = `
          INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
          VALUES (?, ?, ?, ?, ?);
        `;

        connection.query(
          insertarConductorQuery,
          [
            idPoliza, // Utiliza el idPoliza obtenido de la consulta anterior
            data.nombreConductor,
            data.relacionConductor,
            data.fechaNacimientoConductor,
            data.generoConductor,
          ],
          (err, result) => {
            if (err) {
              console.error("Error al agregar conductor:", err);
              res.status(500).send("Error al agregar conductor");
            } else {
              res.status(200).send("Conductor agregado con éxito");
            }
          }
        );
      } else {
        res.status(404).send("Póliza no encontrada");
      }
    }
  });
});

app.post("/auth", async (req, res) => {
  const user = req.body.username;
  const pass = req.body.password;

  if (user && pass) {
    connection.query(
      "SELECT * FROM User WHERE username = ?",
      [user],
      async (error, results) => {
        if (error) {
          // Maneja el error de la consulta de base de datos, por ejemplo, enviando una respuesta de error.
          res.status(500).send("Error interno del servidor");
        } else {
          if (results && results.length > 0) {
            const isPasswordValid = await bcryptjs.compare(
              pass,
              results[0].password
            );

            if (isPasswordValid) {
              const userInfo = {
                id: results[0].id,
                username: results[0].username,
              };

              req.session.username = userInfo;
              req.session.loggedin = true;

              // Redirige al usuario a la página de perfil después del inicio de sesión
              res.redirect("/perfil-usuarioaB3dFXYZa");
            } else {
              // Autenticación fallida, redirige a la página de inicio de sesión con una query string
              res.redirect("/loginaB3dFXYZa?error=true");
            }
          } else {
            // No se encontró el usuario, redirige al usuario a la página de inicio de sesión
            res.redirect("/loginaB3dFXYZa");
          }
        }
      }
    );
  } else {
    res.send("Por favor ingrese un usuario y contraseña");
  }
});

//Registro de Usuarios
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const pass = req.body.password;
  let passwordHaash = await bcryptjs.hash(pass, 8);
  connection.query(
    "INSERT INTO User SET ?",
    { username: username, password: passwordHaash },
    async (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.send("REGISTRO EXITOSO");
      }
    }
  );
});

// La ruta de cierre de sesión
app.get("/logout", function (req, res) {
  req.session = null; // Destruye la sesión eliminándola
  res.redirect("/"); // Redirige al inicio u otra página después de cerrar sesión
});

// PETICIONES DEL PROYECTO

app.listen(PORT, function () {
  console.log(`Servidor en:  http://localhost:${PORT}`);
});
