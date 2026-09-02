import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 2;
      });
    }, 50);

    // Phase transitions
    const holdTimer = setTimeout(() => setPhase('hold'), 400);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const doneTimer = setTimeout(() => onDone(), 2800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#070B14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s ease',
        overflow: 'hidden'
      }}
    >
      {/* Background particle grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(37, 99, 235, 0.12) 0%, transparent 60%), radial-gradient(circle at 75% 65%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      {/* Animated grid lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        animation: 'splashGlowPulse 2s ease-in-out infinite'
      }} />

      {/* Logo container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        transform: phase === 'enter' ? 'translateY(20px)' : 'translateY(0)',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        {/* Logo glow ring */}
        <div style={{
          position: 'absolute',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.2), inset 0 0 40px rgba(59, 130, 246, 0.05)',
          animation: 'splashRingRotate 8s linear infinite',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 0
        }} />

        <img
          src="/assets/mockups/03_logo_healthcore.png"
          alt="HealthCore.AI"
          style={{
            width: '130px',
            height: '130px',
            objectFit: 'contain',
            borderRadius: '28px',
            filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
            position: 'relative',
            zIndex: 1
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* App name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '8px'
          }}>
            HealthCore
            <span style={{
              color: '#3B82F6',
              fontWeight: 900,
              verticalAlign: 'super',
              fontSize: '1.2rem',
              marginLeft: '2px'
            }}>.AI</span>
          </div>
          <div style={{
            fontSize: '0.95rem',
            color: '#64748B',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Plataforma de Saúde Pública · São Paulo
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '280px',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      }}>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '3px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '100px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA)',
            borderRadius: '100px',
            transition: 'width 0.05s linear',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)'
          }} />
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6',
                opacity: 0.4,
                animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
          <span style={{
            fontSize: '0.78rem',
            color: '#475569',
            fontWeight: 700,
            marginLeft: '4px'
          }}>
            Carregando dados do SUS...
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        fontSize: '0.72rem',
        color: '#1E293B',
        fontWeight: 600,
        letterSpacing: '0.08em',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'opacity 1s ease 0.5s'
      }}>
        SECRETARIA MUNICIPAL DE SAÚDE · SP · 2026
      </div>

      {/* CSS Animations via style tag */}
      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes splashGlowPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes splashRingRotate {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
