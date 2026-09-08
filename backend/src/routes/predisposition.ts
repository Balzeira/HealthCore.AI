import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

export function predispositionRouter(db: Database) {
  const router = Router();

  router.post('/calculate', (req: Request, res: Response) => {
    try {
      const { district_name, habits, family_history, chronic_conditions } = req.body;

      // Extract lifestyle factors
      const isSmoker = habits?.tabagismo === 'Fumo diariamente' || habits?.tabagismo === 'Fumo ocasionalmente' || habits?.smoking === true;
      const isSedentary = habits?.exercicio === 'Não' || habits?.exercise === false || habits?.freqExercicio === 'Raramente ou nunca';
      const poorDiet = habits?.alimentacao === 'Ultraprocessados e fast-food' || habits?.diet === 'poor';
      const poorSleep = habits?.sono === 'Menos de 5 horas' || habits?.sono === '5 a 6 horas irregulares';
      const highAlcohol = habits?.alcool === 'Frequente' || habits?.alcool === 'Diário';

      const familyList: string[] = Array.isArray(family_history) ? family_history.filter(f => f !== 'Nenhuma') : [];
      const chronicList: string[] = Array.isArray(chronic_conditions) ? chronic_conditions.filter(c => c !== 'Nenhuma') : [];

      const results = [];

      // 1. Dimensão Cardiovascular & Metabólica
      {
        const cardFactors: string[] = [];
        let points = 0;

        if (isSmoker) { points += 3; cardFactors.push('Tabagismo ativo'); }
        if (isSedentary) { points += 2; cardFactors.push('Sedentarismo / baixa atividade física'); }
        if (poorDiet) { points += 2; cardFactors.push('Dieta rica em ultraprocessados e sódio'); }
        if (poorSleep) { points += 1; cardFactors.push('Privação crônica de sono'); }
        if (highAlcohol) { points += 2; cardFactors.push('Consumo frequente de álcool'); }

        const hasFamilyCard = familyList.some(f => f.toLowerCase().includes('hipertens') || f.toLowerCase().includes('cardio') || f.toLowerCase().includes('diabet'));
        if (hasFamilyCard) { points += 3; cardFactors.push('Histórico familiar de eventos cardiovasculares/diabetes'); }

        const hasChronicCard = chronicList.some(c => c.toLowerCase().includes('hipertens') || c.toLowerCase().includes('diabet') || c.toLowerCase().includes('colesterol'));
        if (hasChronicCard) { points += 4; cardFactors.push('Condição metabólica ou pressórica preexistente'); }

        let riskLevel: 'Baixo' | 'Moderado' | 'Elevado' = 'Baixo';
        if (points >= 6) riskLevel = 'Elevado';
        else if (points >= 3) riskLevel = 'Moderado';

        results.push({
          dimension: 'Saúde Cardiovascular & Metabólica',
          risk_level: riskLevel,
          points_evaluated: points,
          factors: cardFactors.length > 0 ? cardFactors : ['Hábitos de vida e histórico favoráveis'],
          recommendations: riskLevel === 'Elevado'
            ? 'Monitore periodicamente sua pressão arterial e glicemia na UBS/clínica e priorize consultas preventivas de rotina.'
            : riskLevel === 'Moderado'
            ? 'Adoção de caminhadas regulares de 150 min/semana e redução do consumo de sódio e ultraprocessados.'
            : 'Mantenha a rotina equilibrada de exercícios e alimentação rica em fibras e alimentos frescos.'
        });
      }

      // 2. Dimensão Respiratória & Exposição Urbana
      {
        const respFactors: string[] = [];
        let points = 0;

        if (isSmoker) { points += 4; respFactors.push('Inalação frequente de fumaça / tabaco'); }
        const hasChronicResp = chronicList.some(c => c.toLowerCase().includes('asma') || c.toLowerCase().includes('bronquite') || c.toLowerCase().includes('rinite'));
        if (hasChronicResp) { points += 4; respFactors.push('Diagnóstico prévio de asma, bronquite ou rinite'); }

        const hasFamilyResp = familyList.some(f => f.toLowerCase().includes('asma') || f.toLowerCase().includes('respirat'));
        if (hasFamilyResp) { points += 2; respFactors.push('Histórico familiar de afecções respiratórias'); }

        // Urban exposure factor
        respFactors.push('Exposição ao material particulado atmosférico da capital paulista');
        points += 1;

        let riskLevel: 'Baixo' | 'Moderado' | 'Elevado' = 'Baixo';
        if (points >= 6) riskLevel = 'Elevado';
        else if (points >= 3) riskLevel = 'Moderado';

        results.push({
          dimension: 'Vulnerabilidade Respiratória & Ambiente',
          risk_level: riskLevel,
          points_evaluated: points,
          factors: respFactors,
          recommendations: riskLevel === 'Elevado'
            ? 'Evite exercícios ao ar livre em dias de baixa umidade (ar seco) e mantenha ambientes bem ventilados e umidificados.'
            : riskLevel === 'Moderado'
            ? 'Aumente a ingestão de água ao longo do dia (mínimo 2 litros) e utilize vaporizadores em períodos de ar seco.'
            : 'Boa proteção respiratória; continue mantendo ambientes domésticos limpos e arejados.'
        });
      }

      // 3. Dimensão de Vigilância Territorial & Vetores
      {
        const terrFactors: string[] = [];
        let points = 1; // baseline urban SP risk

        terrFactors.push(`Região de monitoramento: ${district_name || 'São Paulo Capital'}`);
        if (district_name) {
          terrFactors.push('Sazonalidade de chuvas e calor favorável à proliferação de vetores (Aedes aegypti)');
          points += 2;
        }

        let riskLevel: 'Baixo' | 'Moderado' | 'Elevado' = 'Moderado';
        if (points >= 4) riskLevel = 'Elevado';
        else if (points <= 1) riskLevel = 'Baixo';

        results.push({
          dimension: 'Exposição Ambiental a Vetores Urbanos',
          risk_level: riskLevel,
          points_evaluated: points,
          factors: terrFactors,
          recommendations: 'Realize vistoria semanal no domicílio eliminando água parada em pratos de vasos, calhas e ralos externos.'
        });
      }

      // Record assessment in SQLite
      try {
        const sql = `
          INSERT INTO predisposition_assessments (
            user_region_id, habits_data, family_history, chronic_conditions, calculated_risk_results
          ) VALUES (?, ?, ?, ?, ?)
        `;
        db.run(sql, [
          1,
          JSON.stringify(habits || {}),
          JSON.stringify(family_history || []),
          JSON.stringify(chronic_conditions || []),
          JSON.stringify(results)
        ]);
      } catch (e) {
        console.warn('DB recording notice:', e);
      }

      res.json({
        success: true,
        district: district_name || 'São Paulo',
        disclaimer: 'Este indicador é exclusivamente educativo e informativo, não constitui diagnóstico médico e não substitui a avaliação de um profissional de saúde.',
        methodology: 'Modelo heurístico baseado nas diretrizes de fatores de risco de saúde pública da OMS e dados territoriais de São Paulo.',
        results,
        evaluated_at: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
