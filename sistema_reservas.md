# 📌 Flujo Completo del Sistema de Reservas (Spring Boot + PostgreSQL Local)

------------------------------------------------------------------------

## 🛠 **Lenguaje y Tecnologías**

-   **Frontend (Cliente + Admin):**
    -   React.js (para cliente y panel admin)\
    -   TailwindCSS (estilos modernos)\
    -   React Router (navegación)\
    -   Axios (llamadas al backend)
-   **Backend (Servidor):**
    -   Java + **Spring Boot** (API REST principal)\
    -   Spring Web (endpoints REST)\
    -   Spring Data JPA (acceso a PostgreSQL)\
    -   Spring Security (login del administrador)
-   **Base de Datos:**
    -   **PostgreSQL local** (se puede migrar fácilmente a cloud
        después, como Heroku, Railway, Render).
-   **Notificaciones:**
    -   Botón que genera link de WhatsApp (`wa.me`) con mensaje
        prearmado → abre WhatsApp Web o app para enviar manualmente.

------------------------------------------------------------------------

## 🗄 **Base de Datos (PostgreSQL Local)**

### Tablas principales:

**Usuarios**\
- id_usuario (PK)\
- nombre\
- telefono\
- email\
- rol (cliente / admin)

**Reservas**\
- id_reserva (PK)\
- id_usuario (FK)\
- servicio\
- fecha\
- hora\
- estado (Pendiente, Confirmada, Rechazada, Finalizada)\
- creado_en

**Servicios**\
- id_servicio (PK)\
- nombre_servicio\
- precio (opcional)

------------------------------------------------------------------------

## 🖼 **Ventanas y Funcionalidad Detallada**

### 🔹 **1. Ventana de Inicio (Cliente)**

-   Pantalla simple con botón **"Reservar"**.\
-   Acceso al **Login de administrador**.

------------------------------------------------------------------------

### 🔹 **2. Ventana de Reserva (Cliente)**

-   Formulario:
    -   Nombre\
    -   Teléfono\
    -   Email\
    -   Selección de servicio\
    -   Selección de fecha y hora\
-   Botón **Confirmar Reserva**.\
-   Lógica:
    -   Se envía POST → `/api/reservas`\
    -   Spring Boot guarda en PostgreSQL con estado = **Pendiente**.

------------------------------------------------------------------------

### 🔹 **3. Ventana de Login (Admin)**

-   Login con **Spring Security** (usuario/contraseña).\
-   Autenticación contra tabla **Usuarios** (rol admin).

------------------------------------------------------------------------

### 🔹 **4. Panel de Administración (Admin)**

-   Lista de todas las reservas.\
-   Filtros:
    -   Por fecha\
    -   Por estado (Pendiente, Confirmada, etc.)\
    -   Por servicio\
-   Acciones:
    -   **Confirmar** → PUT `/api/reservas/{id}/confirmar`\
    -   **Rechazar** → PUT `/api/reservas/{id}/rechazar`\
    -   **WhatsApp** → Botón que abre link con mensaje personalizado.

------------------------------------------------------------------------

### 🔹 **5. Detalle de Reserva (Admin)**

-   Ver información de la reserva (cliente, servicio, fecha, estado).\
-   Botones:
    -   Confirmar\
    -   Rechazar\
    -   Enviar WhatsApp

------------------------------------------------------------------------

### 🔹 **6. Ventana de Reportes (Admin - opcional)**

-   Datos obtenidos desde API: `/api/reportes`\
-   Gráficos (Recharts o Chart.js) mostrando:
    -   Cantidad de reservas confirmadas por mes.\
    -   Servicios más usados.\
    -   Clientes más frecuentes.\
-   Botón para exportar a Excel o PDF.

------------------------------------------------------------------------

## 📱 **Ejemplo del Botón de WhatsApp**

Generado desde Spring Boot y enviado al frontend:

``` java
String mensaje = "Hola " + cliente.getNombre() +
    "! Tu reserva de " + reserva.getServicio() +
    " el " + reserva.getFecha() +
    " a las " + reserva.getHora() +
    " fue CONFIRMADA ✅";
String link = "https://wa.me/" + cliente.getTelefono() +
    "?text=" + URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
```

En el frontend aparecerá un botón con el `link`, al hacer clic abrirá
WhatsApp Web o App.

------------------------------------------------------------------------

## 🚀 **Despliegue**

-   **Frontend:**
    -   React en **Netlify** (gratis).\
-   **Backend:**
    -   Spring Boot en **Railway / Render / VPS / PC local**.\
    -   Conexión directa a PostgreSQL local o cloud.\
-   **BD:**
    -   PostgreSQL local (con opción a migrar a cloud en el futuro).

------------------------------------------------------------------------

✅ **Resumen actualizado:**\
- Se usará **Spring Boot + PostgreSQL local** como backend completo.\
- React (Netlify) como frontend.\
- Notificaciones por WhatsApp con links dinámicos.\
- Admin con login y reportes.\
- Proyecto **llamativo para LinkedIn** porque demuestra:\
- API REST real con Spring Boot.\
- Gestión de BD relacional (PostgreSQL).\
- Frontend moderno en React.\
- Integración práctica con WhatsApp.
