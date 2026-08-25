import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

export function regionsRouter(db: Database) {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const sql = `
        SELECT r.id, r.name, r.risk_level, r.latitude, r.longitude,
               COUNT(e.id) as diseases_tracked,
               SUM(e.cases_count) as total_cases
        FROM regions r
        LEFT JOIN epidemiological_data e ON r.id = e.region_id
        GROUP BY r.id
      `;
      const stmt = db.prepare(sql);
      const regions = [];
      while (stmt.step()) {
        regions.push(stmt.getAsObject());
      }
      stmt.free();

      res.json({ regions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id/details', (req: Request, res: Response) => {
    try {
      const regionId = parseInt(req.params.id, 10);
      if (isNaN(regionId)) {
         res.status(400).json({ error: 'Invalid region ID' });
         return;
      }

      const regionStmt = db.prepare('SELECT * FROM regions WHERE id = ?');
      regionStmt.bind([regionId]);
      let region = null;
      if (regionStmt.step()) {
        region = regionStmt.getAsObject();
      }
      regionStmt.free();

      if (!region) {
         res.status(404).json({ error: 'Region not found' });
         return;
      }

      const epiStmt = db.prepare('SELECT * FROM epidemiological_data WHERE region_id = ?');
      epiStmt.bind([regionId]);
      const epidemiological_data = [];
      while (epiStmt.step()) {
        epidemiological_data.push(epiStmt.getAsObject());
      }
      epiStmt.free();

      const evalStmt = db.prepare(`
        SELECT 
          AVG(public_cleanliness_rating) as avg_cleanliness,
          AVG(insect_incidence_rating) as avg_insect_incidence,
          AVG(air_quality_rating) as avg_air_quality,
          AVG(health_service_rating) as avg_health_service,
          COUNT(id) as total_evaluations
        FROM user_evaluations
        WHERE region_id = ?
      `);
      evalStmt.bind([regionId]);
      let evaluations = null;
      if (evalStmt.step()) {
        evaluations = evalStmt.getAsObject();
      }
      evalStmt.free();

      res.json({
        ...region,
        epidemiological_data,
        aggregate_evaluations: evaluations
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
