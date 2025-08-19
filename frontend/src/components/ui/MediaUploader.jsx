import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, Trash2 } from 'lucide-react';

const MediaUploader = ({ 
  onImageUpload, 
  onVideoUpload, 
  onImageDelete, 
  onVideoDelete, 
  images = [], 
  videos = [], 
  isUploading = false,
  imageType = 'gallery',
  acceptedImageTypes = "image/jpeg,image/jpg,image/png,image/webp",
  acceptedVideoTypes = "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/mkv",
  maxImageSize = 30 * 1024 * 1024,
  maxVideoSize = 100 * 1024 * 1024 // 100MB
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = (files) => {
    if (uploadType === 'image') {
      // Filter valid images
      const validImages = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert('Error: El archivo debe ser una imagen.');
          return false;
        }
        if (file.size > maxImageSize) {
          alert(`Advertencia: El archivo es grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Se optimizará automáticamente en el servidor.`);
        }
        return true;
      });
      if (validImages.length > 0) {
        onImageUpload(validImages, imageType); // Pass array
      }
    } else {
      files.forEach(file => {
        if (file.type.startsWith('video/')) {
          if (file.size > maxVideoSize) {
            alert(`Advertencia: El video es grande (${(file.size / 1024 / 1024).toFixed(2)} MB).`);
          }
          onVideoUpload(file);
        } else {
          alert('Error: El archivo debe ser un video.');
        }
      });
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Type Selector */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setUploadType('image')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
            uploadType === 'image'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Image size={20} />
          <span>Imágenes</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadType('video')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
            uploadType === 'video'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Video size={20} />
          <span>Videos</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={uploadType === 'image' ? acceptedImageTypes : acceptedVideoTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            uploadType === 'image' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            {uploadType === 'image' ? (
              <Image className={`w-8 h-8 ${uploadType === 'image' ? 'text-blue-600' : 'text-purple-600'}`} />
            ) : (
              <Video className={`w-8 h-8 ${uploadType === 'video' ? 'text-purple-600' : 'text-blue-600'}`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Subiendo archivos...' : `Arrastra y suelta ${uploadType === 'image' ? 'imágenes' : 'videos'} aquí`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              o haz clic para seleccionar archivos
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {uploadType === 'image' 
                ? `Máximo ${maxImageSize / (1024 * 1024)}MB por imagen`
                : `Máximo ${maxVideoSize / (1024 * 1024)}MB por video`
              }
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Subiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {(images.length > 0 || videos.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Medios subidos</h3>
          
          {/* Images */}
          {images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes ({images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt || `Imagen ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageDelete(image.id || index);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {image.caption && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Videos ({videos.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video, index) => (
                  <div key={video.id || index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVideoDelete(video.id || index);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all opacity-75 hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {video.title && (
                        <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                      )}
                      {video.duration && (
                        <p className="text-xs text-gray-500">Duración: {video.duration}</p>
                      )}
                      {video.size && (
                        <p className="text-xs text-gray-500">Tamaño: {formatFileSize(video.size)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
