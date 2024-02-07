const express = require("express");
const cors = require("cors");
const winston = require("winston");
const bodyParser = require("body-parser");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const https = require("https");
// Middleware para subir archivos de tipo form-data
const multer = require("multer");
const { log } = require("console");
const upload = multer();

let CONFIG,
  HTTP,
  HTTPS,
  HTTP_SERVER_PORT,
  HTTPS_SERVER_PORT,
  PedidosTestersDir,
  ReportesDalDir,
  key,
  cert;

// Crear el directorio de logs si no existe
const logDir = "log";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Obtener la fecha actual y formatearla como una cadena para logger y archivos xlsx generados
const date = new Date();
const formattedDate = `${date.getFullYear()}-${
  date.getMonth() + 1
}-${date.getDate()}`;

// Crear el logger
const logger = winston.createLogger({
  level: "info",
  //format: winston.format.json(),
  format: winston.format.printf(info => info.message),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, `${formattedDate}.log`),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(logDir, `${formattedDate}-error.log`),
      level: "error",
    }),
  ],
});

try {
  CONFIG = require("./config");
  // Configuración de CORS
  HTTP = CONFIG.HTTP;
  HTTPS = CONFIG.HTTPS;
  //Configuracion de puertos y directorios
  HTTP_SERVER_PORT = CONFIG.HTTP_SERVER_PORT;
  HTTPS_SERVER_PORT = CONFIG.HTTPS_SERVER_PORT;
  PedidosTestersDir = CONFIG.PedidosTestersDir;
  ReportesDalDir = CONFIG.ReportesDalDir;
} catch (error) {
  console.error(formattedDate + error);
  logger.error(formattedDate + error);
  const message =
    formattedDate + " - No se pudo cargar el archivo de configuración";
  console.error(message);
  logger.error(message);
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Asume que tus archivos estáticos (html, css, js) están en una carpeta llamada 'public'

// Leer la clave (key.pem) y el certificado (cert.pem) en el mismo directorio que server.js
try {
  key = fs.readFileSync(path.resolve(__dirname, "key.pem"));
  cert = fs.readFileSync(path.resolve(__dirname, "cert.pem"));
} catch (error) {
  console.error(formattedDate + error);
  logger.error(formattedDate + error);
  const message =
    formattedDate + " - No se pudo cargar el certificado y la clave";
  console.error(message);
  logger.error(message);
}

app.post("/save-excel", (req, res) => {
  const data = req.body.data;
  const user = req.body.user;
  const marca = req.body.marca;
  const por = req.body.por;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(
    workbook,
    path.join(
      PedidosTestersDir,
      `${formattedDate}-${user}-${marca}-${por}.xlsx`
    )
  );
  res.send("Excel guardado en el servidor!");
  const message =
    formattedDate +
    " - Pedido " +
    marca +
    " de " +
    user +
    " solicitado por " +
    por +
    " guardado en el servidor";
  console.log(message);
  logger.info(message);
});

app.post("/save-rdanos", upload.any(), (req, res) => {
  try {
    // Convierte la cadena JSON en un array de objetos JSON iterable
    const data = JSON.parse(req.body.data);
    const Tienda = req.body.Tienda;
    // Las imágenes se encuentran en req.files
    const imagenes = req.files;
    // Añade la información recibida en json a un archivo de Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte " + Tienda);

    // Guardar el archivo de Excel en el servidor
    XLSX.writeFile(
      workbook,
      path.join(ReportesDalDir, `${formattedDate}-${Tienda}.xlsx`)
    );

    // Guardar las imágenes en el directorio especificado
    imagenes.forEach((imagen, index) => {
      const imagePath = path.join(
        ReportesDalDir,
        `${formattedDate}-${Tienda}-Imagen${index + 1}${path.extname(
          imagen.originalname
        )}`
      );
      fs.writeFileSync(imagePath, imagen.buffer);
    });

    res.send("Reporte enviado correctamente!");
    const message =
      formattedDate +
      " - Reporte de daños de " +
      Tienda +
      " guardado en el servidor";
    console.log(message);
    logger.info(message);
  } catch (error) {
    console.error(formattedDate + error);
    logger.error(formattedDate + error);
    const message = formattedDate + " - Hubo un error al procesar el reporte";
    res.status(500).send("Hubo un error al procesar el reporte");
    console.error(message);
    logger.error(message);
  }
});

//Frontend alojado en el servidor
app.get("/LOGON1.HTML", (req, res) => {
  res.sendFile(path.join(__dirname, "public/LOGON1.HTML"));
});

if (HTTP) {
  app.listen(HTTP_SERVER_PORT, () => {
    const message =
      formattedDate +
      " - Servidor HTTP ejecutandose en el puerto " +
      HTTP_SERVER_PORT + ": (http://localhost:" + HTTP_SERVER_PORT + ")";
    console.log(message);
    logger.info(message);
  });
}

// Crear el servidor HTTPS si esta habilitada en la constante HTTPS
if (HTTPS) {
  const server = https.createServer({ key, cert }, app);

  // Escuchar en el puerto 8443
  server.listen(HTTPS_SERVER_PORT, () => {
    const message =
      formattedDate +
      " - Servidor HTTPS ejecutandose en el puerto " +
      HTTPS_SERVER_PORT + ": (https://localhost:" + HTTPS_SERVER_PORT + ")";
    console.log(message);
    logger.info(message);
  });
}
