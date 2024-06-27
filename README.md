# Backend PedidosApp

## Intalación y ejecución

### Instalar dependencias

```
npm install
```

### Ejecutar backend utilizando npm

```
npm start
```

### Ejecutar backend utilizando Node.js

```
node server.js
```

## Configuración

### Archivo de configuración CORS y Express

Renombrar el archivo "config_example.json" a "config.json" y editar el archivo de configuración según sea necesario.

## Acciones de GitHub

Crear en el Repo de Github las variables secretas para las acciones:

- Settings

- Secrets and variables

- Actions

- Repository secrets: New repository secret

- Crear 3 secrets codificadas en base64

  - CERT_PEM: Contenido de cert.pem
  - KEY_PEM: Contenido de key.pem
  - CONFIG_JSON: Contenido de config.json

### Ejecutar acciones de GitHub Localmente

- Instalar [act](https://nektosact.com/installation/index.html)
- Crear archivo .secrets (copiar .secrets_example)
- Ingresar los secrets codificadas en base64 en el archivo
- Ejecutar el comando:

```
npm run act
```
