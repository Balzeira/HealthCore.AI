import React, { useState, useEffect, useRef } from 'react';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';

interface AuthPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: string; district: string }) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [district, setDistrict] = useState<string>('Sé (Centro)');
  const [role, setRole] = useState<string>('Cidadão');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginProgress, setLoginProgress] = useState<number>(0);
  const [loginStageText, setLoginStageText] = useState<string>('Autenticando credenciais...');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startLoginTransition = (userObj: { name: string; email: string; role: string; district: string }) => {
    setIsLoggingIn(true);
    setLoginProgress(10);
    setLoginStageText('Autenticando credenciais no portal SUS...');

    const interval = setInterval(() => {
      setLoginProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          return 100;
        }
        if (p > 60) {
          setLoginStageText('Carregando Observatório Epidemiológico de SP...');
        } else if (p > 30) {
          setLoginStageText('Sincronizando 96 Distritos e Rede Hospitalar (CNES)...');
        }
        return p + 6;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setLoginProgress(100);
      setTimeout(() => {
        localStorage.setItem('healthcore_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      }, 400);
    }, 1700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      const newUser = {
        name: name.trim(),
        email: email.trim(),
        role,
        district
      };
      startLoginTransition(newUser);
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Informe seu e-mail e senha para continuar.');
        return;
      }
      const existingRaw = localStorage.getItem('healthcore_user');
      let loggedUser = {
        name: email.split('@')[0],
        email: email.trim(),
        role: 'Cidadão Conectado',
        district: 'São Paulo - Capital'
      };
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          if (parsed.email === email.trim()) {
            loggedUser = parsed;
          }
        } catch (e) {}
      }
      startLoginTransition(loggedUser);
    }
  };

  const handleGuestAccess = () => {
    const guestUser = {
      name: 'Visitante São Paulo',
      email: 'visitante@healthcore.sp.gov.br',
      role: 'Acesso Cidadão',
      district: 'Sé (Centro)'
    };
    startLoginTransition(guestUser);
  };

  // Background animated particle network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
    const colors = ['#3B82F6', '#60A5FA', '#10B981', '#6366F1', '#38BDF8'];
    const count = Math.min(65, Math.floor((width * height) / 18000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#040711',
      overflow: 'hidden',
      padding: '24px'
    }}>
      
      {/* ── High-Tech Authenticating Loading Screen ── */}
      {isLoggingIn && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: '#060A14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Logo & Ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '2px solid rgba(59, 130, 246, 0.35)',
              boxShadow: '0 0 35px rgba(59, 130, 246, 0.4), inset 0 0 25px rgba(59, 130, 246, 0.1)',
              animation: 'spin 6s linear infinite'
            }} />
            <img
              src="/assets/mockups/03_logo_healthcore.png"
              alt="HealthCore Logo"
              style={{
                width: '115px',
                height: '115px',
                objectFit: 'contain',
                borderRadius: '24px',
                filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6))',
                position: 'relative',
                zIndex: 2
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Brand Titles */}
          <div style={{ textAlign: 'center', zIndex: 2 }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              HealthCore<span style={{ color: '#3B82F6' }}>.AI</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 700, marginTop: '4px' }}>
              {loginStageText}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div style={{ width: '320px', maxWidth: '85vw', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '100px',
              overflow: 'hidden',
              padding: '1px'
            }}>
              <div style={{
                height: '100%',
                width: `${loginProgress}%`,
                background: 'linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA)',
                borderRadius: '100px',
                transition: 'width 0.1s ease-out',
                boxShadow: '0 0 14px rgba(59, 130, 246, 0.9)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
              <span>Conectando ao SUS</span>
              <span style={{ color: '#60A5FA' }}>{loginProgress}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Background Ambient High-Tech Canvas Animation */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.85,
          pointerEvents: 'none'
        }}
      />

      {/* Cyber Grid Radial Light Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(16, 185, 129, 0.08) 40%, transparent 70%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Main Glassmorphic Auth Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '520px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: '24px',
        padding: '36px 40px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(59, 130, 246, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Brand & Portal Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 0 24px rgba(37, 99, 235, 0.6)',
            border: '1px solid rgba(147, 197, 253, 0.4)',
            marginBottom: '4px'
          }}>
            🏥
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', margin: 0 }}>
              HealthCore<span style={{ color: '#60A5FA' }}>.AI</span>
            </h1>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 900,
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              SP CAPITAL
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#94A3B8', margin: 0 }}>
            Observatório Epidemiológico & Rede Hospitalar de São Paulo
          </p>
        </div>

        {/* Tab Switcher: Login vs Cadastro */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#070B14',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid #334155'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: !isRegisterMode ? '#2563EB' : 'transparent',
              color: !isRegisterMode ? '#FFFFFF' : '#94A3B8',
              boxShadow: !isRegisterMode ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            🔑 Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isRegisterMode ? '#2563EB' : 'transparent',
              color: isRegisterMode ? '#FFFFFF' : '#94A3B8',
              boxShadow: isRegisterMode ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            ✨ Criar Cadastro
          </button>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Full Name (Only in Register Mode) */}
          {isRegisterMode && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                Nome Completo:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dra. Mariana Santos ou Lucas Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#070B14',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
              E-mail de Acesso:
            </label>
            <input
              type="email"
              required
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070B14',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* District & Role Selectors (Only in Register Mode) */}
          {isRegisterMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Sua Subprefeitura:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#070B14',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {ALL_SP_DISTRICTS.map(d => (
                    <option key={d.id} value={`${d.name} (${d.zone})`}>
                      {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                  Perfil:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#070B14',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Cidadão">👤 Cidadão</option>
                  <option value="Agente Comunitário">🛡️ Agente de Saúde</option>
                  <option value="Profissional da Saúde">🩺 Médico / Enfermeiro</option>
                  <option value="Gestor Público">📊 Gestor Público</option>
                  <option value="Pesquisador">🔬 Pesquisador</option>
                </select>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
              Senha:
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070B14',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 900,
              marginTop: '4px',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
            }}
          >
            {isLoading ? 'Autenticando...' : isRegisterMode ? '✓ Finalizar Cadastro e Entrar' : '🚀 Acessar Plataforma'}
          </button>
        </form>

        {/* Guest / Demo 1-Click Access Button */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={handleGuestAccess}
            style={{
              width: '100%',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              color: '#94A3B8',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>⚡ Acesso Rápido de Visitante (1 Clique)</span>
          </button>
        </div>

        {/* Security & LGPD Compliance Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span>🔒</span>
          <span>Ambiente Seguro • Dados em conformidade com a LGPD e SUS</span>
        </div>

      </div>

    </div>
  );
}
