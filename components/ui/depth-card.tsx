'use client';

import React, { useRef, useState, useEffect, useId } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'motion/react';

export interface DepthCardLayer {
  image: string;
  speed?: number;
  className?: string;
  alt?: string;
}

export interface DepthCardProps {
  image?: string;
  title?: string;
  description?: string;
  width?: number | string;
  height?: number | string;
  maxRotation?: number;
  maxTranslation?: number;
  borderRadius?: string;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  imageAlt?: string;
  disableOnMobile?: boolean;
  ariaLabel?: string;
  layers?: DepthCardLayer[];
  staggerDelay?: number;
  revealAnimation?: 'slide' | 'fade' | 'scale';
  respectReducedMotion?: boolean;
  spotlight?: boolean;
  spotlightColor?: string;
  children?: React.ReactNode;
}

export function DepthCard({
  image,
  title = '',
  description,
  width,
  height,
  maxRotation = 20,
  maxTranslation = 20,
  borderRadius = '16px',
  className = '',
  contentClassName = '',
  onClick,
  href,
  target = '_self',
  imageAlt = '',
  disableOnMobile = false,
  ariaLabel,
  layers,
  staggerDelay = 100,
  revealAnimation = 'slide',
  respectReducedMotion = true,
  spotlight = true,
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  children,
}: DepthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Normalized mouse coords: [-1, 1]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spotlight percentage coords: [0, 100]
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => {
        window.removeEventListener('resize', checkMobile);
        mediaQuery.removeEventListener('change', listener);
      };
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [respectReducedMotion]);

  const activeEffects = !(disableOnMobile && isMobile) && !prefersReducedMotion;

  const springConfig = { damping: 22, stiffness: 220, mass: 0.6 };

  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], activeEffects ? [maxRotation, -maxRotation] : [0, 0]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], activeEffects ? [-maxRotation, maxRotation] : [0, 0]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(mouseX, [-1, 1], activeEffects ? [-maxTranslation, maxTranslation] : [0, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(mouseY, [-1, 1], activeEffects ? [-maxTranslation, maxTranslation] : [0, 0]),
    springConfig
  );

  const smoothSpotX = useSpring(spotX, { damping: 25, stiffness: 250 });
  const smoothSpotY = useSpring(spotY, { damping: 25, stiffness: 250 });

  const spotlightBackground = useMotionTemplate`radial-gradient(circle 280px at ${smoothSpotX}% ${smoothSpotY}%, ${spotlightColor}, transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !activeEffects) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    mouseX.set(normX);
    mouseY.set(normY);

    spotX.set((x / rect.width) * 100);
    spotY.set((y / rect.height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    spotX.set(50);
    spotY.set(50);
  };

  const revealVariants = {
    hidden:
      revealAnimation === 'scale'
        ? { opacity: 0, scale: 0.95 }
        : revealAnimation === 'fade'
        ? { opacity: 0 }
        : { opacity: 0, y: 20 },
    visible:
      revealAnimation === 'scale'
        ? { opacity: 1, scale: 1 }
        : revealAnimation === 'fade'
        ? { opacity: 1 }
        : { opacity: 1, y: 0 },
  };

  const cardContent = (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={revealVariants}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      style={{
        width: width ?? '100%',
        height: height ?? '100%',
        borderRadius,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative group cursor-pointer select-none overflow-hidden transition-shadow duration-500 shadow-md hover:shadow-2xl ${className}`}
      role={ariaLabel || title ? 'region' : undefined}
      aria-label={ariaLabel || title}
    >
      {/* Base Background Image or Fallback */}
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={imageAlt || title}
        />
      )}

      {/* Parallax Layers */}
      {layers &&
        layers.map((layer, idx) => {
          const speed = layer.speed ?? (idx + 1) * 0.4;
          return (
            <motion.div
              key={idx}
              style={{
                x: useTransform(translateX, (v) => v * speed),
                y: useTransform(translateY, (v) => v * speed),
                transformStyle: 'preserve-3d',
              }}
              className={`absolute inset-0 pointer-events-none ${layer.className || ''}`}
            >
              <img
                src={layer.image}
                alt={layer.alt || `Layer ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          );
        })}

      {/* Spotlight Effect */}
      {spotlight && activeEffects && (
        <motion.div
          style={{ background: spotlightBackground }}
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Floating Content in 3D Space */}
      <motion.div
        style={{
          transform: 'translateZ(35px)',
          transformStyle: 'preserve-3d',
        }}
        className={`relative z-30 w-full h-full flex flex-col justify-end p-6 ${contentClassName}`}
      >
        {children ? (
          children
        ) : (
          <div className="space-y-2">
            {title && (
              <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-white/80 line-clamp-2 leading-relaxed drop-shadow-sm">
                {description}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} target={target} className="block w-full h-full no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default DepthCard;
