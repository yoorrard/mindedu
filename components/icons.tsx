import React from 'react';

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1" />
    </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

export const LoadingSpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 50 50" className={className} stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none">
    {/* Radial lines */}
    <path d="M25 5 V12" />
    <path d="M37 13 L32 18" />
    <path d="M45 25 H38" />
    <path d="M37 37 L32 32" />
    <path d="M25 45 V38" />
    <path d="M13 37 L18 32" />
    <path d="M5 25 H12" />
    <path d="M13 13 L18 18" />
    {/* Center Bar */}
    <path d="M15 25 H35" />
  </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1" />
    </svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.2.4 2.3 1.1 3.2-2 .5-3.6 2.2-3.6 4.3 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-2.1-1.6-3.8-3.6-4.3.7-.9 1.1-2 1.1-3.2A4.5 4.5 0 0 0 12 2z" />
        <path d="M12 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5zM4.5 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5zM19.5 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5z" />
    </svg>
);