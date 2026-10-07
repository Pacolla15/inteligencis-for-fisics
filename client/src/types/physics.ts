export interface Variable {
  symbol: string;
  name: string;
  unit: string;
  description: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface Example {
  problem: string;
  given: Record<string, number | string>;
  steps: string[];
  result: string;
}

export interface Formula {
  id: string;
  name: string;
  topic: string;
  topicSlug: string;
  expression: string;
  description: string;
  variables: Variable[];
  units: string;
  example: Example;
  calculatorType: string;
}

export interface FundamentalConcept {
  id: string;
  title: string;
  summary: string;
  detail: string;
  keyRule?: string;
}

export interface Challenge {
  id: string;
  question: string;
  options?: string[];
  correctOption?: number;
  explanation: string;
  hint: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  conceptsCount: number;
  color: string;
  introduction: string;
  fundamentalConcepts: FundamentalConcept[];
  relatedSimulationIds: string[];
  formulaIds: string[];
  challenges: Challenge[];
}

export interface SimulationMeta {
  id: string;
  title: string;
  topicSlug: string;
  topicName: string;
  description: string;
  badge: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  keyConcepts: string[];
  formulasUsed: string[];
  instructions: string[];
}

export interface SearchResult {
  topics: Topic[];
  formulas: Formula[];
  simulations: SimulationMeta[];
  concepts: Array<{
    id: string;
    title: string;
    summary: string;
    topicSlug: string;
    topicTitle: string;
  }>;
}
