import { Request, Response } from 'express';
import { simulationsData } from '../data/simulations.data.js';

export const getAllSimulations = (req: Request, res: Response) => {
  try {
    const { topic } = req.query;
    let sims = simulationsData;

    if (topic && typeof topic === 'string') {
      sims = sims.filter((s) => s.topicSlug.toLowerCase() === topic.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: sims.length,
      data: sims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao recuperar lista de simulações.',
    });
  }
};

export const getSimulationById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sim = simulationsData.find((s) => s.id === id);

    if (!sim) {
      return res.status(404).json({
        success: false,
        message: `Simulação '${id}' não encontrada.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: sim,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao recuperar simulação solicitada.',
    });
  }
};
