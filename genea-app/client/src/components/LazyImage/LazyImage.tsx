import React, { useState, useEffect } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = '/assets/placeholder.jpg',
  className = '',
  width,
  height
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isLowQuality, setIsLowQuality] = useState<boolean>(true);
  const [connection, setConnection] = useState<string>('unknown');

  useEffect(() => {
    // Detectar tipo de conexión
    if ('connection' in navigator && navigator['connection']) {
      const networkInfo = navigator['connection'];
      setConnection(networkInfo.effectiveType || 'unknown');
    }

    // Cargar imagen optimizada según la conexión
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setIsLowQuality(false);
    };

    // Si la conexión es lenta, cargar una versión de menor calidad primero
    if (connection === '2g' || connection === 'slow-2g') {
      // Aquí podrías cargar una versión más pequeña de la imagen
      // Por ejemplo, usando un servicio de redimensionamiento como Cloudinary
      const lowQualitySrc = src.replace('/original/', '/low-quality/');
      const lowQualityImg = new Image();
      lowQualityImg.src = lowQualitySrc;
      lowQualityImg.onload = () => {
        setImageSrc(lowQualitySrc);
        setImageLoaded(true);
        
        // Luego cargar la versión de alta calidad
        setTimeout(() => {
          setImageSrc(src);
          setIsLowQuality(false);
        }, 1000);
      };
    }
  }, [src, placeholderSrc, connection]);

  return (
    <div className={`lazy-image-container ${className}`} style={{ width, height }}>
      {!imageLoaded && <div className="lazy-image-placeholder" />}
      <img
        src={imageSrc}
        alt={alt}
        className={`lazy-image ${imageLoaded ? 'loaded' : ''} ${isLowQuality ? 'low-quality' : ''}`}
        style={{ width, height }}
      />
    </div>
  );
};

export default LazyImage;