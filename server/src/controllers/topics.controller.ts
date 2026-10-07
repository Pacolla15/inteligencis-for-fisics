import { Request, Response } from 'express';
import { topicsData } from '../data/topics.data.js';

export const getAllTopics = (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: topicsData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao recuperar tópicos de mecânica.',
    });
  }
};

export const getTopicBySlug = (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const topic = topicsData.find((t) => t.slug === slug || t.id === slug);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: `Assunto '${slug}' não encontrado.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao recuperar assunto solicitado.',
    });
  }
};
