import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { serviciosApi, reservasApi } from '../services/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ReservaForm = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const response = await serviciosApi.obtenerServicios();
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar los servicios');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await reservasApi.crearReserva(data);
      toast.success('Reserva creada exitosamente. Te contactaremos pronto!');
      reset();
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error al crear reserva:', error);
      toast.error('Error al crear la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Mínimo mañana
    return hoy.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nueva Reserva
          </h1>
          <p className="text-gray-600">
            Completa el formulario para programar tu cita
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Personal
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                    placeholder="Tu nombre completo"
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: {
                        value: 2,
                        message: 'El nombre debe tener al menos 2 caracteres'
                      }
                    })}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    className={`input-field ${errors.telefono ? 'border-red-500' : ''}`}
                    placeholder="Ej: +57 300 123 4567"
                    {...register('telefono', {
                      required: 'El teléfono es obligatorio',
                      pattern: {
                        value: /^[\d\s+()-]+$/,
                        message: 'Formato de teléfono inválido'
                      }
                    })}
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="tu@email.com"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Información de la Reserva */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles de la Reserva
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio *
                </label>
                <select
                  className={`input-field ${errors.idServicio ? 'border-red-500' : ''}`}
                  {...register('idServicio', {
                    required: 'Debes seleccionar un servicio'
                  })}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.idServicio} value={servicio.idServicio}>
                      {servicio.nombreServicio} 
                      {servicio.precio && ` - $${servicio.precio}`}
                      {servicio.duracionMinutos && ` (${servicio.duracionMinutos} min)`}
                    </option>
                  ))}
                </select>
                {errors.idServicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.idServicio.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    min={obtenerFechaMinima()}
                    className={`input-field ${errors.fecha ? 'border-red-500' : ''}`}
                    {...register('fecha', {
                      required: 'La fecha es obligatoria'
                    })}
                  />
                  {errors.fecha && (
                    <p className="text-red-500 text-sm mt-1">{errors.fecha.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora *
                  </label>
                  <select
                    className={`input-field ${errors.hora ? 'border-red-500' : ''}`}
                    {...register('hora', {
                      required: 'La hora es obligatoria'
                    })}
                  >
                    <option value="">Selecciona una hora</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                  {errors.hora && (
                    <p className="text-red-500 text-sm mt-1">{errors.hora.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows="3"
                  className="input-field"
                  placeholder="Información adicional (opcional)"
                  {...register('observaciones')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary text-lg px-8 py-3 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creando reserva...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservaForm;