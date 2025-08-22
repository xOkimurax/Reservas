import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AdminLogin = () => {
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
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Inicio de sesión exitoso');
        navigate('/admin/dashboard');
      } else {
        toast.error(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver al inicio
        </Link>
        
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Acceso Administrador
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tus credenciales para acceder al panel de administración
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
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
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Tu contraseña"
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 4,
                      message: 'La contraseña debe tener al menos 4 caracteres'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <h4 className="text-sm font-semibold text-primary-900 mb-2">
              💡 Credenciales de prueba:
            </h4>
            <p className="text-sm text-primary-700">
              Email: admin@reservas.com<br />
              Contraseña: password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;