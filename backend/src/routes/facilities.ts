import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

// Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function facilitiesRouter(db: Database) {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    try {
      const { lat, lng, radius, region_id, type, is_24h, is_emergency, search } = req.query;

      let sql = 'SELECT * FROM health_facilities WHERE 1=1';
      const params: any[] = [];

      if (region_id) {
        sql += ' AND region_id = ?';
        params.push(parseInt(region_id as string, 10));
      }

      if (type) {
        sql += ' AND type = ?';
        params.push(type as string);
      }

      if (is_24h === '1' || is_24h === 'true') {
        sql += ' AND is_24h = 1';
      }

      if (is_emergency === '1' || is_emergency === 'true') {
        sql += ' AND is_emergency = 1';
      }

      if (search) {
        sql += ' AND (name LIKE ? OR address LIKE ? OR specialties LIKE ?)';
        const term = `%${search as string}%`;
        params.push(term, term, term);
      }

      const stmt = db.prepare(sql);
      stmt.bind(params);
      const facilities = [];
      while (stmt.step()) {
        facilities.push(stmt.getAsObject());
      }
      stmt.free();

      // Filter by distance and add calculated fields if lat/lng are provided
      if (lat && lng) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        const maxRadius = radius ? parseFloat(radius as string) : null;

        const withDistances = facilities.map(f => {
          const dist = calculateDistance(userLat, userLng, f.latitude as number, f.longitude as number);
          return {
            ...f,
            distance_km: parseFloat(dist.toFixed(2)),
            walking_time_mins: Math.max(1, Math.round(dist / 5 * 60)), // Assuming 5km/h walking speed
            driving_time_mins: Math.max(1, Math.round(dist / 30 * 60)) // Assuming 30km/h driving speed
          };
        });

        const filtered = maxRadius ? withDistances.filter(f => f.distance_km <= maxRadius) : withDistances;
        filtered.sort((a, b) => a.distance_km - b.distance_km);
        
        res.json({ facilities: filtered });
        return;
      }

      res.json({ facilities });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
