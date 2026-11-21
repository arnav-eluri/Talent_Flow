import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

interface PreloaderProps {
  onDone: () => void;
}

export default function Preloader({ onDone }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Drive progress to 100 over ~900ms then fade out
    const steps = [
      { target: 40, delay: 50 },
      { target: 70, delay: 300 },
      { target: 90, delay: 550 },
      { target: 100, delay: 800 },
    ];

    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    );

    const fadeTimer = setTimeout(() => setFading(true), 950);
    const doneTimer = setTimeout(() => onDone(), 1250);

    return () => {
      [...timers, fadeTimer, doneTimer].forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'hsl(172, 55%, 9%)',
        transition: 'opacity 0.3s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Logo mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'hsl(172, 65%, 36%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Briefcase size={22} color="white" />
        </div>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          TalentFlow
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 99,
            background: 'hsl(172, 65%, 50%)',
            width: `${progress}%`,
            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}
