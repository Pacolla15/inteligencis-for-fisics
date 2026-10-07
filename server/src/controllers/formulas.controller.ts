import { Request, Response } from 'express';
import { formulasData } from '../data/formulas.data.js';

export const getAllFormulas = (req: Request, res: Response) => {
  try {
    const { topic } = req.query;
    let formulas = formulasData;

    if (topic && typeof topic === 'string') {
      formulas = formulas.filter(
        (f) => f.topicSlug.toLowerCase() === topic.toLowerCase() || f.topic.toLowerCase() === topic.toLowerCase()
      );
    }

    return res.status(200).json({
      success: true,
      count: formulas.length,
      data: formulas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao recuperar fórmulas.',
    });
  }
};

export const getFormulaById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const formula = formulasData.find((f) => f.id === id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: `Fórmula com identificador '${id}' não encontrada.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: formula,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao recuperar fórmula solicitada.',
    });
  }
};
