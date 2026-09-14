import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

export function predispositionRouter(db: Database) {
  const router = Router();

  router.post('/calculate', (req: Request, res: Response) => {
    try {
      const { region_id, habits, family_history, chronic_conditions } = req.body;

      if (!region_id) {
         res.status(400).json({ error: 'region_id is required' });
         return;
      }

      // Fetch epidemiological data for the region
      const epiStmt = db.prepare('SELECT * FROM epidemiological_data WHERE region_id = ?');
      epiStmt.bind([region_id]);
      const epiData = [];
      while (epiStmt.step()) {
        epiData.push(epiStmt.getAsObject());
      }
      epiStmt.free();

      const results = epiData.map((data: any) => {
        let baseScore = 20; // Base score out of 100
        
        // Base regional modifier
        if (data.trend === 'Subindo') baseScore += 15;
        if (data.cases_count > 100) baseScore += 10;

        let riskScore = baseScore;
        const diseaseLower = (data.disease_name as string).toLowerCase();

        // Lifestyle modifiers
        if (habits) {
          if (habits.smoking === true) riskScore += 30;
          if (habits.exercise === false) riskScore += 20;
          if (habits.diet === 'poor') riskScore += 15;
        }

        // Family history modifiers
        if (family_history && Array.isArray(family_history)) {
          family_history.forEach(condition => {
            riskScore += 25; // simplified match
          });
        }

        // Chronic conditions modifiers
        if (chronic_conditions && Array.isArray(chronic_conditions)) {
          chronic_conditions.forEach(condition => {
            riskScore += 35; // simplified match
          });
        }

        // Cap at 100
        riskScore = Math.min(riskScore, 100);

        let riskLevel = 'Baixo';
        if (riskScore >= 70) riskLevel = 'Alto';
        else if (riskScore >= 40) riskLevel = 'Médio';

        let recommendation = data.preventative_recommendations || 'Consulte um médico regularmente.';
        if (habits?.smoking === true && diseaseLower.includes('respir')) {
          recommendation += ' Pare de fumar imediatamente para reduzir riscos respiratórios.';
        }
        if (habits?.exercise === false) {
           recommendation += ' Pratique atividades físicas pelo menos 3 vezes na semana.';
        }

        return {
          disease: data.disease_name,
          risk_level: riskLevel,
          risk_score: riskScore,
          factors: data.risk_factors,
          recommendations: recommendation
        };
      });

      // Save to database
      const sql = `
        INSERT INTO predisposition_assessments (
          user_region_id, habits_data, family_history, chronic_conditions, calculated_risk_results
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        region_id,
        habits ? JSON.stringify(habits) : null,
        family_history ? JSON.stringify(family_history) : null,
        chronic_conditions ? JSON.stringify(chronic_conditions) : null,
        JSON.stringify(results)
      ];

      db.run(sql, params);

      res.json({ results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
