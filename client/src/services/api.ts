import { Topic, Formula, SimulationMeta, SearchResult } from '../types/physics';
import { topicsData, formulasData, simulationsData } from '../data/physicsData';

const API_BASE = '/api';

export async function fetchTopics(): Promise<Topic[]> {
  try {
    const res = await fetch(`${API_BASE}/topics`);
    if (!res.ok) throw new Error('Falha ao buscar tópicos da API');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API Fallback] Utilizando dados locais de tópicos:', err);
    return topicsData;
  }
}

export async function fetchTopicBySlug(slug: string): Promise<Topic | null> {
  try {
    const res = await fetch(`${API_BASE}/topics/${slug}`);
    if (!res.ok) throw new Error(`Tópico ${slug} não encontrado na API`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API Fallback] Utilizando dados locais para tópico ${slug}:`, err);
    const found = topicsData.find((t) => t.slug === slug || t.id === slug);
    return found || null;
  }
}

export async function fetchFormulas(topic?: string): Promise<Formula[]> {
  try {
    const url = topic ? `${API_BASE}/formulas?topic=${encodeURIComponent(topic)}` : `${API_BASE}/formulas`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao buscar fórmulas da API');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API Fallback] Utilizando dados locais de fórmulas:', err);
    if (topic) {
      return formulasData.filter(
        (f) => f.topicSlug.toLowerCase() === topic.toLowerCase() || f.topic.toLowerCase() === topic.toLowerCase()
      );
    }
    return formulasData;
  }
}

export async function fetchFormulaById(id: string): Promise<Formula | null> {
  try {
    const res = await fetch(`${API_BASE}/formulas/${id}`);
    if (!res.ok) throw new Error(`Fórmula ${id} não encontrada na API`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API Fallback] Utilizando dados locais para fórmula ${id}:`, err);
    const found = formulasData.find((f) => f.id === id);
    return found || null;
  }
}

export async function fetchSimulations(topic?: string): Promise<SimulationMeta[]> {
  try {
    const url = topic ? `${API_BASE}/simulations?topic=${encodeURIComponent(topic)}` : `${API_BASE}/simulations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao buscar simulações da API');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API Fallback] Utilizando dados locais de simulações:', err);
    if (topic) {
      return simulationsData.filter((s) => s.topicSlug.toLowerCase() === topic.toLowerCase());
    }
    return simulationsData;
  }
}

export async function fetchSimulationById(id: string): Promise<SimulationMeta | null> {
  try {
    const res = await fetch(`${API_BASE}/simulations/${id}`);
    if (!res.ok) throw new Error(`Simulação ${id} não encontrada na API`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API Fallback] Utilizando dados locais para simulação ${id}:`, err);
    const found = simulationsData.find((s) => s.id === id);
    return found || null;
  }
}

export async function searchGlobal(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    return { topics: [], formulas: [], simulations: [], concepts: [] };
  }

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Falha na busca pela API');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[API Fallback] Utilizando busca local:', err);
    const q = query.toLowerCase();
    const matchedTopics = topicsData.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
    const matchedFormulas = formulasData.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.variables.some((v) => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q))
    );
    const matchedSimulations = simulationsData.filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
    const matchedConcepts: Array<{
      id: string;
      title: string;
      summary: string;
      topicSlug: string;
      topicTitle: string;
    }> = [];
    topicsData.forEach((t) => {
      t.fundamentalConcepts.forEach((c) => {
        if (c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)) {
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

    return {
      topics: matchedTopics,
      formulas: matchedFormulas,
      simulations: matchedSimulations,
      concepts: matchedConcepts,
    };
  }
}
