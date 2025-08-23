import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ArrowRightOnRectangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminDashboard = () => {
  const [reservas, setReservas] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    cargarReservas();
  }, [user, navigate, filtros]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.fecha) params.fecha = filtros.fecha;
      
      const response = await reservasApi.obtenerReservas(params);
      setReservas(response.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (id) => {
    setUpdating(id);
    try {
      await reservasApi.confirmarReserva(id);
      toast.success('Reserva confirmada exitosamente');
      cargarReservas();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      toast.error('Error al confirmar la reserva');
    } finally {
      setUpdating(null);
    }
  };

  const handleRechazar = async (id) => {
    setUpdating(id);
    try {
      await reservasApi.rechazarReserva(id);
      toast.success('Reserva rechazada');
      cargarReservas();
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      toast.error('Error al rechazar la reserva');
    } finally {
      setUpdating(null);
    }
  };


  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Rechazada':
        return 'bg-red-100 text-red-800';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearFecha = (fecha) => {
    try {
      return format(parseISO(fecha), "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return fecha;
    }
  };

  const obtenerResumenEstados = () => {
    const resumen = reservas.reduce((acc, reserva) => {
      acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
      return acc;
    }, {});
    return resumen;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const resumen = obtenerResumenEstados();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600">Bienvenido, {user?.nombre}</p>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Resumen */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {resumen.Pendiente || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {resumen.Confirmada || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {resumen.Rechazada || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 font-bold text-sm">T</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-600">
                  {reservas.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="input-field"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Rechazada">Rechazada</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                className="input-field"
                value={filtros.fecha}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ estado: '', fecha: '' })}
                className="btn-secondary"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Reservas */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">
            Reservas ({reservas.length})
          </h3>
          
          {reservas.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No hay reservas que mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Servicio</th>
                    <th className="text-left py-3 px-4">Fecha y Hora</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((reserva) => (
                    <tr key={reserva.idReserva} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{reserva.nombreCliente}</p>
                          <p className="text-sm text-gray-600">{reserva.telefonoCliente}</p>
                          <p className="text-sm text-gray-600">{reserva.emailCliente}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{reserva.nombreServicio}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{formatearFecha(reserva.fecha)}</p>
                          <p className="text-sm text-gray-600">{reserva.hora}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/reserva/${reserva.idReserva}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          
                          {reserva.estado === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => handleConfirmar(reserva.idReserva)}
                                disabled={updating === reserva.idReserva}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => handleRechazar(reserva.idReserva)}
                                disabled={updating === reserva.idReserva}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;