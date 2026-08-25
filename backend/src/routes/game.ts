import { Router, Request, Response } from 'express';
import { Database } from 'sql.js';

const QUESTIONS = [
  { id: 1, text: "Qual a melhor forma de evitar o mosquito da Dengue?", options: [{ id: "A", text: "Usar máscara" }, { id: "B", text: "Não deixar água parada" }, { id: "C", text: "Comer bem" }, { id: "D", text: "Dormir cedo" }], correct: "B" },
  { id: 2, text: "O que significa UBS?", options: [{ id: "A", text: "Unidade Básica de Saúde" }, { id: "B", text: "União Brasileira de Saúde" }, { id: "C", text: "Urgência Básica de Saúde" }], correct: "A" },
  { id: 3, text: "Onde devo ir em caso de emergência grave (ex: acidente)?", options: [{ id: "A", text: "Farmácia" }, { id: "B", text: "UBS" }, { id: "C", text: "Pronto-Socorro / Hospital" }], correct: "C" },
  { id: 4, text: "Quando é recomendado lavar as mãos?", options: [{ id: "A", text: "Só antes de comer" }, { id: "B", text: "Nunca" }, { id: "C", text: "Sempre após usar o banheiro, antes das refeições e ao chegar da rua" }], correct: "C" },
  { id: 5, text: "Qual doença é transmitida por roedores em épocas de enchentes?", options: [{ id: "A", text: "Dengue" }, { id: "B", text: "Leptospirose" }, { id: "C", text: "Gripe" }], correct: "B" },
  { id: 6, text: "Como se prevenir contra a gripe (Influenza)?", options: [{ id: "A", text: "Vacinação anual" }, { id: "B", text: "Beber muita água apenas" }, { id: "C", text: "Evitar sair no sol" }], correct: "A" },
  { id: 7, text: "O ar poluído de São Paulo agrava quais tipos de problemas de saúde?", options: [{ id: "A", text: "Problemas ortopédicos" }, { id: "B", text: "Problemas respiratórios (Asma, Bronquite)" }, { id: "C", text: "Problemas digestivos" }], correct: "B" },
  { id: 8, text: "Quem tem prioridade em campanhas de vacinação geralmente?", options: [{ id: "A", text: "Crianças, idosos, gestantes e profissionais de saúde" }, { id: "B", text: "Somente adultos saudáveis" }, { id: "C", text: "Ninguém" }], correct: "A" },
  { id: 9, text: "Quais são sintomas clássicos de COVID-19?", options: [{ id: "A", text: "Dor no pé" }, { id: "B", text: "Febre, tosse e falta de ar" }, { id: "C", text: "Coceira" }], correct: "B" },
  { id: 10, text: "O que é o SUS?", options: [{ id: "A", text: "Sistema Único de Saúde" }, { id: "B", text: "Sociedade Universal de Saúde" }, { id: "C", text: "Secretaria Urbana de Saúde" }], correct: "A" }
];

export function gameRouter(db: Database) {
  const router = Router();

  router.get('/questions', (req: Request, res: Response) => {
    // Return questions without the correct answers
    const safeQuestions = QUESTIONS.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options
    }));
    res.json({ questions: safeQuestions });
  });

  router.post('/submit', (req: Request, res: Response) => {
    try {
      const { region_id, answers, time_seconds } = req.body;

      if (!answers || !Array.isArray(answers)) {
        res.status(400).json({ error: 'Answers must be an array' });
        return;
      }

      let score = 0;
      let correctAnswersCount = 0;
      const feedbackPerQuestion: any[] = [];

      answers.forEach((ans: any) => {
        const question = QUESTIONS.find(q => q.id === ans.question_id);
        if (question) {
          const isCorrect = question.correct === ans.selected_option;
          if (isCorrect) {
            score += 100;
            correctAnswersCount++;
          }
          feedbackPerQuestion.push({
            question_id: question.id,
            isCorrect,
            correct_option: question.correct
          });
        }
      });

      // Bonus for speed (max 500 bonus)
      if (time_seconds && time_seconds < 120) {
        const bonus = Math.max(0, Math.floor((120 - time_seconds) * 4));
        score += bonus;
      }

      const totalPossible = QUESTIONS.length * 100 + 500;
      const percentage = (score / totalPossible) * 100;

      let badge = 'Iniciante';
      if (percentage >= 80) badge = 'Mestre da Saúde Urbana';
      else if (percentage >= 50) badge = 'Especialista Local';

      const sql = `
        INSERT INTO agent_game_sessions (region_id, score, answers_data)
        VALUES (?, ?, ?)
      `;
      
      const params = [
        region_id || null,
        score,
        JSON.stringify(answers)
      ];

      db.run(sql, params);

      res.json({
        score,
        total_possible: totalPossible,
        percentage,
        badge,
        correct_answers: correctAnswersCount,
        total_questions: QUESTIONS.length,
        feedback_per_question: feedbackPerQuestion
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
