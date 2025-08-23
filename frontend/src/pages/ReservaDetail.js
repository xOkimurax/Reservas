import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservaDetail = () => {
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    cargarReserva();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const cargarReserva = async () => {
    try {
      setLoading(true);
      const response = await reservasApi.obtenerReservaPorId(id);
      setReserva(response.data);
    } catch (error) {
      console.error('Error al cargar reserva:', error);
      toast.error('Error al cargar la reserva');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setUpdating(true);
    try {
      await reservasApi.confirmarReserva(id);
      toast.success('Reserva confirmada exitosamente');
      cargarReserva();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      toast.error('Error al confirmar la reserva');
    } finally {
      setUpdating(false);
    }
  };

  const handleRechazar = async () => {
    setUpdating(true);
    try {
      await reservasApi.rechazarReserva(id);
      toast.success('Reserva rechazada');
      cargarReserva();
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      toast.error('Error al rechazar la reserva');
    } finally {
      setUpdating(false);
    }
  };


  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatearFecha = (fecha) => {
    try {
      return format(parseISO(fecha), "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reserva no encontrada
          </h2>
          <Link to="/admin/dashboard" className="btn-primary">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/admin/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al Dashboard
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detalle de Reserva #{reserva.idReserva}
              </h1>
              <p className="text-gray-600">
                Creada el {format(parseISO(reserva.creadoEn), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-lg border ${getEstadoColor(reserva.estado)}`}>
              <span className="font-semibold">{reserva.estado}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información del Cliente */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{reserva.nombreCliente}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{reserva.telefonoCliente}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{reserva.emailCliente}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Reserva */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Detalles de la Reserva
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicio</p>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <p className="font-semibold text-primary-900">{reserva.nombreServicio}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-medium">{formatearFecha(reserva.fecha)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Hora</p>
                      <p className="font-medium">{reserva.hora}</p>
                    </div>
                  </div>
                </div>
                
                {reserva.observaciones && (
                  <div>
                    <div className="flex items-start mb-2">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Observaciones</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-700">{reserva.observaciones}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de Acciones */}
          <div>
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold mb-6">Acciones</h3>
              
              <div className="space-y-3">
                {reserva.estado === 'Pendiente' && (
                  <>
                    <button
                      onClick={handleConfirmar}
                      disabled={updating}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      {updating ? 'Confirmando...' : 'Confirmar Reserva'}
                    </button>
                    
                    <button
                      onClick={handleRechazar}
                      disabled={updating}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      {updating ? 'Rechazando...' : 'Rechazar Reserva'}
                    </button>
                  </>
                )}
                
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    ID de Reserva: {reserva.idReserva}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaDetail;