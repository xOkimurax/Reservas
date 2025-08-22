import React, { useState, useEffect } from 'react';
import { usuariosApi } from '../services/api';
import toast from 'react-hot-toast';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const UsuarioModal = ({ isOpen, onClose, onUsuarioGuardado, usuario = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'EMPLEADO',
    departamento: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      cargarRoles();
      if (usuario) {
        setFormData({
          nombre: usuario.nombre || '',
          email: usuario.email || '',
          telefono: usuario.telefono || '',
          password: '',
          rol: usuario.rol || 'EMPLEADO',
          departamento: usuario.departamento || '',
          activo: usuario.activo !== undefined ? usuario.activo : true
        });
      } else {
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          password: '',
          rol: 'EMPLEADO',
          departamento: '',
          activo: true
        });
      }
    }
  }, [isOpen, usuario]);

  const cargarRoles = async () => {
    try {
      const response = await usuariosApi.obtenerRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let dataToSend = { ...formData };
      
      if (usuario && (!dataToSend.password || dataToSend.password.trim() === '')) {
        delete dataToSend.password;
      }

      if (usuario) {
        await usuariosApi.actualizarUsuario(usuario.idUsuario, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await usuariosApi.crearUsuario(dataToSend);
        toast.success('Usuario creado exitosamente');
      }
      onUsuarioGuardado();
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-bold text-secondary-900">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: juan@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: 0981-123456"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              <LockClosedIcon className="w-4 h-4 inline mr-1" />
              Contraseña {!usuario && '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder={usuario ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
              required={!usuario}
              minLength={usuario ? 0 : 6}
            />
            {usuario && (
              <p className="text-xs text-secondary-500 mt-1">
                Dejar vacío para mantener la contraseña actual
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              Rol *
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="input-field"
              required
            >
              {roles.map((rol) => (
                <option key={rol.value} value={rol.value}>
                  {rol.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
              Departamento
            </label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Atención al Cliente, Administración"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 bg-secondary-100 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label className="ml-2 text-sm font-medium text-secondary-700">
              Usuario activo
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                usuario ? 'Actualizar' : 'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioModal;