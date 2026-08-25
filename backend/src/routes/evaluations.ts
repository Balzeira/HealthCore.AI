import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

export function evaluationsRouter(db: Database) {
  const router = Router();

  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        region_id,
        public_cleanliness_rating,
        insect_incidence_rating,
        air_quality_rating,
        health_service_rating,
        feedback_text
      } = req.body;

      if (!region_id) {
         res.status(400).json({ error: 'region_id is required' });
         return;
      }

      // Basic validation
      const ratings = [public_cleanliness_rating, insect_incidence_rating, air_quality_rating, health_service_rating];
      for (const r of ratings) {
        if (r !== undefined && r !== null && (r < 1 || r > 5)) {
           res.status(400).json({ error: 'Ratings must be between 1 and 5' });
           return;
        }
      }

      const sql = `
        INSERT INTO user_evaluations (
          region_id, public_cleanliness_rating, insect_incidence_rating, air_quality_rating, health_service_rating, feedback_text
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        region_id,
        public_cleanliness_rating || null,
        insect_incidence_rating || null,
        air_quality_rating || null,
        health_service_rating || null,
        feedback_text || null
      ];

      db.run(sql, params);
      
      // Get the inserted id
      const stmt = db.prepare('SELECT last_insert_rowid() as id');
      let id = null;
      if (stmt.step()) {
        id = stmt.getAsObject().id;
      }
      stmt.free();

      res.status(201).json({
        id,
        region_id,
        public_cleanliness_rating,
        insect_incidence_rating,
        air_quality_rating,
        health_service_rating,
        feedback_text
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
