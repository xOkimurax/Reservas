-- Crear base de datos
CREATE DATABASE reservas_db;

-- Usar la base de datos
\c reservas_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente',
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    departamento VARCHAR(100),
    updated_at TIMESTAMP(6),
    activo BOOLEAN DEFAULT true
);

-- Tabla de servicios
CREATE TABLE servicios (
    id_servicio BIGSERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    precio INTEGER, -- Cambiado a INTEGER para manejar guaraníes
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 60,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE reservas (
    id_reserva BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES usuarios(id_usuario),
    id_servicio BIGINT REFERENCES servicios(id_servicio),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Rechazada', 'Finalizada')),
    observaciones TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_gestor BIGINT REFERENCES usuarios(id_usuario)
);

-- Tabla de permisos de usuario (nueva tabla)
CREATE TABLE permisos_usuario (
    id_permiso BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    modulo VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, modulo)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar fecha de modificación
CREATE TRIGGER update_reservas_modtime 
    BEFORE UPDATE ON reservas 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, telefono, email, rol, password, activo) 
VALUES ('Administrador', '1234567890', 'admin@reservas.com', 'ADMINISTRADOR', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

-- Insertar permisos completos para el administrador
INSERT INTO permisos_usuario (id_usuario, modulo, activo) VALUES
(1, 'dashboard', true),
(1, 'reservas', true),
(1, 'gestion-reservas', true),
(1, 'servicios', true),
(1, 'usuarios', true),
(1, 'clientes', true),
(1, 'reportes', true),
(1, 'configuracion', true);

-- Insertar servicios de ejemplo con precios en guaraníes
INSERT INTO servicios (nombre_servicio, precio, descripcion, duracion_minutos) VALUES
('Consulta General', 250000, 'Consulta médica general', 30),
('Limpieza Dental', 400000, 'Limpieza y revisión dental', 45),
('Corte de Cabello', 125000, 'Corte de cabello básico', 30),
('Manicure', 75000, 'Manicure completo', 45),
('Masaje Relajante', 300000, 'Masaje de relajación', 60);

-- Comentarios sobre cambios importantes:
-- 1. Añadida tabla permisos_usuario para gestión de permisos granular
-- 2. Añadida columna id_usuario_gestor en reservas para rastrear quién gestiona cada reserva
-- 3. Añadidas columnas departamento, updated_at y activo en usuarios
-- 4. Cambiado tipo de precio de DECIMAL a INTEGER para manejar guaraníes
-- 5. Actualizados roles de usuario a: ADMINISTRADOR, SUPERVISOR, EMPLEADO, CLIENTE
-- 6. Añadidos índices y restricciones FK adicionales