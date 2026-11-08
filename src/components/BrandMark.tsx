import React from 'react';
import { BRAND } from '../config/brand';

/** App logo (iOS-style rounded square). */
export const BrandMark: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => (
  <img
    src="/brand/logo-192.png"
    alt={BRAND.name}
    width={size}
    height={size}
    draggable={false}
    className={`shrink-0 rounded-[22%] shadow-[0_2px_10px_rgba(124,58,237,0.35)] ${className}`}
    style={{ width: size, height: size }}
  />
);
