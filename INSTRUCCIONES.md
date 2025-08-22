# 🚀 Instrucciones de Instalación y Ejecución

## Pasos para poner en funcionamiento el Sistema de Reservas

### 1. 📋 Prerrequisitos
Asegúrate de tener instalado:
- ✅ PostgreSQL (versión 12 o superior)
- ✅ Java 17 o superior
- ✅ Node.js 16 o superior
- ✅ Maven (opcional, el proyecto incluye wrapper)

### 2. 🗄️ Configurar Base de Datos

**Paso 2.1: Crear la base de datos**
```bash
# Abrir terminal PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE reservas_db;

# Salir de psql
\q
```

**Paso 2.2: Ejecutar el script de tablas**
```bash
# Desde la carpeta raíz del proyecto
psql -U postgres -d reservas_db -f database/schema.sql
```

**Nota:** Si tu usuario de PostgreSQL no es 'postgres' o tienes una contraseña diferente, ajusta las credenciales en `backend/src/main/resources/application.properties`

### 3. 🔧 Backend (Spring Boot)

**Paso 3.1: Navegar al directorio backend**
```bash
cd backend
```

**Paso 3.2: Ejecutar el backend**
```bash
# Opción 1: Usando el wrapper de Maven (recomendado)
./mvnw spring-boot:run

# Opción 2: Si tienes Maven instalado globalmente
mvn spring-boot:run
```

**Verificar que funciona:**
- El servidor debe iniciar en `http://localhost:8080`
- Deberías ver en la consola: "Started SistemaReservasApplication"

### 4. 🌐 Frontend (React)

**Paso 4.1: Abrir una nueva terminal y navegar al directorio frontend**
```bash
cd frontend
```

**Paso 4.2: Instalar dependencias**
```bash
npm install
```

**Paso 4.3: Iniciar la aplicación React**
```bash
npm start
```

**Verificar que funciona:**
- La aplicación debe abrir automáticamente en `http://localhost:3000`
- Deberías ver la página de inicio del Sistema de Reservas

### 5. 🧪 Probar el Sistema

**Paso 5.1: Probar como Cliente**
1. Ve a `http://localhost:3000`
2. Haz clic en "Hacer una Reserva"
3. Completa el formulario de reserva
4. Confirma la reserva

**Paso 5.2: Probar como Administrador**
1. Ve a `http://localhost:3000/admin/login`
2. Usa las credenciales:
   - Email: `admin@reservas.com`
   - Password: `admin123`
3. Explora el panel de administración
4. Prueba confirmar/rechazar reservas
5. Prueba el botón de WhatsApp

### 6. 🎯 URLs Importantes

- **Frontend (Cliente):** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login
- **Backend API:** http://localhost:8080/api
- **Servicios API:** http://localhost:8080/api/servicios
- **Reservas API:** http://localhost:8080/api/reservas

### 7. ⚠️ Solución de Problemas Comunes

**Problema: Backend no inicia**
```
Error: Could not connect to database
```
**Solución:** 
- Verifica que PostgreSQL esté ejecutándose
- Comprueba las credenciales en `application.properties`
- Asegúrate de que la base de datos `reservas_db` exista

**Problema: Frontend no conecta al backend**
```
Error: Network Error
```
**Solución:**
- Verifica que el backend esté ejecutándose en puerto 8080
- Revisa la configuración de proxy en `package.json`

**Problema: Puerto ya en uso**
```
Error: Port 3000 is already in use
```
**Solución:**
```bash
# Encontrar proceso que usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -ti :3000                # Mac/Linux

# Matar el proceso o usar otro puerto
npm start -- --port 3001
```

### 8. 🔐 Credenciales por Defecto

**Usuario Administrador:**
- Email: `admin@reservas.com`
- Password: `admin123`

### 9. 📁 Estructura de Archivos Final

Después de seguir las instrucciones, deberías tener:

```
Reservas/
├── backend/
│   ├── target/              (se crea al compilar)
│   └── ...
├── frontend/
│   ├── node_modules/        (se crea con npm install)
│   ├── build/               (se crea con npm run build)
│   └── ...
├── database/
└── README.md
```

### 10. 🎉 ¡Listo!

Si has seguido todos los pasos correctamente, deberías tener:

✅ PostgreSQL con base de datos configurada  
✅ Backend Spring Boot corriendo en puerto 8080  
✅ Frontend React corriendo en puerto 3000  
✅ Sistema completamente funcional  

**¡Ya puedes usar el Sistema de Reservas!**

### 11. 📞 Próximos Pasos

1. **Personalizar servicios:** Modifica los servicios en la base de datos
2. **Personalizar estilos:** Ajusta colores en `tailwind.config.js`
3. **Agregar más funcionalidades:** Extiende la API y frontend
4. **Deploy:** Prepara para producción siguiendo el README.md

---

🆘 **¿Problemas?** Revisa los logs en la consola de ambos servidores para identificar errores específicos.