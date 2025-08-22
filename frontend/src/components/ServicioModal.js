import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { serviciosApi } from '../services/api';

const ServicioModal = ({ isOpen, onClose, onServicioGuardado, servicio = null }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!servicio;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (isEditing && servicio) {
        // Cargar datos del servicio para editar
        setValue('nombreServicio', servicio.nombreServicio);
        setValue('precio', servicio.precio);
        setValue('descripcion', servicio.descripcion || '');
        setValue('duracionMinutos', servicio.duracionMinutos || 60);
        setValue('activo', servicio.activo);
      } else {
        // Valores por defecto para nuevo servicio
        reset({
          nombreServicio: '',
          precio: '',
          descripcion: '',
          duracionMinutos: 60,
          activo: true
        });
      }
    }
  }, [isOpen, isEditing, servicio, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const servicioData = {
        nombreServicio: data.nombreServicio,
        precio: parseInt(data.precio),
        descripcion: data.descripcion || null,
        duracionMinutos: parseInt(data.duracionMinutos),
        activo: data.activo
      };

      if (isEditing) {
        await serviciosApi.actualizarServicio(servicio.idServicio, servicioData);
        toast.success('Servicio actualizado exitosamente');
      } else {
        await serviciosApi.crearServicio(servicioData);
        toast.success('Servicio creado exitosamente');
      }

      reset();
      onClose();
      if (onServicioGuardado) {
        onServicioGuardado();
      }
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      toast.error('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-PY').format(numero);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'} 
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                className={`input-field ${errors.nombreServicio ? 'border-error-500' : ''}`}
                placeholder="Consulta médica, Corte de cabello..."
                {...register('nombreServicio', {
                  required: 'El nombre del servicio es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  },
                  maxLength: {
                    value: 100,
                    message: 'El nombre no puede exceder 100 caracteres'
                  }
                })}
              />
              {errors.nombreServicio && (
                <p className="text-error-500 text-sm mt-1">{errors.nombreServicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Precio (Guaraníes) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                  ₲
                </span>
                <input
                  type="number"
                  className={`input-field pl-8 ${errors.precio ? 'border-error-500' : ''}`}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  {...register('precio', {
                    required: 'El precio es obligatorio',
                    min: {
                      value: 0,
                      message: 'El precio debe ser mayor o igual a 0'
                    },
                    pattern: {
                      value: /^\d+$/,
                      message: 'Solo se permiten números enteros'
                    }
                  })}
                />
              </div>
              {errors.precio && (
                <p className="text-error-500 text-sm mt-1">{errors.precio.message}</p>
              )}
              <p className="text-xs text-secondary-500 mt-1">
                Precio en guaraníes sin decimales
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Duración (minutos) *
              </label>
              <input
                type="number"
                className={`input-field ${errors.duracionMinutos ? 'border-error-500' : ''}`}
                placeholder="60"
                min="1"
                max="480"
                {...register('duracionMinutos', {
                  required: 'La duración es obligatoria',
                  min: {
                    value: 1,
                    message: 'La duración debe ser al menos 1 minuto'
                  },
                  max: {
                    value: 480,
                    message: 'La duración no puede exceder 8 horas (480 minutos)'
                  }
                })}
              />
              {errors.duracionMinutos && (
                <p className="text-error-500 text-sm mt-1">{errors.duracionMinutos.message}</p>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Descripción
              </label>
              <textarea
                className="input-field resize-none"
                rows="4"
                placeholder="Descripción detallada del servicio..."
                {...register('descripcion', {
                  maxLength: {
                    value: 500,
                    message: 'La descripción no puede exceder 500 caracteres'
                  }
                })}
              />
              {errors.descripcion && (
                <p className="text-error-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                <div>
                  <p className="font-semibold text-secondary-900">Estado del Servicio</p>
                  <p className="text-sm text-secondary-600">
                    {isEditing ? 'Cambiar disponibilidad del servicio' : 'El servicio estará disponible para reservas'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    {...register('activo')}
                  />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-600"></div>
                </label>
              </div>
            </div>

            {/* Previsualización del precio */}
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
              <h4 className="text-sm font-semibold text-primary-900 mb-2">
                💰 Vista previa del precio
              </h4>
              <p className="text-lg font-bold text-primary-800">
                {formatearNumero(parseInt(register('precio').value) || 0)} Guaraníes
              </p>
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
                <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
              </div>
            ) : (
              <span>{isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ServicioModal;