import { useState } from 'react';
import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
} from '../../features/users/usersApi';
import { useUI } from '../../hooks/useUI';
import { Button, Input, Loading } from '../../components/ui';
import { useForm } from 'react-hook-form';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const UsersPage = () => {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { showSuccess, showError } = useUI();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleCreateUser = async (data) => {
    try {
      await createUser(data).unwrap();
      showSuccess('Usuario creado exitosamente');
      setShowModal(false);
      reset();
    } catch (error) {
      showError(error.data?.message || 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async (data) => {
    try {
      await updateUser({ id: editingUser.id, ...data }).unwrap();
      showSuccess('Usuario actualizado exitosamente');
      setShowModal(false);
      setEditingUser(null);
      reset();
    } catch (error) {
      showError(error.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(userId).unwrap();
        showSuccess('Usuario eliminado exitosamente');
      } catch (error) {
        showError(error.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    reset({
      username: user.username,
      role: user.role
    });
    setShowModal(true);
  };

  const onSubmit = editingUser ? handleUpdateUser : handleCreateUser;

  if (isLoading) return (
    <div className="flex justify-center">
      <Loading text="Cargando usuarios..." />
    </div>
  );

  if (error) return (
    <div className="text-center">
      <p className="text-red-600">Error al cargar usuarios: {error.message}</p>
    </div>
  );

  return (
   
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <Button onClick={openCreateModal} className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users?.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    {...register('username', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    error={errors.username?.message}
                  />
                  {!editingUser && (
                    <Input
                      label="Contraseña"
                      type="password"
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 6,
                          message: 'Mínimo 6 caracteres'
                        }
                      })}
                      error={errors.password?.message}
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      {...register('role', { required: 'Selecciona un rol' })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setEditingUser(null);
                        reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
   
  );
};

export default UsersPage;
