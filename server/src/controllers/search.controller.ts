import { Request, Response } from 'express';
import { topicsData } from '../data/topics.data.js';
import { formulasData } from '../data/formulas.data.js';
import { simulationsData } from '../data/simulations.data.js';

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const searchGlobal = (req: Request, res: Response) => {
  try {
    const rawQuery = ((req.query.q as string) || '').trim();

    if (!rawQuery) {
      return res.status(200).json({
        success: true,
        total: 0,
        query: rawQuery,
        data: {
          topics: [],
          formulas: [],
          simulations: [],
          concepts: [],
        },
      });
    }

    const query = normalizeText(rawQuery);

    // Match topics
    const matchedTopics = topicsData.filter(
      (t) =>
        normalizeText(t.title).includes(query) ||
        normalizeText(t.description).includes(query) ||
        normalizeText(t.tagline).includes(query)
    );

    // Match formulas
    const matchedFormulas = formulasData.filter(
      (f) =>
        normalizeText(f.name).includes(query) ||
        normalizeText(f.description).includes(query) ||
        normalizeText(f.topic).includes(query) ||
        f.variables.some((v) => normalizeText(v.name).includes(query) || normalizeText(v.symbol).includes(query))
    );

    // Match simulations
    const matchedSimulations = simulationsData.filter(
      (s) =>
        normalizeText(s.title).includes(query) ||
        normalizeText(s.description).includes(query) ||
        s.keyConcepts.some((c) => normalizeText(c).includes(query))
    );

    // Match fundamental concepts
    const matchedConcepts: Array<{
      id: string;
      title: string;
      summary: string;
      topicSlug: string;
      topicTitle: string;
    }> = [];

    topicsData.forEach((t) => {
      t.fundamentalConcepts.forEach((c) => {
        if (
          normalizeText(c.title).includes(query) ||
          normalizeText(c.summary).includes(query) ||
          normalizeText(c.detail).includes(query)
        ) {
          matchedConcepts.push({
            id: c.id,
            title: c.title,
            summary: c.summary,
            topicSlug: t.slug,
            topicTitle: t.title,
          });
        }
      });
    });

    const totalMatches =
      matchedTopics.length + matchedFormulas.length + matchedSimulations.length + matchedConcepts.length;

    return res.status(200).json({
      success: true,
      total: totalMatches,
      query: rawQuery,
      data: {
        topics: matchedTopics,
        formulas: matchedFormulas,
        simulations: matchedSimulations,
        concepts: matchedConcepts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno durante a busca.',
    });
  }
};
