function LOGI() {
  let usermin = document.getElementById("user").value;
  let user = usermin.toUpperCase();
  let pass = document.getElementById("pass").value;

  if (user == "GRD1" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else if (user == "SAT2" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else if (user == "SAT3" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else if (user == "SAT4" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else if (user == "GRT2" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else if (user == "PLT2" && pass == "1234") {
    window.location = "LOGON1.HTML?user=" + user;
  } else {
    alert("Usuario o contraseña son incorrectos");
  }
}

let rowData = [];

window.onload = function () {
  let params = new URLSearchParams(window.location.search);
  let user = params.get("user");

  let selectElement = document.getElementById("tienda");
  selectElement.value = user;
  if (user) {
    selectElement.disabled = true;
  }

  const codebarInput = document.getElementById("codebar");

  codebarInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = this.value;
      addRow(barcode);
      this.value = "";
    }
  });

  let cargarPedidoButton = document.querySelector(
    '.button[onclick="generateExcel()"]'
  );
  if (!user) {
    cargarPedidoButton.disabled = true;
  }

  // Obtener todos los campos de entrada
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      // Comprobar si alguno de los campos de entrada está vacío
      const anyInputEmpty = [...inputs].some(
        (input) => input.value === "" && input.id !== "barcode"
      );

      // Deshabilitar o habilitar el botón según si alguno de los campos de entrada está vacío o no
      cargarPedidoButton.disabled = anyInputEmpty;
    });
  });

  // Deshabilitar el botón inicialmente
  cargarPedidoButton.disabled = true;
};

function addRow(barcode) {
  const tableBody = document.querySelector("#dynamicTable tbody");
  const existingRow = Array.from(tableBody.querySelectorAll("tr")).find(
    (row) => row.dataset.barcode === barcode
  );

  if (existingRow) {
    const quantityCell = existingRow.querySelector(".quantity-cell");
    quantityCell.textContent = Number(quantityCell.textContent) + 1;
  } else {
    const newRow = tableBody.insertRow();
    newRow.dataset.barcode = barcode;

    const nameCell = newRow.insertCell(0);
    const quantityCell = newRow.insertCell(1);
    const deleteCell = newRow.insertCell(2);

    nameCell.textContent = barcode;
    nameCell.className = "barcode-cell";
    quantityCell.textContent = "1";
    quantityCell.className = "quantity-cell";
    deleteCell.innerHTML = '<button class="delete-button">X</button>';

    deleteCell.querySelector(".delete-button").onclick = function () {
      this.parentElement.parentElement.remove();
    };

    rowData.push({
      Código: barcode,
      Cantidad: "1",
      Por: "",
      Marca: "",
    });
  }
  const buttons = document.querySelectorAll(".button");
  const addButton = buttons[0]; // Índice 0 para el primer botón
  addButton.scrollIntoView({ behavior: "smooth", block: "end" });
}

function generateExcel() {
  let params = new URLSearchParams(window.location.search);
  let user = params.get("user");
  const tableRows = document.querySelectorAll("#dynamicTable tbody tr");

  // Obtener los valores de los campos de entrada "por" y "marca"
  const porValue = document.getElementById("por").value;
  const marcaValue = document.getElementById("marca").value;

  tableRows.forEach((row, index) => {
    const barcodeCell = row.querySelector(".barcode-cell");
    const quantityCell = row.querySelector(".quantity-cell");

    // Utilizar textContent en lugar de value para obtener el texto de las celdas
    const barcode = barcodeCell.textContent;
    const quantity = quantityCell.textContent;

    // Actualizar rowData con los valores de las celdas
    rowData[index] = {
      Código: barcode,
      Cantidad: quantity,
      Por: porValue,
      Marca: marcaValue,
    };
  });

  // Crear una hoja de cálculo
  const ws = XLSX.utils.json_to_sheet(rowData);

  // Crear un libro de Excel
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Guardar el archivo Excel el el servidor
  axios
    .post("https://localhost:3001/save-excel", {
      data: rowData,
      user: user,
      marca: marcaValue,
      por: porValue,
    })
    .then(() => {
      alert("Se ha cargado el pedido exitosamente!");
      console.log("Se ha cargado el pedido exitosamente!");
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

      // Vaciar rowData
      rowData = [];
      let cargarPedidoButton = document.querySelector(
        '.button[onclick="generateExcel()"]'
      );
      cargarPedidoButton.disabled = true;
    })
    .catch((err) => {
      alert("Hubo un error al cargar el pedido");
      console.error(err);
    });
}
