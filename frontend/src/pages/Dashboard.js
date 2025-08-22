import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reservasApi, serviciosApi, usuariosApi } from '../services/api';
import toast from 'react-hot-toast';
import NuevaReservaModal from '../components/NuevaReservaModal';
import ServicioModal from '../components/ServicioModal';
import UsuarioModal from '../components/UsuarioModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentChartBarIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Sistema de permisos por rol
const PERMISSIONS = {
  ADMINISTRADOR: [
    'dashboard', 'reservas', 'gestion-reservas', 'servicios', 
    'usuarios', 'clientes', 'reportes', 'configuracion'
  ],
  SUPERVISOR: [
    'dashboard', 'reservas', 'gestion-reservas', 'servicios', 
    'clientes', 'reportes'
  ],
  EMPLEADO: [
    'dashboard', 'reservas', 'clientes'
  ]
};

// Módulos disponibles para asignar permisos
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Vista general del sistema' },
  { id: 'reservas', name: 'Reservas', description: 'Gestión de reservas' },
  { id: 'gestion-reservas', name: 'Gestión Detallada', description: 'Seguimiento de usuarios gestores' },
  { id: 'servicios', name: 'Servicios', description: 'Administración de servicios' },
  { id: 'usuarios', name: 'Usuarios', description: 'Gestión de usuarios y roles' },
  { id: 'clientes', name: 'Clientes', description: 'Administración de clientes' },
  { id: 'reportes', name: 'Reportes', description: 'Análisis y reportes' },
  { id: 'configuracion', name: 'Configuración', description: 'Configuración del sistema' }
];

