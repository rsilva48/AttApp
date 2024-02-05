const express = require("express");
const cors = require("cors");
const winston = require('winston');
const bodyParser = require("body-parser");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const https = require("https");
// Middleware para subir archivos de tipo form-data
const multer = require("multer");
const upload = multer();
const CONFIG = require("./config");

const app = express();

// Configuración de CORS
const HTTP = CONFIG.HTTP;
const HTTPS = CONFIG.HTTPS;
//Configuracion de puertos y directorios
const HTTP_SERVER_PORT = CONFIG.HTTP_SERVER_PORT;
const HTTPS_SERVER_PORT = CONFIG.HTTPS_SERVER_PORT;
const PedidosTestersDir = CONFIG.PedidosTestersDir;
const ReportesDalDir = CONFIG.ReportesDalDir;

// Crear el directorio de logs si no existe
const logDir = 'log';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Obtener la fecha actual y formatearla como una cadena
const date = new Date();
const formattedDate = `${date.getFullYear()}-${
  date.getMonth() + 1
}-${date.getDate()}`;

// Obtener el número de autoincremento
let num = 0;
while (fs.existsSync(path.join(logDir, `${formattedDate}-${num}.log`))) {
    num++;
}

// Crear el logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, `${formattedDate}-${num}.log`), level: 'info' }),
        new winston.transports.File({ filename: path.join(logDir, `${formattedDate}-${num}-error.log`), level: 'error' })
    ]
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Asume que tus archivos estáticos (html, css, js) están en una carpeta llamada 'public'

// Leer la clave (key.pem) y el certificado (cert.pem) en el mismo directorio que server.js
const key = fs.readFileSync(path.resolve(__dirname, "key.pem"));
const cert = fs.readFileSync(path.resolve(__dirname, "cert.pem"));

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
  console.log(
    formattedDate +
      " - Pedido " +
      marca +
      " de " +
      user +
      " solicitado por " +
      por +
      " guardado en el servidor"
  );
  logger.info(
    formattedDate +
      " - Pedido " +
      marca +
      " de " +
      user +
      " solicitado por " +
      por +
      " guardado en el servidor"
  );
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
    console.log(
      formattedDate +
        " - Reporte de daños de " +
        Tienda +
        " guardado en el servidor"
    );
    logger.info(
      formattedDate +
        " - Reporte de daños de " +
        Tienda +
        " guardado en el servidor"
    );
  } catch (error) {
    console.error(error);
    logger.error(error);
    res.status(500).send("Hubo un error al procesar el reporte");
  }
});


//Frontend alojado en el servidor
app.get("/LOGON1.HTML", (req, res) => {
  res.sendFile(path.join(__dirname, "public/LOGON1.HTML"));
});

if (HTTP) {
  app.listen(HTTP_SERVER_PORT, () =>
    console.log("Servidor HTTP ejecutandose en el puerto " + HTTP_SERVER_PORT),
    logger.info("Servidor HTTP ejecutandose en el puerto " + HTTP_SERVER_PORT)
  );
}

// Crear el servidor HTTPS si esta habilitada en la constante HTTPS
if (HTTPS) {
  const server = https.createServer({ key, cert }, app);

  // Escuchar en el puerto 8443
  server.listen(HTTPS_SERVER_PORT, () =>
    console.log("Servidor HTTPS ejecutandose en el puerto " + HTTPS_SERVER_PORT),
    logger.info("Servidor HTTPS ejecutandose en el puerto " + HTTPS_SERVER_PORT)
  );
}
