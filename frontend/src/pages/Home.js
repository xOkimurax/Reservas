import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Sistema de Reservas
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Reserva tu cita de manera rápida y sencilla
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card text-center">
            <CalendarDaysIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Fácil Programación</h3>
            <p className="text-gray-600">Selecciona fecha y hora que mejor te convenga</p>
          </div>
          
          <div className="card text-center">
            <ClockIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Confirmación Rápida</h3>
            <p className="text-gray-600">Recibe confirmación inmediata por WhatsApp</p>
          </div>
          
          <div className="card text-center">
            <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
            <p className="text-gray-600">Servicio adaptado a tus necesidades</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4 md:space-y-0 md:space-x-4">
          <Link 
            to="/reservar"
            className="inline-block btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Hacer una Reserva
          </Link>
          
          <Link 
            to="/admin/login"
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200 ml-4"
          >
            Acceso Administrador
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 Sistema de Reservas. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;