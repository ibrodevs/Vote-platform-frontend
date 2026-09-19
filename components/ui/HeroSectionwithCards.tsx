'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/Badge';
import GlobeWireframe from '@/components/ui/globe-wireframe';

interface HeroSectionProps {
  lang?: 'ru' | 'ky';
}

export function HeroSectionwithCards({ lang = 'ru' }: HeroSectionProps) {
  return (
    <section className="relative w-full border-b border-[var(--line)] bg-[var(--bg)] overflow-hidden transition-colors duration-500 h-[480px] sm:h-[560px] md:h-[640px]">
      {/* Text Content */}
      <div className="relative z-10 flex flex-col items-center pt-10 sm:pt-14 md:pt-16 text-center px-4 max-w-4xl mx-auto">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-4"
        >
          <Badge variant="blue" dot={true}>
            {lang === 'ru'
              ? 'DOBUSH.KG — ЭЛЕКТРОННОЕ ГОЛОСОВАНИЕ 5.0'
              : 'DOBUSH.KG — ЭЛЕКТРОНДУК ДОБУШ БЕРҮҮ 5.0'}
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl md:text-5xl font-[800] text-[var(--ink)] max-w-2xl leading-[1.15] tracking-tight"
        >
          {lang === 'ru' ? (
            <>
              Студенческие выборы{' '}
              <em className="font-extrabold not-italic text-[var(--blue)]">
                нового поколения
              </em>
            </>
          ) : (
            <>
              Жаңы муундагы{' '}
              <em className="font-extrabold not-italic text-[var(--blue)]">
                студенттик шайлоо
              </em>
            </>
          )}
        </motion.h1>
      </div>

      {/* Radial soft glow behind the globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(37,102,255,0.18),transparent_70%)] pointer-events-none" />

      {/* Globe Wireframe with smooth mask */}
      <div className="absolute bottom-[-45%] sm:bottom-[-35%] md:bottom-[-30%] left-1/2 w-[130%] sm:w-full max-w-4xl h-full -translate-x-1/2 text-[var(--blue)] flex items-center justify-center [mask-image:linear-gradient(to_bottom,black_45%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_92%)]">
        <GlobeWireframe
          className="w-full h-full text-[var(--blue)]"
          variant="solid"
          scale={0.9}
          strokeColor="var(--blue)"
          sphereOutlineColor="var(--blue)"
          countryHoverColor="var(--blue)"
        />
      </div>

      {/* Bottom Gradient Fade Overlay for seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 md:h-48 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-transparent pointer-events-none z-10" />
    </section>
  );
}

export default HeroSectionwithCards;
