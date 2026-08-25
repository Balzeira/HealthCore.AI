import React, { useState } from 'react';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';

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

  const bairros = [
    'Sé', 'Pinheiros', 'Itaquera', 'Vila Mariana', 'Moema', 'Bela Vista', 'Liberdade', 'Tatuapé', 'Santana'
  ];

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
      setError('Por favor, selecione um bairro.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/evaluations', {
        region_id: 1,
        public_cleanliness_rating: ratings.limpeza,
        insect_incidence_rating: ratings.insetos,
        air_quality_rating: ratings.ar,
        health_service_rating: ratings.saude,
        feedback_text: comentarios
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="evaluation-page fade-in" style={{ padding: '1rem', paddingBottom: '5rem' }}>
      <div className="header-title" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0047AB', marginBottom: '0.5rem' }}>Avaliação de Região</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Contribua para a inteligência em saúde de São Paulo relatando as condições do seu bairro.
        </p>
      </div>

      {success ? (
        <div className="card-glass" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#e6f4ea' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Avaliação Enviada!</h3>
          <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Obrigado por ajudar a tornar São Paulo mais saudável.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSuccess(false);
              setBairro('');
              setRatings({ limpeza: 0, insetos: 0, ar: 0, saude: 0 });
              setComentarios('');
              setPhotos([]);
            }}
            style={{ backgroundColor: '#0047AB', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Enviar Nova Avaliação
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {error && <div className="alert alert-danger" style={{ backgroundColor: '#FFEBEE', color: '#FF3B30', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>Bairro de São Paulo</label>
            <select 
              value={bairro} 
              onChange={(e) => setBairro(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ccc' }}
            >
              <option value="">Selecione um bairro...</option>
              {bairros.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="ratings-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="rating-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0047AB" strokeWidth="2"><path d="M22 9l-9-9-9 9"></path><path d="M13 22v-9h-2v9"></path><path d="M9 13H4v9h5z"></path></svg>
                <span style={{ fontWeight: 500 }}>Limpeza Pública</span>
              </div>
              <StarRating value={ratings.limpeza} onChange={(v: number) => handleRatingChange('limpeza', v)} />
            </div>

            <div className="rating-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span style={{ fontWeight: 500 }}>Incidência de Insetos</span>
              </div>
              <StarRating value={ratings.insetos} onChange={(v: number) => handleRatingChange('insetos', v)} />
            </div>

            <div className="rating-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>
                <span style={{ fontWeight: 500 }}>Qualidade do Ar</span>
              </div>
              <StarRating value={ratings.ar} onChange={(v: number) => handleRatingChange('ar', v)} />
            </div>

            <div className="rating-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                <span style={{ fontWeight: 500 }}>Serviço de Saúde Local</span>
              </div>
              <StarRating value={ratings.saude} onChange={(v: number) => handleRatingChange('saude', v)} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>Comentários Adicionais</label>
            <textarea 
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Detalhe os problemas ou pontos positivos observados..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>Evidências e Riscos (Opcional) - {photos.length}/3</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {photos.map((photo, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              {photos.length < 3 && (
                <label style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{
              backgroundColor: '#0047AB', color: 'white', border: 'none', padding: '16px',
              borderRadius: '12px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1.1rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação ▶'}
          </button>
        </form>
      )}
    </div>
  );
}
