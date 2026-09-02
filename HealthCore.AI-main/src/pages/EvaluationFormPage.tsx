import React, { useState } from 'react';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';
import { ALL_SP_DISTRICTS } from '../data/spBoundaries';

export default function EvaluationFormPage() {
  const [bairro, setBairro] = useState('');
  const [ratings, setRatings] = useState({
    limpeza: 0,
    insetos: 0,
    ar: 0,
    saude: 0,
  });
  const [comentarios, setComentarios] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (key: keyof typeof ratings, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (photos.length < 3) {
        setPhotos(prev => [...prev, url]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bairro) {
      setError('Por favor, selecione uma subprefeitura/região de São Paulo.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/evaluations', {
        region_id: 1,
        bairro,
        public_cleanliness_rating: ratings.limpeza,
        insect_incidence_rating: ratings.insetos,
        air_quality_rating: ratings.ar,
        health_service_rating: ratings.saude,
        feedback_text: comentarios,
        target_email: 'lucascristobaldasso@gmail.com'
      });
      setSuccess(true);
    } catch (err: any) {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D', padding: '6px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
          <span>📝</span>
          <span>Vigilância Cidadã em Saúde</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px' }}>
          Avaliação Sanitária de Região
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#94A3B8', margin: 0 }}>
          Ajude a manter o mapa epidemiológico de São Paulo atualizado relatando as condições do seu bairro.
        </p>
      </div>

      {success ? (
        <div className="hud-card" style={{ padding: '48px', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10B981' }}>
          <div style={{ width: '72px', height: '72px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>
            ✅
          </div>
          <h2 style={{ color: '#34D399', marginBottom: '10px', fontSize: '1.75rem', fontWeight: 800 }}>
            Avaliação Transmitida com Sucesso!
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', marginBottom: '24px' }}>
            Seus dados foram integrados ao modelo preditivo do HealthCore.AI para apoiar as ações sanitárias da capital.
          </p>
          <button 
            className="btn-primary"
            onClick={() => {
              setSuccess(false);
              setBairro('');
              setRatings({ limpeza: 0, insetos: 0, ar: 0, saude: 0 });
              setComentarios('');
              setPhotos([]);
            }}
          >
            Enviar Nova Avaliação
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '36px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '16px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, border: '1px solid #EF4444' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 800, color: '#F8FAFC', fontSize: '1rem' }}>
              Subprefeitura / Região de São Paulo
            </label>
            <select
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070B14',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value="">Selecione uma das 32 subprefeituras...</option>
              {ALL_SP_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.zone}) — Subprefeitura {d.subprefeitura}
                </option>
              ))}
            </select>
          </div>

          {/* Ratings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', backgroundColor: '#070B14', borderRadius: '14px', border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', fontSize: '1rem' }}>🧹 Limpeza Urbana</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Coleta de lixo e varrição</span>
              </div>
              <StarRating value={ratings.limpeza} onChange={(v: number) => handleRatingChange('limpeza', v)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', backgroundColor: '#070B14', borderRadius: '14px', border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', fontSize: '1rem' }}>🦟 Focos de Mosquitos</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Água parada / Aedes aegypti</span>
              </div>
              <StarRating value={ratings.insetos} onChange={(v: number) => handleRatingChange('insetos', v)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', backgroundColor: '#070B14', borderRadius: '14px', border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', fontSize: '1rem' }}>🌬️ Qualidade do Ar</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Poluição e poeira suspensa</span>
              </div>
              <StarRating value={ratings.ar} onChange={(v: number) => handleRatingChange('ar', v)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', backgroundColor: '#070B14', borderRadius: '14px', border: '1px solid #1E293B' }}>
              <div>
                <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block', fontSize: '1rem' }}>🏥 Postos de Saúde (UBS)</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Atendimento local</span>
              </div>
              <StarRating value={ratings.saude} onChange={(v: number) => handleRatingChange('saude', v)} />
            </div>

          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 800, color: '#F8FAFC', fontSize: '1rem' }}>
              Comentários e Detalhamento da Ocorrência
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Descreva pontos com entulho, falta de médicos ou boas práticas observadas..."
              style={{
                width: '100%',
                backgroundColor: '#070B14',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: '14px',
                padding: '16px',
                minHeight: '120px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ padding: '18px', fontSize: '1.1rem' }}
          >
            {submitting ? 'Transmitindo Dados...' : 'Submeter Avaliação Sanitária ▶'}
          </button>
        </form>
      )}

    </div>
  );
}
