import React from 'react';
import { CheckCircle, Upload, Video, Image as ImageIcon } from 'lucide-react';

const MediaSystemStatus = () => {
  const features = [
    {
      name: 'Backend - Subida de Imágenes',
      status: 'complete',
      description: 'Endpoint /api/blog/:postId/upload-image funcionando con Cloudinary'
    },
    {
      name: 'Backend - Subida de Videos',
      status: 'complete',
      description: 'Endpoint /api/blog/:postId/upload-video funcionando con Cloudinary'
    },
    {
      name: 'Backend - Gestión de Medios',
      status: 'complete',
      description: 'Endpoints para eliminar imágenes y videos individuales'
    },
    {
      name: 'Frontend - Componente MediaUploader',
      status: 'complete',
      description: 'Drag & drop para imágenes y videos con preview y gestión'
    },
    {
      name: 'Frontend - Formulario BlogPost',
      status: 'complete',
      description: 'Integración completa con subida y gestión de medios'
    },
    {
      name: 'Frontend - Reproductor de Videos',
      status: 'complete',
      description: 'VideoPlayer personalizado con controles avanzados'
    },
    {
      name: 'Frontend - Galería en BlogPost',
      status: 'complete',
      description: 'Visualización de imágenes y videos en posts públicos'
    },
    {
      name: 'Panel Admin - Indicadores de Medios',
      status: 'complete',
      description: 'Muestra cantidad de imágenes y videos en la tabla de posts'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Upload className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-6 h-6 text-blue-600" />
          <Video className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Sistema de Medios para Blog - Estado Completo
        </h2>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            {getStatusIcon(feature.status)}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{feature.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          🎉 ¡Sistema Completo y Funcional!
        </h3>
        <div className="text-green-700 space-y-2">
          <p><strong>✅ Backend:</strong> Endpoints para subir imágenes, videos y gestionar medios</p>
          <p><strong>✅ Frontend:</strong> Interfaz completa con drag & drop, previews y reproductores</p>
          <p><strong>✅ Administración:</strong> Panel completo para gestionar posts y medios</p>
          <p><strong>✅ Visualización:</strong> Galerías de imágenes y videos en posts públicos</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📋 Cómo usar el sistema:
        </h3>
        <ol className="text-blue-700 space-y-1 list-decimal list-inside">
          <li>Crear un nuevo post en el panel admin</li>
          <li>Guardar el post primero (necesario para subir medios)</li>
          <li>Usar la sección "Gestión de Medios" para subir imágenes y videos</li>
          <li>Los medios se muestran automáticamente en el post público</li>
          <li>Gestionar medios con opciones de eliminar y reordenar</li>
        </ol>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          🎥 Características del reproductor de video:
        </h3>
        <ul className="text-purple-700 space-y-1 list-disc list-inside">
          <li>Controles personalizados con play/pause, volumen, progreso</li>
          <li>Pantalla completa y reinicio de video</li>
          <li>Galería para múltiples videos</li>
          <li>Optimización para dispositivos móviles</li>
          <li>Soporte para videos de Cloudinary con calidad adaptativa</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaSystemStatus;
