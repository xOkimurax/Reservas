import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { serviciosApi, reservasApi } from '../services/api';

const NuevaReservaModal = ({ isOpen, onClose, onReservaCreada }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      cargarServicios();
    }
  }, [isOpen]);

  const cargarServicios = async () => {
    try {
      setLoadingServicios(true);
      const response = await serviciosApi.obtenerServicios();
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setLoadingServicios(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const reservaData = {
        nombre: data.nombreCliente,
        telefono: data.telefonoCliente,
        email: data.emailCliente,
        idServicio: parseInt(data.idServicio),
        fecha: data.fecha,
        hora: data.hora,
        observaciones: data.observaciones || ''
      };

      await reservasApi.crearReserva(reservaData);
      toast.success('Reserva creada exitosamente');
      reset();
      onClose();
      if (onReservaCreada) {
        onReservaCreada();
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Reserva" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-900">Información del Cliente</h4>
            
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                className={`input-field ${errors.nombreCliente ? 'border-error-500' : ''}`}
                placeholder="Juan Pérez"
                {...register('nombreCliente', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.nombreCliente && (
                <p className="text-error-500 text-sm mt-1">{errors.nombreCliente.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                className={`input-field ${errors.telefonoCliente ? 'border-error-500' : ''}`}
                placeholder="+1234567890"
                {...register('telefonoCliente', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[+]?[0-9\s\-()]{8,15}$/,
                    message: 'Formato de teléfono inválido'
                  }
                })}
              />
              {errors.telefonoCliente && (
                <p className="text-error-500 text-sm mt-1">{errors.telefonoCliente.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                className={`input-field ${errors.emailCliente ? 'border-error-500' : ''}`}
                placeholder="juan@email.com"
                {...register('emailCliente', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.emailCliente && (
                <p className="text-error-500 text-sm mt-1">{errors.emailCliente.message}</p>
              )}
            </div>
          </div>

          {/* Información de la Reserva */}
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary-900">Información de la Reserva</h4>
            
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Servicio *
              </label>
              {loadingServicios ? (
                <div className="input-field flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Cargando servicios...</span>
                </div>
              ) : (
                <select
                  className={`input-field ${errors.idServicio ? 'border-error-500' : ''}`}
                  {...register('idServicio', {
                    required: 'Debe seleccionar un servicio'
                  })}
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.idServicio} value={servicio.idServicio}>
                      {servicio.nombreServicio} - ₲{new Intl.NumberFormat('es-PY').format(servicio.precio)}
                    </option>
                  ))}
                </select>
              )}
              {errors.idServicio && (
                <p className="text-error-500 text-sm mt-1">{errors.idServicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                className={`input-field ${errors.fecha ? 'border-error-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
                {...register('fecha', {
                  required: 'La fecha es obligatoria'
                })}
              />
              {errors.fecha && (
                <p className="text-error-500 text-sm mt-1">{errors.fecha.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                className={`input-field ${errors.hora ? 'border-error-500' : ''}`}
                {...register('hora', {
                  required: 'La hora es obligatoria'
                })}
              />
              {errors.hora && (
                <p className="text-error-500 text-sm mt-1">{errors.hora.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Observaciones
              </label>
              <textarea
                className="input-field resize-none"
                rows="3"
                placeholder="Observaciones adicionales..."
                {...register('observaciones')}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </div>
            ) : (
              'Crear Reserva'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NuevaReservaModal;