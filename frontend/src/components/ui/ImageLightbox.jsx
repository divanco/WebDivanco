import React, { useState, useEffect, useCallback } from 'react';

const ImageLightbox = ({ images, isOpen, currentIndex = 0, onClose, onNext, onPrev }) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    const nextIndex = (index + 1) % images.length;
    setIndex(nextIndex);
    onNext?.(nextIndex);
  }, [index, images.length, onNext]);

  const handlePrev = useCallback(() => {
    const prevIndex = (index - 1 + images.length) % images.length;
    setIndex(prevIndex);
    onPrev?.(prevIndex);
  }, [index, images.length, onPrev]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'ArrowLeft':
        handlePrev();
        break;
      default:
        break;
    }
  }, [isOpen, onClose, handleNext, handlePrev]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[index];
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Overlay para cerrar */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Contenido del lightbox */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navegación anterior */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Imagen principal */}
        <div className="relative max-w-5xl max-h-full">
          <img
            src={currentImage.urls?.desktop || currentImage.urls?.mobile || currentImage.url}
            alt={currentImage.description || `Imagen ${index + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Información de la imagen */}
          {currentImage.description && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white text-lg">{currentImage.description}</p>
            </div>
          )}
        </div>

        {/* Navegación siguiente */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {index + 1} / {images.length}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className={`w-16 h-12 overflow-hidden rounded border-2 transition-all ${
                  idx === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image.urls?.thumbnail || image.urls?.mobile || image.urls?.desktop || image.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