const Dashboard = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Función para verificar permisos
  const hasPermission = (module) => {
    const userRole = user?.rol?.toUpperCase();
    if (!userRole || !rolePermissions[userRole]) {
      return false;
    }
    return rolePermissions[userRole].includes(module);
  };

  // Funciones para gestionar permisos
  const validateCriticalPermissions = (targetRole, module, isRemoving) => {
    // Módulos críticos que siempre deben tener al menos un rol con acceso
    const criticalModules = ['usuarios', 'configuracion'];
    
    if (!criticalModules.includes(module) || !isRemoving) {
      return { valid: true };
    }

    // Verificar si quedaría al menos un rol con acceso al módulo
    const rolesWithModule = Object.keys(rolePermissions).filter(r => {
      if (r === targetRole) {
        return false; // Estamos removiendo el permiso de este rol
      }
      return rolePermissions[r].includes(module);
    });

    // Verificar si el usuario actual tiene este rol y sería el único afectado
    const currentUserRole = user?.rol?.toUpperCase();
    if (currentUserRole === targetRole && rolesWithModule.length === 0) {
      return {
        valid: false,
        message: `No puedes desactivar el acceso a "${module}" porque eres el único usuario con este permiso. El sistema quedaría sin administración.`
      };
    }

    if (rolesWithModule.length === 0) {
      return {
        valid: false,
        message: `No se puede desactivar "${module}" porque debe existir al menos un rol con acceso a este módulo crítico.`
      };
    }

    return { valid: true };
  };

  const togglePermission = (role, module) => {
    const isRemoving = rolePermissions[role].includes(module);
    const validation = validateCriticalPermissions(role, module, isRemoving);
    
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setRolePermissions(prev => {
      const newPermissions = { ...prev };
      if (newPermissions[role].includes(module)) {
        newPermissions[role] = newPermissions[role].filter(m => m !== module);
      } else {
        newPermissions[role] = [...newPermissions[role], module];
      }
      return newPermissions;
    });
  };

  const resetPermissions = () => {
    setRolePermissions(PERMISSIONS);
    toast.success('Permisos restablecidos a la configuración por defecto');
  };
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNuevaReservaModal, setShowNuevaReservaModal] = useState(false);
  const [showNuevoServicioModal, setShowNuevoServicioModal] = useState(false);
  const [showNuevoUsuarioModal, setShowNuevoUsuarioModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState('general');
  const [rolePermissions, setRolePermissions] = useState(PERMISSIONS);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    rechazadas: 0
  });

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/');
      return;
    }
    cargarReservas();
    
    // Verificar si el usuario tiene acceso al tab actual
    if (!hasPermission(activeTab)) {
      // Redirigir al primer tab disponible
      const availableTab = sidebarItems.find(item => hasPermission(item.id));
      if (availableTab) {
        setActiveTab(availableTab.id);
      }
    }
  }, [isAuthenticated, isAdmin, navigate, user]);

  useEffect(() => {
    if (activeTab === 'servicios') {
      cargarServicios();
    } else if (activeTab === 'usuarios') {
      cargarUsuarios();
    }
  }, [activeTab]);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const response = await reservasApi.obtenerReservas();
      const reservasData = response.data;
      setReservas(reservasData);
      
      // Calcular estadísticas
      const stats = {
        total: reservasData.length,
        pendientes: reservasData.filter(r => r.estado === 'Pendiente').length,
        confirmadas: reservasData.filter(r => r.estado === 'Confirmada').length,
        rechazadas: reservasData.filter(r => r.estado === 'Rechazada').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  const confirmarReserva = async (id) => {
    try {
      await reservasApi.confirmarReserva(id, user?.email);
      toast.success('Reserva confirmada');
      cargarReservas();
    } catch (error) {
      toast.error('Error al confirmar reserva');
    }
  };

  const rechazarReserva = async (id) => {
    try {
      await reservasApi.rechazarReserva(id, user?.email);
      toast.success('Reserva rechazada');
      cargarReservas();
    } catch (error) {
      toast.error('Error al rechazar reserva');
    }
  };

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

  const eliminarServicio = async (servicio) => {
    setConfirmAction({
      type: 'delete-service',
      id: servicio.idServicio,
      title: 'Eliminar Servicio',
      message: `¿Estás seguro de que quieres eliminar el servicio "${servicio.nombreServicio}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      action: async () => {
        setConfirmLoading(true);
        try {
          await serviciosApi.eliminarServicio(servicio.idServicio);
          toast.success('Servicio eliminado exitosamente');
          cargarServicios();
          setShowConfirmModal(false);
        } catch (error) {
          toast.error('Error al eliminar servicio');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await usuariosApi.obtenerUsuarios({ soloAdministrativos: true });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const eliminarUsuario = async (usuario) => {
    // Validaciones
    const usuariosActivos = usuarios.filter(u => u.activo);
    const administradoresActivos = usuariosActivos.filter(u => u.rol === 'ADMINISTRADOR');
    
    // No permitir desactivar si es el único usuario activo
    if (usuariosActivos.length === 1) {
      toast.error('No puedes desactivar el único usuario activo del sistema');
      return;
    }
    
    // No permitir desactivar si es el único administrador
    if (usuario.rol === 'ADMINISTRADOR' && administradoresActivos.length === 1) {
      toast.error('No puedes desactivar el único administrador del sistema');
      return;
    }
    
    // No permitir desactivarse a sí mismo si es el único administrador
    if (usuario.email === user?.email && administradoresActivos.length === 1) {
      toast.error('No puedes desactivarte a ti mismo siendo el único administrador');
      return;
    }

    setConfirmAction({
      type: 'delete',
      id: usuario.idUsuario,
      title: 'Desactivar Usuario',
      message: `¿Estás seguro de que quieres desactivar al usuario "${usuario.nombre}"? Esta acción puede revertirse posteriormente.`,
      confirmText: 'Sí, desactivar',
      action: async () => {
        setConfirmLoading(true);
        try {
          await usuariosApi.eliminarUsuario(usuario.idUsuario);
          toast.success('Usuario desactivado exitosamente');
          cargarUsuarios();
          setShowConfirmModal(false);
        } catch (error) {
          toast.error('Error al desactivar usuario');
        } finally {
          setConfirmLoading(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'reservas', name: 'Reservas', icon: CalendarDaysIcon },
    { id: 'gestion-reservas', name: 'Gestión Detallada', icon: DocumentChartBarIcon },
    { id: 'servicios', name: 'Servicios', icon: BuildingStorefrontIcon },
    { id: 'usuarios', name: 'Usuarios', icon: UsersIcon },
    { id: 'clientes', name: 'Clientes', icon: UserCircleIcon },
    { id: 'reportes', name: 'Reportes', icon: ChartBarIcon },
    { id: 'configuracion', name: 'Configuración', icon: CogIcon },
  ];

  const getEstadoBadge = (estado) => {
    const badges = {
      'Pendiente': 'bg-warning-100 text-warning-800 border-warning-200',
      'Confirmada': 'bg-success-100 text-success-800 border-success-200',
      'Rechazada': 'bg-error-100 text-error-800 border-error-200',
      'Finalizada': 'bg-secondary-100 text-secondary-800 border-secondary-200'
    };
    return badges[estado] || 'bg-secondary-100 text-secondary-800 border-secondary-200';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 gradient-bg shadow-strong transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-white/20">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Sistema Reservas</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.filter(item => hasPermission(item.id)).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (hasPermission(item.id)) {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white shadow-soft'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <UserCircleIcon className="w-10 h-10 text-white/80" />
              <div>
                <p className="text-white font-semibold">{user?.nombre}</p>
                <p className="text-white/60 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-soft border-b border-secondary-200">
          <div className="px-4 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors lg:hidden mr-4"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    {sidebarItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-secondary-600 mt-1">
                    {activeTab === 'dashboard' && 'Resumen general del sistema'}
                    {activeTab === 'reservas' && 'Gestión de reservas'}
                    {activeTab === 'gestion-reservas' && 'Seguimiento de usuarios gestores'}
                    {activeTab === 'servicios' && 'Administración de servicios'}
                    {activeTab === 'usuarios' && 'Gestión de usuarios y roles'}
                    {activeTab === 'clientes' && 'Administración de clientes'}
                    {activeTab === 'reportes' && 'Análisis y reportes'}
                    {activeTab === 'configuracion' && 'Configuración del sistema'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {activeTab === 'dashboard' && hasPermission('dashboard') && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Total Reservas</p>
                      <p className="text-3xl font-bold text-secondary-900">{stats.total}</p>
                    </div>
                    <CalendarDaysIcon className="w-10 h-10 text-primary-600" />
                  </div>
                </div>

                <div className="card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Pendientes</p>
                      <p className="text-3xl font-bold text-warning-600">{stats.pendientes}</p>
                    </div>
                    <ClockIcon className="w-10 h-10 text-warning-600" />
                  </div>
                </div>

                <div className="card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Confirmadas</p>
                      <p className="text-3xl font-bold text-success-600">{stats.confirmadas}</p>
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-success-600" />
                  </div>
                </div>

                <div className="card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Rechazadas</p>
                      <p className="text-3xl font-bold text-error-600">{stats.rechazadas}</p>
                    </div>
                    <XCircleIcon className="w-10 h-10 text-error-600" />
                  </div>
                </div>
              </div>

              {/* Recent Reservations */}
              <div className="card-elevated">
                {/* Header Desktop */}
                <div className="hidden md:flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary-900">Reservas Recientes</h3>
                  <button 
                    onClick={() => setActiveTab('reservas')}
                    className="btn-secondary"
                  >
                    Ver todas
                  </button>
                </div>

                {/* Header Mobile */}
                <div className="md:hidden mb-6">
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">Reservas Recientes</h3>
                  <button 
                    onClick={() => setActiveTab('reservas')}
                    className="btn-secondary text-sm w-full"
                  >
                    Ver todas
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservas.slice(0, 5).map((reserva) => (
                      <div key={reserva.idReserva} className="p-4 bg-secondary-50 rounded-xl">
                        {/* Vista Desktop - flex horizontal */}
                        <div className="hidden md:flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold text-secondary-900">{reserva.nombreCliente}</p>
                                <p className="text-sm text-secondary-600">{reserva.emailCliente}</p>
                              </div>
                              <div>
                                <p className="text-sm text-secondary-600">Servicio</p>
                                <p className="font-medium text-secondary-900">{reserva.nombreServicio}</p>
                              </div>
                              <div>
                                <p className="text-sm text-secondary-600">Fecha y Hora</p>
                                <p className="font-medium text-secondary-900">{reserva.fecha} {reserva.hora}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoBadge(reserva.estado)}`}>
                              {reserva.estado}
                            </span>
                            {reserva.estado === 'Pendiente' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => confirmarReserva(reserva.idReserva)}
                                  className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors"
                                  title="Confirmar"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => rechazarReserva(reserva.idReserva)}
                                  className="p-2 text-error-600 hover:bg-error-100 rounded-lg transition-colors"
                                  title="Rechazar"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vista Mobile - minimalista */}
                        <div className="md:hidden">
                          {/* Cliente */}
                          <div className="mb-3">
                            <p className="font-semibold text-secondary-900 text-base">{reserva.nombreCliente}</p>
                            <p className="text-sm text-secondary-600">{reserva.emailCliente}</p>
                          </div>

                          {/* Servicio y Fecha - en líneas simples */}
                          <div className="space-y-2 mb-3">
                            <div>
                              <p className="text-xs text-secondary-500">Servicio</p>
                              <p className="text-sm text-secondary-900">{reserva.nombreServicio}</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-500">Fecha y Hora</p>
                              <p className="text-sm text-secondary-900">{reserva.fecha} {reserva.hora}</p>
                            </div>
                          </div>

                          {/* Estado y Botones al final */}
                          <div className="pt-3 border-t border-secondary-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(reserva.estado)}`}>
                                {reserva.estado}
                              </span>
                            </div>
                            
                            {/* Botones de acción */}
                            {reserva.estado === 'Pendiente' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => confirmarReserva(reserva.idReserva)}
                                  className="flex-1 btn-success text-xs py-2 px-3 flex items-center justify-center space-x-1"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span>Confirmar</span>
                                </button>
                                <button
                                  onClick={() => rechazarReserva(reserva.idReserva)}
                                  className="flex-1 btn-error text-xs py-2 px-3 flex items-center justify-center space-x-1"
                                >
                                  <XCircleIcon className="w-3 h-3" />
                                  <span>Rechazar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reservas' && hasPermission('reservas') && (
            <div className="space-y-6">
              {/* Header Desktop */}
              <div className="hidden md:flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Gestión de Reservas</h3>
                <button 
                  onClick={() => setShowNuevaReservaModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Nueva Reserva</span>
                  <span className="sm:hidden">Nueva</span>
                </button>
              </div>

              {/* Header Mobile */}
              <div className="md:hidden">
                <h3 className="text-xl font-bold text-secondary-900 mb-3">Gestión de Reservas</h3>
                <button 
                  onClick={() => setShowNuevaReservaModal(true)}
                  className="btn-primary w-full flex items-center justify-center space-x-2 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Nueva Reserva</span>
                </button>
              </div>

              <div className="card-elevated">
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Buscar reservas..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-secondary-200">
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Cliente</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Servicio</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Fecha</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Hora</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Estado</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservas.map((reserva) => (
                            <tr key={reserva.idReserva} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-secondary-900">{reserva.nombreCliente}</p>
                                  <p className="text-sm text-secondary-600">{reserva.emailCliente}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-secondary-900">{reserva.nombreServicio}</td>
                              <td className="py-4 px-4 text-secondary-900">{reserva.fecha}</td>
                              <td className="py-4 px-4 text-secondary-900">{reserva.hora}</td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoBadge(reserva.estado)}`}>
                                  {reserva.estado}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {reserva.estado === 'Pendiente' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => confirmarReserva(reserva.idReserva)}
                                      className="btn-success text-sm px-3 py-1"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => rechazarReserva(reserva.idReserva)}
                                      className="btn-error text-sm px-3 py-1"
                                    >
                                      Rechazar
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista Mobile - Tarjetas */}
                    <div className="md:hidden space-y-4">
                      {reservas.map((reserva) => (
                        <div key={reserva.idReserva} className="p-4 bg-secondary-50 rounded-xl">
                          {/* Cliente */}
                          <div className="mb-3">
                            <p className="font-semibold text-secondary-900">{reserva.nombreCliente}</p>
                            <p className="text-sm text-secondary-600">{reserva.emailCliente}</p>
                          </div>

                          {/* Info */}
                          <div className="space-y-2 mb-3">
                            <div>
                              <p className="text-xs text-secondary-500">Servicio</p>
                              <p className="text-sm text-secondary-900">{reserva.nombreServicio}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-secondary-500">Fecha</p>
                                <p className="text-sm text-secondary-900">{reserva.fecha}</p>
                              </div>
                              <div>
                                <p className="text-xs text-secondary-500">Hora</p>
                                <p className="text-sm text-secondary-900">{reserva.hora}</p>
                              </div>
                            </div>
                          </div>

                          {/* Estado y Acciones */}
                          <div className="pt-3 border-t border-secondary-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(reserva.estado)}`}>
                                {reserva.estado}
                              </span>
                            </div>
                            
                            {reserva.estado === 'Pendiente' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => confirmarReserva(reserva.idReserva)}
                                  className="flex-1 btn-success text-xs py-2 px-3 flex items-center justify-center space-x-1"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span>Confirmar</span>
                                </button>
                                <button
                                  onClick={() => rechazarReserva(reserva.idReserva)}
                                  className="flex-1 btn-error text-xs py-2 px-3 flex items-center justify-center space-x-1"
                                >
                                  <XCircleIcon className="w-3 h-3" />
                                  <span>Rechazar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'servicios' && hasPermission('servicios') && (
            <div className="space-y-6">
              {/* Vista Desktop - Header con botón */}
              <div className="hidden md:flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Gestión de Servicios</h3>
                <button 
                  onClick={() => {
                    setServicioEditando(null);
                    setShowNuevoServicioModal(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Servicio</span>
                </button>
              </div>

              {/* Vista Mobile - Header con botón debajo */}
              <div className="md:hidden">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Gestión de Servicios</h3>
                <button 
                  onClick={() => {
                    setServicioEditando(null);
                    setShowNuevoServicioModal(true);
                  }}
                  className="btn-primary flex items-center justify-center space-x-2 w-full mb-4"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Servicio</span>
                </button>
              </div>

              <div className="card-elevated">
                {loadingServicios ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map((servicio) => (
                      <div key={servicio.idServicio} className="card-hover">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-secondary-900">
                                {servicio.nombreServicio}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                servicio.activo 
                                  ? 'bg-success-100 text-success-800' 
                                  : 'bg-secondary-100 text-secondary-800'
                              }`}>
                                {servicio.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-2xl font-bold text-primary-600">
                                {formatearPrecio(servicio.precio)}
                              </p>
                            </div>
                            
                            {servicio.descripcion && (
                              <p className="text-secondary-600 text-sm mb-3">
                                {servicio.descripcion}
                              </p>
                            )}
                            
                            <div className="flex items-center text-sm text-secondary-500 mb-4">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {servicio.duracionMinutos} minutos
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-3 border-t border-secondary-200">
                            <button
                              onClick={() => {
                                setServicioEditando(servicio);
                                setShowNuevoServicioModal(true);
                              }}
                              className="flex-1 btn-secondary text-sm py-2 px-3 flex items-center justify-center space-x-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => eliminarServicio(servicio)}
                              className="flex-1 btn-error text-sm py-2 px-3 flex items-center justify-center space-x-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {servicios.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <BuildingStorefrontIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                          No hay servicios registrados
                        </h3>
                        <p className="text-secondary-600 mb-4">
                          Comienza agregando tu primer servicio.
                        </p>
                        <button 
                          onClick={() => {
                            setServicioEditando(null);
                            setShowNuevoServicioModal(true);
                          }}
                          className="btn-primary"
                        >
                          Crear Primer Servicio
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gestion-reservas' && hasPermission('gestion-reservas') && (
            <div className="space-y-6">
              {/* Vista Desktop - Header con botón */}
              <div className="hidden md:flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Gestión Detallada de Reservas</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => cargarUsuarios()}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <UsersIcon className="w-5 h-5" />
                    <span>Ver Usuarios con Reservas</span>
                  </button>
                </div>
              </div>

              {/* Vista Mobile - Header con botón debajo */}
              <div className="md:hidden">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Gestión Detallada de Reservas</h3>
                <button 
                  onClick={() => cargarUsuarios()}
                  className="btn-secondary flex items-center justify-center space-x-2 w-full mb-4"
                >
                  <UsersIcon className="w-5 h-5" />
                  <span>Ver Usuarios con Reservas</span>
                </button>
              </div>

              {/* Estadísticas de Gestión */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Usuarios Activos</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {usuarios.filter(u => u.activo).length}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {usuarios.length} total
                      </p>
                    </div>
                    <UsersIcon className="w-10 h-10 text-primary-600" />
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Gestionadas</p>
                      <p className="text-2xl font-bold text-success-600">
                        {reservas.filter(r => r.estado !== 'Pendiente').length}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {reservas.length > 0 ? Math.round((reservas.filter(r => r.estado !== 'Pendiente').length / reservas.length) * 100) : 0}% del total
                      </p>
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-success-600" />
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Pendientes</p>
                      <p className="text-2xl font-bold text-warning-600">
                        {reservas.filter(r => r.estado === 'Pendiente').length}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Requieren atención
                      </p>
                    </div>
                    <ClockIcon className="w-10 h-10 text-warning-600" />
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-600 text-sm font-semibold">Eficiencia</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {reservas.length > 0 ? Math.round((reservas.filter(r => r.estado === 'Confirmada').length / reservas.length) * 100) : 0}%
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Tasa confirmación
                      </p>
                    </div>
                    <ChartBarIcon className="w-10 h-10 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Resumen de Usuarios Gestores */}
                <div className="xl:col-span-1">
                  <div className="card-elevated h-fit">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-secondary-900">
                        Top Gestores
                      </h4>
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                      {usuarios
                        .sort((a, b) => (b.totalReservasGestionadas || 0) - (a.totalReservasGestionadas || 0))
                        .slice(0, 5)
                        .map((usuario, index) => (
                        <div key={usuario.idUsuario} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-primary-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-secondary-900 text-sm">{usuario.nombre}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  usuario.rol === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-700' :
                                  usuario.rol === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {usuario.rol === 'ADMINISTRADOR' ? 'Admin' :
                                   usuario.rol === 'SUPERVISOR' ? 'Super' : 'Emp'}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${usuario.activo ? 'bg-success-500' : 'bg-error-500'}`}></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary-600">
                              {usuario.totalReservasGestionadas || 0}
                            </p>
                            <p className="text-xs text-secondary-500">reservas</p>
                          </div>
                        </div>
                      ))}
                      
                      {usuarios.length === 0 && (
                        <div className="text-center py-6">
                          <UsersIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                          <p className="text-secondary-600 text-sm">No hay usuarios cargados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista Detallada de Reservas */}
                <div className="xl:col-span-3">
                  <div className="card-elevated">
                    {/* Vista Desktop - Header con filtro */}
                    <div className="hidden md:flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-secondary-900">
                        Historial de Gestión
                      </h4>
                      <div className="flex space-x-2">
                        <select className="input-field text-sm">
                          <option value="">Todos los estados</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Rechazada">Rechazada</option>
                        </select>
                      </div>
                    </div>

                    {/* Vista Mobile - Header con filtro debajo */}
                    <div className="md:hidden mb-4">
                      <h4 className="text-lg font-semibold text-secondary-900 mb-3">
                        Historial de Gestión
                      </h4>
                      <select className="input-field text-sm w-full">
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Rechazada">Rechazada</option>
                      </select>
                    </div>
                    
                    {/* Vista Desktop - Tarjetas detalladas */}
                    <div className="hidden md:block space-y-3 max-h-96 overflow-y-auto">
                      {reservas.map((reserva) => (
                        <div key={reserva.idReserva} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <UserCircleIcon className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-secondary-900">{reserva.nombreCliente}</p>
                                <p className="text-sm text-secondary-600">{reserva.emailCliente}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoBadge(reserva.estado)}`}>
                              {reserva.estado}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-secondary-600">Servicio:</p>
                              <p className="font-medium text-secondary-900">{reserva.nombreServicio}</p>
                            </div>
                            <div>
                              <p className="text-secondary-600">Fecha:</p>
                              <p className="font-medium text-secondary-900">{reserva.fecha} {reserva.hora}</p>
                            </div>
                            <div>
                              <p className="text-secondary-600">Gestionado por:</p>
                              <p className="font-medium text-secondary-900">
                                {reserva.usuarioGestor ? (
                                  <span className="flex items-center">
                                    <UserCircleIcon className="w-4 h-4 mr-1 text-success-600" />
                                    {reserva.usuarioGestor.nombre}
                                  </span>
                                ) : (
                                  <span className="flex items-center text-warning-600">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    Sin asignar
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-secondary-600">Última actualización:</p>
                              <p className="font-medium text-secondary-900">
                                {reserva.actualizadoEn ? new Date(reserva.actualizadoEn).toLocaleDateString() : 'No disponible'}
                              </p>
                            </div>
                          </div>
                          
                          {reserva.estado === 'Pendiente' && (
                            <div className="flex space-x-2 mt-3 pt-3 border-t border-secondary-200">
                              <button
                                onClick={() => confirmarReserva(reserva.idReserva)}
                                className="btn-success text-sm px-4 py-2 flex items-center space-x-1"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Confirmar</span>
                              </button>
                              <button
                                onClick={() => rechazarReserva(reserva.idReserva)}
                                className="btn-error text-sm px-4 py-2 flex items-center space-x-1"
                              >
                                <XCircleIcon className="w-4 h-4" />
                                <span>Rechazar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {reservas.length === 0 && (
                        <div className="text-center py-12">
                          <CalendarDaysIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            No hay reservas registradas
                          </h3>
                          <p className="text-secondary-600">
                            Las reservas aparecerán aquí una vez que sean creadas.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Vista Mobile - Tarjetas simplificadas */}
                    <div className="md:hidden space-y-3 max-h-96 overflow-y-auto">
                      {reservas.map((reserva) => (
                        <div key={reserva.idReserva} className="p-4 bg-secondary-50 rounded-xl">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <UserCircleIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-secondary-900 text-sm">{reserva.nombreCliente}</p>
                              <p className="text-xs text-secondary-600">{reserva.emailCliente}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium text-secondary-900">{reserva.nombreServicio}</p>
                              <p className="text-secondary-600 text-xs">{reserva.fecha} {reserva.hora}</p>
                            </div>
                            
                            <div>
                              <p className="text-secondary-600 text-xs">Gestionado por:</p>
                              <p className="font-medium text-secondary-900 text-xs">
                                {reserva.usuarioGestor ? reserva.usuarioGestor.nombre : 'Sin asignar'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(reserva.estado)}`}>
                              {reserva.estado}
                            </span>
                            
                            {reserva.estado === 'Pendiente' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => confirmarReserva(reserva.idReserva)}
                                  className="btn-success text-xs px-3 py-1"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => rechazarReserva(reserva.idReserva)}
                                  className="btn-error text-xs px-3 py-1"
                                >
                                  Rechazar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {reservas.length === 0 && (
                        <div className="text-center py-8">
                          <CalendarDaysIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                          <h3 className="text-base font-semibold text-secondary-900 mb-2">
                            No hay reservas registradas
                          </h3>
                          <p className="text-secondary-600 text-sm">
                            Las reservas aparecerán aquí una vez que sean creadas.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'usuarios' && hasPermission('usuarios') && (
            <div className="space-y-6">
              {/* Vista Desktop - Header con botón */}
              <div className="hidden md:flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Gestión de Usuarios</h3>
                <button 
                  onClick={() => {
                    setUsuarioEditando(null);
                    setShowNuevoUsuarioModal(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              {/* Vista Mobile - Header con botón debajo */}
              <div className="md:hidden">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Gestión de Usuarios</h3>
                <button 
                  onClick={() => {
                    setUsuarioEditando(null);
                    setShowNuevoUsuarioModal(true);
                  }}
                  className="btn-primary flex items-center justify-center space-x-2 w-full mb-4"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              <div className="card-elevated">
                {loadingUsuarios ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-secondary-200">
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Usuario</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Rol</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Departamento</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Estado</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Reservas Gestionadas</th>
                            <th className="text-left py-3 px-4 font-semibold text-secondary-900">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuarios.map((usuario) => (
                            <tr key={usuario.idUsuario} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-secondary-900">{usuario.nombre}</p>
                                  <p className="text-sm text-secondary-600">{usuario.email}</p>
                                  <p className="text-sm text-secondary-500">{usuario.telefono}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  usuario.rol === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-800' :
                                  usuario.rol === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                                  usuario.rol === 'EMPLEADO' ? 'bg-green-100 text-green-800' :
                                  'bg-secondary-100 text-secondary-800'
                                }`}>
                                  {usuario.rol === 'ADMINISTRADOR' ? 'Administrador' :
                                   usuario.rol === 'SUPERVISOR' ? 'Supervisor' :
                                   usuario.rol === 'EMPLEADO' ? 'Empleado' : usuario.rol}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-secondary-900">
                                {usuario.departamento || 'Sin asignar'}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  usuario.activo 
                                    ? 'bg-success-100 text-success-800' 
                                    : 'bg-error-100 text-error-800'
                                }`}>
                                  {usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-lg font-bold text-primary-600">
                                  {usuario.totalReservasGestionadas || 0}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setUsuarioEditando(usuario);
                                      setShowNuevoUsuarioModal(true);
                                    }}
                                    className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => eliminarUsuario(usuario)}
                                    className="btn-error text-sm px-3 py-1 flex items-center space-x-1"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Desactivar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista Mobile - Tarjetas */}
                    <div className="md:hidden space-y-4">
                      {usuarios.map((usuario) => (
                        <div key={usuario.idUsuario} className="p-4 bg-secondary-50 rounded-xl">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <UserCircleIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-secondary-900">{usuario.nombre}</p>
                              <p className="text-sm text-secondary-600">{usuario.email}</p>
                              <p className="text-xs text-secondary-500">{usuario.telefono}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-secondary-600 text-sm">Rol:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                usuario.rol === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-800' :
                                usuario.rol === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                                usuario.rol === 'EMPLEADO' ? 'bg-green-100 text-green-800' :
                                'bg-secondary-100 text-secondary-800'
                              }`}>
                                {usuario.rol === 'ADMINISTRADOR' ? 'Admin' :
                                 usuario.rol === 'SUPERVISOR' ? 'Super' :
                                 usuario.rol === 'EMPLEADO' ? 'Emp' : usuario.rol}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-secondary-600 text-sm">Departamento:</span>
                              <span className="text-secondary-900 text-sm font-medium">
                                {usuario.departamento || 'Sin asignar'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-secondary-600 text-sm">Reservas:</span>
                              <span className="text-primary-600 font-bold">
                                {usuario.totalReservasGestionadas || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              usuario.activo 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setUsuarioEditando(usuario);
                                  setShowNuevoUsuarioModal(true);
                                }}
                                className="btn-secondary text-xs px-3 py-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarUsuario(usuario)}
                                className="btn-error text-xs px-3 py-1"
                              >
                                Desactivar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {usuarios.length === 0 && (
                      <div className="text-center py-12">
                        <UsersIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                          No hay usuarios registrados
                        </h3>
                        <p className="text-secondary-600 mb-4">
                          Comienza agregando usuarios para gestionar el sistema.
                        </p>
                        <button 
                          onClick={() => {
                            setUsuarioEditando(null);
                            setShowNuevoUsuarioModal(true);
                          }}
                          className="btn-primary"
                        >
                          Crear Primer Usuario
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'clientes' && hasPermission('clientes') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Gestión de Clientes</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Extraer clientes únicos de las reservas */}
                {[...new Map(reservas.map(r => [r.emailCliente, r])).values()].map((cliente, index) => (
                  <div key={index} className="card-hover">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-8 h-8 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-900">{cliente.nombreCliente}</h4>
                        <div className="flex items-center text-sm text-secondary-600 mt-1">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {cliente.emailCliente}
                        </div>
                        <div className="flex items-center text-sm text-secondary-600 mt-1">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          {cliente.telefonoCliente}
                        </div>
                        <p className="text-sm text-primary-600 font-semibold mt-2">
                          {reservas.filter(r => r.emailCliente === cliente.emailCliente).length} reserva(s)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reportes' && hasPermission('reportes') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Reportes y Análisis</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-elevated">
                  <div className="flex items-center mb-4">
                    <DocumentChartBarIcon className="w-6 h-6 text-primary-600 mr-2" />
                    <h4 className="text-lg font-semibold text-secondary-900">Reservas por Estado</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-700">Pendientes</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-warning-500 h-2 rounded-full" 
                            style={{width: `${stats.total > 0 ? (stats.pendientes / stats.total) * 100 : 0}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-secondary-900">{stats.pendientes}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-700">Confirmadas</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-success-500 h-2 rounded-full" 
                            style={{width: `${stats.total > 0 ? (stats.confirmadas / stats.total) * 100 : 0}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-secondary-900">{stats.confirmadas}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary-700">Rechazadas</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-error-500 h-2 rounded-full" 
                            style={{width: `${stats.total > 0 ? (stats.rechazadas / stats.total) * 100 : 0}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-secondary-900">{stats.rechazadas}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="w-6 h-6 text-primary-600 mr-2" />
                    <h4 className="text-lg font-semibold text-secondary-900">Resumen General</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Total de Reservas</span>
                      <span className="text-2xl font-bold text-primary-600">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Clientes Únicos</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {new Set(reservas.map(r => r.emailCliente)).size}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-700">Tasa de Confirmación</span>
                      <span className="text-2xl font-bold text-success-600">
                        {stats.total > 0 ? Math.round((stats.confirmadas / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configuracion' && hasPermission('configuracion') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-secondary-900">Configuración del Sistema</h3>
              </div>

              {/* Pestañas de Configuración */}
              <div className="border-b border-secondary-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveConfigTab('general')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeConfigTab === 'general'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setActiveConfigTab('roles')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeConfigTab === 'roles'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    Roles y Permisos
                  </button>
                  <button
                    onClick={() => setActiveConfigTab('perfil')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeConfigTab === 'perfil'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    Perfil
                  </button>
                </nav>
              </div>

              {/* Contenido General */}
              {activeConfigTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card-elevated">
                    <div className="flex items-center mb-4">
                      <WrenchScrewdriverIcon className="w-6 h-6 text-primary-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">Configuración General</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <div>
                          <p className="font-medium text-secondary-900">Notificaciones por Email</p>
                          <p className="text-sm text-secondary-600">Recibir notificaciones de nuevas reservas</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <div>
                          <p className="font-medium text-secondary-900">Auto-confirmación</p>
                          <p className="text-sm text-secondary-600">Confirmar reservas automáticamente</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido Roles y Permisos */}
              {activeConfigTab === 'roles' && (
                <div className="space-y-6">
                  {/* Vista Desktop - Header con botón */}
                  <div className="hidden md:flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900">Gestión de Roles y Permisos</h4>
                      <p className="text-secondary-600 text-sm mt-1">Configure qué módulos puede acceder cada rol de usuario</p>
                    </div>
                    <button
                      onClick={resetPermissions}
                      className="btn-secondary text-sm"
                    >
                      Restablecer por Defecto
                    </button>
                  </div>

                  {/* Vista Mobile - Header con botón debajo */}
                  <div className="md:hidden">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-secondary-900">Gestión de Roles y Permisos</h4>
                      <p className="text-secondary-600 text-sm mt-1">Configure qué módulos puede acceder cada rol de usuario</p>
                    </div>
                    <button
                      onClick={resetPermissions}
                      className="btn-secondary text-sm w-full mb-4"
                    >
                      Restablecer por Defecto
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Object.keys(rolePermissions).map((role) => (
                      <div key={role} className="card-elevated">
                        <div className="flex items-center mb-4">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            role === 'ADMINISTRADOR' ? 'bg-purple-500' :
                            role === 'SUPERVISOR' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <h5 className="text-lg font-semibold text-secondary-900">
                            {role === 'ADMINISTRADOR' ? 'Administrador' :
                             role === 'SUPERVISOR' ? 'Supervisor' : 'Empleado'}
                          </h5>
                        </div>
                        
                        <div className="space-y-3">
                          {AVAILABLE_MODULES.map((module) => {
                            const isChecked = rolePermissions[role].includes(module.id);
                            const validation = validateCriticalPermissions(role, module.id, isChecked);
                            const isDisabled = isChecked && !validation.valid;
                            const isCritical = ['usuarios', 'configuracion'].includes(module.id);
                            
                            return (
                              <div key={module.id} className={`p-3 rounded-lg ${
                                isDisabled ? 'bg-red-50 border border-red-200' : 'bg-secondary-50'
                              }`}>
                                {/* Vista Desktop - Layout horizontal */}
                                <div className="hidden md:flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <p className="font-medium text-secondary-900 text-sm">{module.name}</p>
                                      {isCritical && (
                                        <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs font-medium rounded">
                                          Crítico
                                        </span>
                                      )}
                                      {isDisabled && (
                                        <span className="px-2 py-0.5 bg-error-100 text-error-700 text-xs font-medium rounded">
                                          Protegido
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-secondary-600">{module.description}</p>
                                    {isDisabled && (
                                      <p className="text-xs text-error-600 mt-1">No se puede desactivar: eres el único con este acceso</p>
                                    )}
                                  </div>
                                  <label className={`relative inline-flex items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={isChecked}
                                      disabled={isDisabled}
                                      onChange={() => togglePermission(role, module.id)}
                                    />
                                    <div className={`w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                      isDisabled 
                                        ? 'bg-secondary-300 peer-checked:bg-secondary-400 cursor-not-allowed' 
                                        : 'bg-secondary-200 peer-checked:bg-primary-600'
                                    }`}></div>
                                  </label>
                                </div>

                                {/* Vista Mobile - Layout vertical */}
                                <div className="md:hidden">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 pr-3">
                                      <p className="font-medium text-secondary-900 text-sm">{module.name}</p>
                                      <p className="text-xs text-secondary-600">{module.description}</p>
                                    </div>
                                    <label className={`relative inline-flex items-center ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} flex-shrink-0`}>
                                      <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={() => togglePermission(role, module.id)}
                                      />
                                      <div className={`w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                        isDisabled 
                                          ? 'bg-secondary-300 peer-checked:bg-secondary-400 cursor-not-allowed' 
                                          : 'bg-secondary-200 peer-checked:bg-primary-600'
                                      }`}></div>
                                    </label>
                                  </div>
                                  
                                  {/* Badges en nueva línea para móvil */}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {isCritical && (
                                      <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs font-medium rounded">
                                        Crítico
                                      </span>
                                    )}
                                    {isDisabled && (
                                      <span className="px-2 py-0.5 bg-error-100 text-error-700 text-xs font-medium rounded">
                                        Protegido
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Mensaje de error en nueva línea para móvil */}
                                  {isDisabled && (
                                    <p className="text-xs text-error-600">No se puede desactivar: eres el único con este acceso</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-secondary-200">
                          <p className="text-xs text-secondary-600">
                            {rolePermissions[role].length} de {AVAILABLE_MODULES.length} módulos habilitados
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card-elevated">
                    <div className="flex items-center mb-4">
                      <InformationCircleIcon className="w-6 h-6 text-primary-600 mr-2" />
                      <h5 className="text-lg font-semibold text-secondary-900">Información sobre Roles</h5>
                    </div>
                    
                    {/* Alerta de Seguridad */}
                    <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 mr-2 mt-0.5" />
                        <div>
                          <h6 className="font-semibold text-warning-900 mb-1">Protecciones de Seguridad</h6>
                          <ul className="text-sm text-warning-800 space-y-1">
                            <li>• Los módulos "Usuarios" y "Configuración" son críticos para el sistema</li>
                            <li>• No puedes desactivar estos permisos si eres el único usuario con acceso</li>
                            <li>• Siempre debe existir al menos un rol con acceso a módulos críticos</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <h6 className="font-semibold text-purple-900">Administrador</h6>
                        </div>
                        <p className="text-sm text-purple-700">
                          Acceso completo al sistema. Puede gestionar usuarios, configuración y todos los módulos.
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <h6 className="font-semibold text-blue-900">Supervisor</h6>
                        </div>
                        <p className="text-sm text-blue-700">
                          Puede gestionar reservas, servicios y generar reportes. Sin acceso a configuración.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <h6 className="font-semibold text-green-900">Empleado</h6>
                        </div>
                        <p className="text-sm text-green-700">
                          Acceso básico para gestionar reservas y ver información de clientes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido Perfil */}
              {activeConfigTab === 'perfil' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card-elevated">
                    <div className="flex items-center mb-4">
                      <UserCircleIcon className="w-6 h-6 text-primary-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">Perfil de Usuario</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-secondary-700 mb-2">Nombre</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          defaultValue={user?.nombre} 
                          readOnly 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          className="input-field" 
                          defaultValue={user?.email} 
                          readOnly 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary-700 mb-2">Rol</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          defaultValue={user?.rol || 'admin'} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal Nueva Reserva */}
      <NuevaReservaModal 
        isOpen={showNuevaReservaModal}
        onClose={() => setShowNuevaReservaModal(false)}
        onReservaCreada={cargarReservas}
      />

      {/* Modal Servicios */}
      <ServicioModal 
        isOpen={showNuevoServicioModal}
        onClose={() => setShowNuevoServicioModal(false)}
        onServicioGuardado={cargarServicios}
        servicio={servicioEditando}
      />

      {/* Modal Usuarios */}
      <UsuarioModal 
        isOpen={showNuevoUsuarioModal}
        onClose={() => setShowNuevoUsuarioModal(false)}
        onUsuarioGuardado={cargarUsuarios}
        usuario={usuarioEditando}
      />

      {/* Modal de Confirmación */}
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction?.action}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        type="danger"
        loading={confirmLoading}
      />
    </div>
  );
};

export default Dashboard;