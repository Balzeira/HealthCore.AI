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

      const recipient = data.recipient_email || data.email || TARGET_EMAIL;

      console.log(`[EMAIL NOTIFICATION DISPATCHED TO ${recipient}]`);
      console.log(`Type: ${type}`);
      console.log(`Payload:`, JSON.stringify(data, null, 2));

      let typeLabel = 'Notificação Sanitária';
      if (type === 'evaluation') typeLabel = 'Avaliação de Região';
      else if (type === 'bug_report') typeLabel = 'Erro Técnico';
      else if (type === 'quiz_certificate') typeLabel = 'Certificado & Relatório de Desempenho do Agente de Saúde';
      else if (type === 'suggestion') typeLabel = 'Sugestão / Feedback';

      // Return successful simulation payload with destination email
      res.json({
        success: true,
        target_email: recipient,
        type,
        message: `${typeLabel} enviado com sucesso para ${recipient}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
