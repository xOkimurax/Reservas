import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('¡Bienvenido al sistema!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información del sistema */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <ShieldCheckIcon className="w-16 h-16 mb-4 text-white/90" />
            <h1 className="text-4xl font-bold mb-4">
              Sistema de Reservas
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Plataforma integral para la gestión eficiente de reservas y servicios. 
              Administra tu negocio con herramientas profesionales.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Gestión completa de reservas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Panel administrativo avanzado</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Reportes y analytics en tiempo real</span>
            </div>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-secondary-600">
              Accede a tu panel administrativo
            </p>
          </div>

          <div className="card-elevated">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-3">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="admin@reservas.com"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-error-500 text-sm mt-2 flex items-center">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-3">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-12 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="Tu contraseña"
                    {...register('password', {
                      required: 'La contraseña es obligatoria',
                      minLength: {
                        value: 4,
                        message: 'Mínimo 4 caracteres'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error-500 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary text-lg py-4 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Credenciales de prueba */}
            <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <h4 className="text-sm font-semibold text-primary-900 mb-2 flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Credenciales de prueba
              </h4>
              <div className="text-sm text-primary-700 space-y-1">
                <p><strong>Email:</strong> admin@reservas.com</p>
                <p><strong>Contraseña:</strong> password</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-secondary-500">
              © 2024 Sistema de Reservas. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;