// Definición de comunicaión con API
import config from "./config.js";
const http = config.http;
const server = config.server;
const port = config.port;
const endpointapi = config.endpointapi;

// Se define variable para almacenar los datos de la tabla para el excel
let Filas = [];
let imagenes = [];
let nFilas = 0;

//Funcion que se ejecuta al cargar la página
window.onload = function () {
  let params = new URLSearchParams(window.location.search);
  let TiendaParam = params.get("user");

  let InputTienda = document.getElementById("tienda");
  InputTienda.value = TiendaParam;
  if (TiendaParam) {
    InputTienda.disabled = true;
  }

  let cargarReporteButton = document.querySelector(
    '.button[onclick="generateExcel()"]'
  );
  let añadirFilaButton = document.querySelector('.button[onclick="addRow()"]');
  // Deshabilitar el botón si no hay un usuario
  if (!TiendaParam) {
    cargarReporteButton.disabled = true;
    añadirFilaButton.disabled = true;
  }

  // Obtener todos los campos de entrada
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      // Comprobar si alguno de los campos de entrada está vacío
      const anyInputEmpty = [...inputs].some((input) => input.value === "");

      // Deshabilitar o habilitar el botón según si alguno de los campos de entrada está vacío o no
      cargarReporteButton.disabled = anyInputEmpty;
      añadirFilaButton.disabled = anyInputEmpty;
    });
  });

  // Deshabilitar el botón inicialmente
  cargarReporteButton.disabled = true;
  añadirFilaButton.disabled = true;
};

//Función que añade nueva fila a la tabla
function addRow() {
  const refInput = document.getElementById("Referencia");
  const tableBody = document.querySelector("#dynamicTable tbody");

  const comentarioInput = document.getElementById("Comentario");
  const dañoInput = document.getElementById("Daño");
  // Obtén la imagen del input
  const imageInput = document.getElementById("imagen");

  if (
    refInput.value != "" ||
    dañoInput.value != "" ||
    imageInput.files.length != 0
  ) {
    nFilas++;
    const imageFile = imageInput.files[0];
    const imageUrl = URL.createObjectURL(imageFile);
    // Añadir la imagen al arreglo de imágenes
    imagenes.push(imageFile);

    // Crea fila nueva e inserta las columnas
    const newRow = tableBody.insertRow();
    const RefCell = newRow.insertCell(0);
    const DañoCell = newRow.insertCell(1);
    const imageCell = newRow.insertCell(2);
    const deleteCell = newRow.insertCell(3);

    // Añade la referencia y la razón del daño a la fila
    RefCell.textContent = refInput.value;
    RefCell.className = "barcode-cell";
    DañoCell.textContent = dañoInput.value;
    DañoCell.className = "quantity-cell";

    // Crea un nuevo elemento img y establece su atributo src a la URL de la imagen
    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    imageElement.style.width = "100px"; // Establece el ancho de la imagen
    imageElement.style.height = "100px"; // Establece la altura de la imagen
    imageCell.appendChild(imageElement); // Añade el elemento img a la celda de la imagen

    deleteCell.innerHTML = '<button class="delete-button">X</button>';

    deleteCell.querySelector(".delete-button").onclick = function () {
      this.parentElement.parentElement.remove();
    };
    const buttons = document.querySelectorAll(".button");
    const addButton = buttons[0]; // Índice 0 para el primer botón
    addButton.scrollIntoView({ behavior: "smooth", block: "end" });

    // Añade la fila a la lista de filas
    Filas.push({
      No: nFilas,
      Referencia: refInput.value,
      Daño: dañoInput.value,
      Comentario: comentarioInput.value,
    });

    // Vacía los inputs después de añadir la fila
    imageInput.value = "";
    refInput.value = "";
    dañoInput.value = "";
    comentarioInput.value = "";
  }
}

//Función que genera el archivo excel
function generateExcel() {
  addRow();
  let params = new URLSearchParams(window.location.search);
  let TiendaParam = params.get("user");

  // Crear un objeto FormData
  let formData = new FormData();

  // Añadir los datos y la tienda al objeto FormData
  formData.append("data", JSON.stringify(Filas));
  formData.append("Tienda", TiendaParam);

  // Añadir cada imagen al objeto FormData
  imagenes.forEach((imagen, index) => {
    formData.append(`Imagen${index}`, imagen);
  });

  console.log(Filas, TiendaParam);
  // Enviar el objeto FormData al servidor backend mediante una petición POST
  axios
    .post(http + server + ":" + port + endpointapi, formData)
    .then(() => {
      alert("Se ha cargado el reporte de daños exitosamente!");
      console.log("Se ha cargado el reporte de daños exitosamente!");
      // Borrar todos los valores de los campos de entrada
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        if (input.id !== "tienda") {
          input.value = "";
        }
      });
      // Vaciar el contenido de la tabla
      const tableBody = document.querySelector("#dynamicTable tbody");
      while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
      }

      // Vaciar Filas e imagenes
      Filas = [];
      imagenes = [];
      nFilas = 0;
      let cargarReporteButton = document.querySelector(
        '.button[onclick="generateExcel()"]'
      );
      cargarReporteButton.disabled = true;
    })
    .catch((err) => {
      alert("Hubo un error al cargar el pedido");
      console.error(err);
    });
}

window.generateExcel = generateExcel;
window.addRow = addRow;