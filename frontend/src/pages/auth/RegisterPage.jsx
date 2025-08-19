import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useRegisterMutation } from '../../features/auth/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { Button, Input } from '../../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useUI();
  const [register, { isLoading }] = useRegisterMutation();

  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData).unwrap();
      showSuccess('¡Registro exitoso! Revisa tu email para confirmar tu cuenta');
      navigate('/login');
    } catch (error) {
      showError(error.data?.message || 'Error al registrarse');
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              {...registerForm('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                }
              })}
              error={errors.name?.message}
              placeholder="Tu nombre completo"
            />
            <Input
              label="Email"
              type="email"
              {...registerForm('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              error={errors.email?.message}
              placeholder="tu@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              {...registerForm('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
              error={errors.password?.message}
              placeholder="••••••••"
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              {...registerForm('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Crear Cuenta
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
