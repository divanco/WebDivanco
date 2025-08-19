import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

const VideoPlayer = ({ 
  video, 
  className = "", 
  autoPlay = false, 
  showControls = true,
  poster = null 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomControls, setShowCustomControls] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowCustomControls(true)}
      onMouseLeave={() => setShowCustomControls(false)}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={video.url}
        poster={poster || video.thumbnail}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        preload="metadata"
        controls={!showControls}
      />

      {/* Custom controls overlay */}
      {showControls && (
        <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showCustomControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Play/Pause button overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div className="bg-black bg-opacity-50 rounded-full p-4 transition-all hover:bg-opacity-70">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black via-black/50 to-transparent p-4">
            {/* Progress bar */}
            <div 
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-3"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Pantalla completa"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video info overlay */}
      {video.title && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {video.title}
        </div>
      )}
    </div>
  );
};

const VideoGallery = ({ videos = [], className = "" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!videos || videos.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900">Videos</h3>
      
      {videos.length === 1 ? (
        // Single video - display large
        <VideoPlayer 
          video={videos[0]} 
          className="w-full aspect-video"
          showControls={true}
        />
      ) : (
        // Multiple videos - display as gallery
        <>
          {selectedVideo ? (
            <div className="space-y-4">
              <VideoPlayer 
                video={selectedVideo} 
                className="w-full aspect-video"
                showControls={true}
              />
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Volver a la galería
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div 
                  key={video.id || index}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={video.url}
                      poster={video.thumbnail}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-3">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>

                  {/* Video info */}
                  <div className="mt-2">
                    {video.title && (
                      <h4 className="font-medium text-gray-900 line-clamp-2">
                        {video.title}
                      </h4>
                    )}
                    {video.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    )}
                    {video.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duración: {video.duration}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { VideoPlayer, VideoGallery };
export default VideoPlayer;
