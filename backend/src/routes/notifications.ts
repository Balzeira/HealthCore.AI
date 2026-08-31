import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

export function notificationsRouter(db?: Database) {
  const router = Router();

  const TARGET_EMAIL = 'lucascristobaldasso@gmail.com';

  router.post('/email', (req: Request, res: Response) => {
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        res.status(400).json({ error: 'Payload incompleto. Tipo e dados são obrigatórios.' });
        return;
      }

      console.log(`[EMAIL NOTIFICATION SENT TO ${TARGET_EMAIL}]`);
      console.log(`Type: ${type}`);
      console.log(`Payload:`, JSON.stringify(data, null, 2));

      // Return successful simulation payload with destination email
      res.json({
        success: true,
        target_email: TARGET_EMAIL,
        type,
        message: `Relatório de ${type === 'evaluation' ? 'Avaliação de Região' : type === 'bug_report' ? 'Erro Técnico' : 'Sugestão'} enviado com sucesso para ${TARGET_EMAIL}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
