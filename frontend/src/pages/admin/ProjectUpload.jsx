import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  LinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  useUploadProjectMediaMutation,
  useCreateProjectMutation,
  useToggleSliderImageMutation
} from '../../features/projects/projectsApi';
import { 
  selectIsUploading, 
  selectUploadError,
  selectIsCreating,
  selectCreateError
} from '../../features/projects/projectsSlice';

const ProjectUpload = ({ projectId = null, onProjectCreated }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  // Estados Redux
  const isUploading = useSelector(selectIsUploading);
  const uploadError = useSelector(selectUploadError);
  const isCreating = useSelector(selectIsCreating);
  const createError = useSelector(selectCreateError);
  
  // Mutaciones
  const [uploadMedia] = useUploadProjectMediaMutation();
  const [createProject] = useCreateProjectMutation();
  const [toggleSliderImage] = useToggleSliderImageMutation();
  
  // Estados locales
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  
  // ✅ NUEVOS ESTADOS para subida secuencial
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [currentSliderImageId, setCurrentSliderImageId] = useState(null);
  
  // ✅ Estado del proyecto CON NUEVOS CAMPOS
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    location: '',
    client: '',
    architect: '',
    projectType: 'Proyecto',
    status: 'render',
    area: '',
    content: '',
    tags: [],
    slug: '',
    kuulaUrl: '',           // ✅ NUEVO CAMPO
    startDate: '',
    endDate: '',
    isFeatured: false,
    showInSlider: false,    // ✅ NUEVO CAMPO
    isPublic: true,
    isActive: true,
    order: 0
  });

  // Tags y opciones (mantienen igual)
  const availableTags = [
    'residencial', 'comercial', 'industrial', 'piscinas',
    'restaurantes', 'hoteles', 'oficinas', 'moderno',
    'clasico', 'minimalista', 'sustentable', 'lujo',
    'economico', 'reforma', 'construccion_nueva'
  ];

  const projectTypes = ['Diseño', 'Proyecto', 'Dirección de Obra'];
  const etapasOptions = ['render', 'obra', 'finalizado'];

  const fileTypes = {
    render: {
      label: 'Renders',
      icon: PhotoIcon,
      accept: 'image/*',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Imágenes renderizadas del proyecto'
    },
    plano: {
      label: 'Planos',
      icon: DocumentIcon,
      accept: '.pdf',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Planos técnicos y arquitectónicos'
    },
    video: {
      label: 'Videos',
      icon: VideoCameraIcon,
      accept: 'video/*',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Videos del proyecto o recorridos'
    },
    obra_proceso: {
      label: 'Obra en proceso',
      icon: PhotoIcon,
      accept: 'image/*',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Fotografías durante la construcción'
    },
    obra_finalizada: {
      label: 'Obra finalizada',
      icon: PhotoIcon,
      accept: 'image/*',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Fotografías de la obra terminada'
    },
    otro: {
      label: 'Otros',
      icon: DocumentIcon,
      accept: '*/*',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Otros archivos relacionados'
    }
  };

  // Funciones existentes (mantienen igual)
  const generateSlug = (title, year) => {
    if (!title) return '';
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')}-${year}`;
  };

  const handleTitleChange = (title) => {
    const newSlug = generateSlug(title, projectData.year);
    setProjectData(prev => ({
      ...prev,
      title,
      slug: newSlug
    }));
  };

  const handleYearChange = (year) => {
    const parsedYear = parseInt(year) || new Date().getFullYear();
    const newSlug = projectData.title ? generateSlug(projectData.title, parsedYear) : '';
    setProjectData(prev => ({
      ...prev,
      year: parsedYear,
      slug: newSlug
    }));
  };

  const toggleTag = (tag) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Funciones de archivos (mantienen igual)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
  // ✅ AGREGAR: Validación de tamaño de archivos
  const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
  const validFiles = [];
  const rejectedFiles = [];

  newFiles.forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      rejectedFiles.push({
        name: file.name,
        size: file.size,
        reason: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Máximo permitido: 10MB`
      });
    } else {
      validFiles.push(file);
    }
  });

  // ✅ Mostrar archivos rechazados
  if (rejectedFiles.length > 0) {
    console.warn('Archivos rechazados:', rejectedFiles);
    alert(`${rejectedFiles.length} archivo(s) rechazado(s) por ser muy grandes:\n\n${rejectedFiles.map(f => `• ${f.name}: ${f.reason}`).join('\n')}`);
  }

  // ✅ Solo agregar archivos válidos
  if (validFiles.length > 0) {
    const filesWithMetadata = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: 'render',
      description: '',
      isMain: files.length === 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setFiles(prev => [...prev, ...filesWithMetadata]);
  }
};

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    if (!fileToRemove) return;
    
    // Mensaje de confirmación más informativo
    const isMainFile = fileToRemove.isMain;
    const confirmMessage = isMainFile 
      ? `¿Eliminar "${fileToRemove.file.name}"?\n\n⚠️ Este es el archivo principal. Si lo eliminas, se asignará automáticamente otro archivo como principal.`
      : `¿Eliminar "${fileToRemove.file.name}"?`;
    
    if (confirm(confirmMessage)) {
      setFiles(prev => {
        const updated = prev.filter(f => f.id !== fileId);
        
        // Si eliminamos el archivo principal y quedan archivos, asignar el primero como principal
        if (updated.length > 0 && !updated.some(f => f.isMain)) {
          updated[0].isMain = true;
          console.log(`📌 Nuevo archivo principal: ${updated[0].file.name}`);
        }
        
        return updated;
      });

      // Limpiar progreso de subida si existe
      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });

      console.log(`🗑️ Archivo eliminado: ${fileToRemove.file.name}`);
    }
  };

  const updateFileType = (fileId, type) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, type } : f
    ));
  };

  const updateFileDescription = (fileId, description) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, description } : f
    ));
  };

  const setAsMain = (fileId) => {
    setFiles(prev => prev.map(f => ({
      ...f,
      isMain: f.id === fileId
    })));
  };

  // ✅ NUEVA FUNCIÓN: Cambiar imagen del slider
  const handleSliderImageToggle = async (mediaId) => {
    if (!projectId || !mediaId) return;

    try {
      console.log('🎠 Cambiando imagen del slider:', { projectId, mediaId });
      
      await toggleSliderImage({ projectId, mediaId }).unwrap();
      setCurrentSliderImageId(mediaId);
      
      console.log('✅ Imagen del slider actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando imagen del slider:', error);
      alert('Error al cambiar la imagen del slider. Inténtalo de nuevo.');
    }
  };

  // ✅ FUNCIÓN MEJORADA de subida secuencial
const uploadFiles = async (targetProjectId = projectId) => {
  if (!targetProjectId || files.length === 0) return;

  setIsUploadingFiles(true);
  setUploadSummary(null);
  
  const results = {
    successful: [],
    failed: [],
    total: files.length
  };

  try {
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      // ✅ Verificar tamaño antes de subir
      if (fileData.file.size > 30 * 1024 * 1024) {
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { 
            status: 'error', 
            progress: 0,
            fileName: fileData.file.name,
            error: `Archivo muy grande (${(fileData.file.size / 1024 / 1024).toFixed(2)} MB). Máximo: 10MB`,
            current: i + 1,
            total: files.length
          }
        }));

        results.failed.push({
          file: fileData.file.name,
          type: fileData.type,
          error: 'Archivo muy grande'
        });
        
        continue;
      }
      
      // ✅ Actualizar progress: iniciando
      setUploadProgress(prev => ({
        ...prev,
        [fileData.id]: { 
          status: 'uploading', 
          progress: 0,
          fileName: fileData.file.name,
          current: i + 1,
          total: files.length
        }
      }));

      try {
        console.log(`🚀 Subiendo archivo ${i + 1}/${files.length}: ${fileData.file.name} (${(fileData.file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('type', fileData.type);
        formData.append('description', fileData.description);
        formData.append('isMain', fileData.isMain.toString());

        const result = await uploadMedia({
          projectId: targetProjectId,
          formData
        }).unwrap();

        // ✅ Marcar como completado
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { 
            status: 'completed', 
            progress: 100,
            fileName: fileData.file.name,
            current: i + 1,
            total: files.length
          }
        }));

        results.successful.push({
          file: fileData.file.name,
          type: fileData.type,
          mediaId: result.data?.id,        // ✅ Agregar mediaId
          originalName: result.data?.originalName,
          urls: result.data?.urls,
          isMain: result.data?.isMain,
          result
        });

        console.log(`✅ Archivo subido exitosamente: ${fileData.file.name}`);

      } catch (error) {
        console.error(`❌ Error subiendo ${fileData.file.name}:`, error);
        
        // ✅ Mejorar mensajes de error específicos
        let errorMessage = 'Error desconocido';
        
        if (error.status === 413) {
          errorMessage = 'Archivo muy grande para el servidor';
        } else if (error.status === 400) {
          errorMessage = error.data?.message || 'Error en la solicitud';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = error.data?.message || error.message || 'Error de conexión';
        }
        
        setUploadProgress(prev => ({
          ...prev,
          [fileData.id]: { 
            status: 'error', 
            progress: 0,
            fileName: fileData.file.name,
            error: errorMessage,
            current: i + 1,
            total: files.length
          }
        }));

        results.failed.push({
          file: fileData.file.name,
          type: fileData.type,
          error: errorMessage
        });
      }

      // ✅ Pausa entre archivos (especialmente para archivos grandes)
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // ✅ Mostrar resumen final mejorado CON mediaId para selector de slider
    const summaryWithMediaIds = {
      ...results,
      successful: results.successful.map(item => ({
        ...item,
        displayInfo: `${item.originalName || item.file} (${item.type}) - ID: ${item.mediaId || 'N/A'}${item.isMain ? ' [Principal]' : ''}`
      }))
    };
    
    setUploadSummary(summaryWithMediaIds);
    
    console.log(`🎯 Subida completada: ${results.successful.length}/${results.total} exitosos`);

    // ✅ Remover solo archivos exitosos
    setTimeout(() => {
      setFiles(prev => prev.filter(f => {
        const progress = uploadProgress[f.id];
        return progress?.status !== 'completed';
      }));
      
      // ✅ Mantener progress de errores por más tiempo
      setTimeout(() => {
        setUploadProgress(prev => {
          const filtered = {};
          Object.entries(prev).forEach(([id, progress]) => {
            if (progress.status === 'error') {
              // Mantener errores por 10 segundos más
              setTimeout(() => {
                setUploadProgress(current => {
                  const { [id]: removed, ...rest } = current;
                  return rest;
                });
              }, 10000);
              filtered[id] = progress;
            }
          });
          return filtered;
        });
        setUploadSummary(null);
      }, 5000);
    }, 2000);

  } catch (error) {
    console.error('💥 Error general en subida secuencial:', error);
  } finally {
    setIsUploadingFiles(false);
  }
};

  const handleProjectSubmit = async () => {
    if (!projectData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    try {
      const finalProjectData = {
        ...projectData,
        slug: projectData.slug || generateSlug(projectData.title, projectData.year)
      };

      console.log('🚀 Enviando proyecto con datos:', finalProjectData);

      // 1. Crear el proyecto
      const projectResult = await createProject(finalProjectData).unwrap();
      const newProjectId = projectResult.data.id;
      
      console.log('✅ Proyecto creado:', newProjectId);
      
      // 2. Subir archivos secuencialmente
      if (files.length > 0) {
        await uploadFiles(newProjectId);
      }

      // 3. Limpiar formulario (solo si no hay errores)
      if (Object.values(uploadProgress).every(p => p.status !== 'error')) {
        resetForm();
      }

      // 4. Callback
      onProjectCreated?.(projectResult.data);
      
    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
    }
  };

  const resetForm = () => {
    setProjectData({
      title: '',
      description: '',
      year: new Date().getFullYear(),
      location: '',
      client: '',
      architect: '',
      projectType: 'Proyecto',
      status: 'render',
      area: '',
      content: '',
      tags: [],
      slug: '',
      kuulaUrl: '',           // ✅ NUEVO CAMPO
      startDate: '',
      endDate: '',
      isFeatured: false,
      showInSlider: false,    // ✅ NUEVO CAMPO
      isPublic: true,
      isActive: true,
      order: 0
    });
    setFiles([]);
    setUploadProgress({});
    setUploadSummary(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          {projectId ? 'Subir archivos' : 'Crear proyecto'}
        </h2>
        <p className="text-sm text-gray-500">
          {projectId ? 
            'Agrega renders, planos y videos con sus descripciones' : 
            'Completa la información del proyecto y sube los archivos'
          }
        </p>
      </div>

      {/* ✅ INDICADOR DE PROGRESO DE SUBIDA */}
      {isUploadingFiles && Object.keys(uploadProgress).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              Subiendo archivos ({Object.values(uploadProgress).filter(p => p.status === 'completed').length}/{Object.keys(uploadProgress).length})
            </h4>
            <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />
          </div>
          
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="bg-white rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-700 truncate max-w-xs">
                      {progress.fileName}
                    </span>
                    <span className="text-xs text-blue-500">
                      ({progress.current}/{progress.total})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {progress.status === 'uploading' && (
                      <span className="text-blue-600">📤</span>
                    )}
                    {progress.status === 'completed' && (
                      <span className="text-green-600">✅</span>
                    )}
                    {progress.status === 'error' && (
                      <span className="text-red-600">❌</span>
                    )}
                  </div>
                </div>
                
                {progress.status === 'uploading' && (
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3" />
                  </div>
                )}
                
                {progress.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {progress.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ RESUMEN FINAL DE SUBIDA CON DETALLES */}
      {uploadSummary && (
        <div className={`border rounded-lg p-4 mb-6 ${
          uploadSummary.failed.length === 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h4 className="font-medium mb-3">
            📊 Resumen de subida
          </h4>
          <div className="space-y-2">
            <p className="text-green-700 font-medium">✅ {uploadSummary.successful.length} archivos subidos exitosamente</p>
            
            {/* Mostrar detalles de archivos exitosos con mediaId */}
            {uploadSummary.successful.length > 0 && (
              <div className="bg-white rounded border border-green-200 p-3 mt-2">
                <div className="text-xs text-gray-600 space-y-1">
                  {uploadSummary.successful.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="truncate mr-2">{item.displayInfo || item.file}</span>
                      {item.isMain && <span className="text-blue-600 text-xs bg-blue-100 px-1 rounded">Principal</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {uploadSummary.failed.length > 0 && (
              <>
                <p className="text-red-700 font-medium">❌ {uploadSummary.failed.length} archivos fallaron</p>
                <div className="bg-white rounded border border-red-200 p-3 mt-2">
                  <div className="text-xs text-red-600 space-y-1">
                    {uploadSummary.failed.map((item, index) => (
                      <div key={index}>
                        {item.file}: {item.error}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ GESTIÓN DE IMÁGENES SUBIDAS - Solo si hay proyectos exitosos */}
      {uploadSummary && uploadSummary.successful.length > 0 && projectData.showInSlider && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            🎠 Seleccionar imagen para slider
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona cuál imagen aparecerá en el slider de la página de proyectos:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadSummary.successful
              .filter(item => item.type === 'render') // Solo imágenes render
              .map((item) => (
                <div 
                  key={item.mediaId} 
                  className={`relative group border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    currentSliderImageId === item.mediaId 
                      ? 'border-naranjaDivanco shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Imagen preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    {item.urls?.mobile ? (
                      <img 
                        src={item.urls.mobile} 
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Overlay de estado */}
                    {currentSliderImageId === item.mediaId && (
                      <div className="absolute inset-0 bg-naranjaDivanco/20 flex items-center justify-center">
                        <div className="bg-naranjaDivanco text-white px-2 py-1 rounded text-xs font-medium">
                          EN SLIDER
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Información y botón */}
                  <div className="p-3">
                    <p className="text-xs text-gray-500 truncate mb-2">
                      {item.originalName}
                    </p>
                    
                    <button
                      onClick={() => handleSliderImageToggle(item.mediaId)}
                      disabled={currentSliderImageId === item.mediaId}
                      className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                        currentSliderImageId === item.mediaId
                          ? 'bg-naranjaDivanco text-white cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-naranjaDivanco hover:text-white'
                      }`}
                    >
                      {currentSliderImageId === item.mediaId ? '✓ En slider' : 'Usar en slider'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          
          {uploadSummary.successful.filter(item => item.type === 'render').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PhotoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay imágenes render subidas para usar en el slider</p>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO DE PROYECTO (mantiene igual - no lo copio completo por brevedad) */}
      {!projectId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* ... Todo el formulario existente se mantiene igual ... */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información del proyecto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del proyecto"
              />
            </div>
            
            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año *
              </label>
              <input
                type="number"
                value={projectData.year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="2000"
                max={new Date().getFullYear() + 5}
              />
            </div>

            {/* Slug - ✅ SOLO LECTURA */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <LinkIcon className="h-4 w-4" />
                Slug (URL del proyecto) - Solo lectura
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                  /proyectos/
                </span>
                <input
                  type="text"
                  value={projectData.slug}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="se-genera-automaticamente"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se genera automáticamente desde el título y año. No se puede modificar.
              </p>
            </div>

            {/* ✅ NUEVO CAMPO: URL de Kuula */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <LinkIcon className="h-4 w-4 text-blue-500" />
                URL de Kuula (Recorrido 360°)
              </label>
              <input
                type="url"
                value={projectData.kuulaUrl}
                onChange={(e) => setProjectData(prev => ({ ...prev, kuulaUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://kuula.co/share/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Si el proyecto tiene un recorrido virtual en Kuula, ingresa la URL aquí.
              </p>
            </div>

            {/* Resto de campos básicos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                value={projectData.location}
                onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ciudad, País"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <input
                type="text"
                value={projectData.client}
                onChange={(e) => setProjectData(prev => ({ ...prev, client: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de proyecto
              </label>
              <select
                value={projectData.projectType}
                onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {projectTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={projectData.status}
                onChange={(e) => setProjectData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {etapasOptions.map(etapa => (
                  <option key={etapa} value={etapa}>
                    {etapa.charAt(0).toUpperCase() + etapa.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                maxLength={1500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del proyecto..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {projectData.description.length}/1500 caracteres
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <TagIcon className="h-4 w-4" />
              Tags del proyecto ({projectData.tags.length} seleccionados)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-2 text-xs font-medium rounded-md transition-all duration-150
                    ${projectData.tags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }
                  `}
                >
                  {tag.replace('_', ' ')}
                </button>
              ))}
            </div>
            {projectData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Seleccionados:</span>
                {projectData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
                    {tag.replace('_', ' ')}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:text-blue-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ✅ NUEVAS OPCIONES DE PUBLICACIÓN */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones de publicación</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Proyecto destacado */}
              <div className="flex items-center">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={projectData.isFeatured}
                  onChange={(e) => setProjectData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                  Proyecto destacado
                </label>
              </div>

              {/* ✅ NUEVO: Mostrar en slider */}
              <div className="flex items-center">
                <input
                  id="showInSlider"
                  type="checkbox"
                  checked={projectData.showInSlider}
                  onChange={(e) => setProjectData(prev => ({ ...prev, showInSlider: e.target.checked }))}
                  className="h-4 w-4 text-naranjaDivanco focus:ring-naranjaDivanco border-gray-300 rounded"
                />
                <label htmlFor="showInSlider" className="ml-2 block text-sm text-gray-700">
                  Mostrar en slider principal
                </label>
              </div>

              {/* Público */}
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={projectData.isPublic}
                  onChange={(e) => setProjectData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Proyecto público
                </label>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>• <strong>Destacado:</strong> Aparecerá en la sección de proyectos destacados</p>
              <p>• <strong>Slider principal:</strong> Se mostrará en el carrusel de la página de proyectos</p>
              <p>• <strong>Público:</strong> Visible para todos los visitantes del sitio</p>
            </div>
          </div>
        </div>
      )}

      {/* ZONA DE SUBIDA DE ARCHIVOS (mantiene igual) */}
      <div
  className={`
    relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 mb-8
    ${isDragging 
      ? 'border-blue-500 bg-blue-50' 
      : 'border-gray-300 hover:border-gray-400'
    }
  `}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/*,video/*,.pdf"
    onChange={handleFileSelect}
    className="hidden"
  />
  
  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
  
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    Arrastra archivos aquí
  </h3>
  <p className="text-sm text-gray-500 mb-4">
    O{' '}
    <button
      onClick={() => fileInputRef.current?.click()}
      className="text-blue-600 hover:text-blue-700 font-medium"
    >
      selecciona archivos
    </button>
  </p>
  
  {/* ✅ MEJORAR: Información de límites */}
  <div className="space-y-2">
    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
      <span>• Imágenes: JPG, PNG, WebP</span>
      <span>• Videos: MP4, WebM</span>
      <span>• Documentos: PDF</span>
    </div>
    <div className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-1 inline-block">
      ⚠️ Tamaño máximo por archivo: 30 MB
    </div>
    <div className="text-xs text-green-600 bg-green-50 rounded px-3 py-1 inline-block">
      ✨ Las imágenes se optimizarán automáticamente para web
    </div>
  </div>
</div>

      {/* LISTA DE ARCHIVOS CON OPCIONES DE GESTIÓN */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Archivos seleccionados ({files.length})
            </h3>
            
            {/* Botón para eliminar todos los archivos */}
            {files.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`¿Estás seguro de que quieres eliminar todos los ${files.length} archivos seleccionados?`)) {
                    setFiles([]);
                    setUploadProgress({});
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
              >
                🗑️ Eliminar todos
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {files.map((fileData) => {
              const fileType = fileTypes[fileData.type];
              const IconComponent = fileType.icon;
              const progress = uploadProgress[fileData.id];
              
              return (
                <div
                  key={fileData.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                    progress?.status === 'completed' ? 'bg-green-50 border border-green-200' :
                    progress?.status === 'error' ? 'bg-red-50 border border-red-200' :
                    progress?.status === 'uploading' ? 'bg-blue-50 border border-blue-200' :
                    'bg-gray-50'
                  }`}
                >
                  {/* Preview/Icon */}
                  <div className="flex-shrink-0 relative">
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt=""
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className={`w-20 h-20 ${fileType.bgColor} rounded-md flex items-center justify-center`}>
                        <IconComponent className={`h-8 w-8 ${fileType.color}`} />
                      </div>
                    )}
                    
                    {/* Status overlay */}
                    {progress && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {progress.status === 'uploading' && (
                          <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />
                        )}
                        {progress.status === 'completed' && (
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        )}
                        {progress.status === 'error' && (
                          <XMarkIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {progress?.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {progress.error}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {/* Selector de tipo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo de archivo
                        </label>
                        <select
                          value={fileData.type}
                          onChange={(e) => updateFileType(fileData.id, e.target.value)}
                          disabled={progress?.status === 'uploading'}
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          {Object.entries(fileTypes).map(([key, type]) => (
                            <option key={key} value={key}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Marcar como principal */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Imagen principal
                        </label>
                        <button
                          onClick={() => setAsMain(fileData.id)}
                          disabled={progress?.status === 'uploading'}
                          className={`
                            w-full text-sm px-3 py-2 rounded transition-colors disabled:opacity-50
                            ${fileData.isMain
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300'
                            }
                          `}
                        >
                          {fileData.isMain ? (
                            <>
                              <CheckIcon className="inline h-4 w-4 mr-1" />
                              Imagen principal
                            </>
                          ) : (
                            'Marcar como principal'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Descripción del archivo */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descripción del archivo
                      </label>
                      <textarea
                        placeholder={`Describe este ${fileType.label.toLowerCase()}...`}
                        value={fileData.description}
                        onChange={(e) => updateFileDescription(fileData.id, e.target.value)}
                        disabled={progress?.status === 'uploading'}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  {/* Botón eliminar mejorado */}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    disabled={progress?.status === 'uploading'}
                    title="Eliminar archivo"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Errores */}
      {(uploadError || createError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">
              Error: {uploadError || createError}
            </span>
          </div>
        </div>
      )}

      {/* ✅ BOTONES ACTUALIZADOS */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={resetForm}
          disabled={isUploadingFiles}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {projectId ? 'Limpiar archivos' : 'Limpiar formulario'}
        </button>
        
        {projectId ? (
          <button
            onClick={() => uploadFiles()}
            disabled={files.length === 0 || isUploadingFiles}
            className="
              px-6 py-2 text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
              rounded-md transition-colors
              disabled:cursor-not-allowed
            "
          >
            {isUploadingFiles ? 'Subiendo archivos...' : `Subir ${files.length} archivos`}
          </button>
        ) : (
          <button
            onClick={handleProjectSubmit}
            disabled={!projectData.title.trim() || isCreating || isUploadingFiles}
            className="
              px-6 py-2 text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
              rounded-md transition-colors
              disabled:cursor-not-allowed
            "
          >
            {isCreating ? 'Creando proyecto...' : 
             isUploadingFiles ? 'Subiendo archivos...' : 
             'Crear proyecto'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectUpload;