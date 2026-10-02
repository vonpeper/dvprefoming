export interface ScriptCharacter {
  id: string;
  name: string;
  normalizedName: string;
  assignedStudentFolio?: string;
  assignedStudentName?: string;
  voiceGender?: "MALE" | "FEMALE" | "NEUTRAL";
  voicePitch?: number; // 0.5 a 1.5 (default 1.0)
  voiceRate?: number; // 0.7 a 1.3 (default 1.0)
  voiceName?: string; // Nombre de voz preferida de síntesis
  colorTag?: string; // Color HEX o clase tailwind para identificar al personaje
  totalLinesCount: number;
}

export interface ScriptLine {
  id: string;
  order: number;
  actNumber?: number;
  sceneNumber?: number;
  sceneTitle?: string;
  characterName: string;
  direction?: string; // Acotación teatral entre paréntesis: e.g. "(nerviosa, mirando a la puerta)"
  dialogue: string; // Parlamento hablado sin acotaciones ni nombre
  rawLine?: string; // Texto original antes de procesar
}

export interface Script {
  id: string;
  productionId: string;
  productionTitle: string;
  title: string;
  description?: string;
  characters: ScriptCharacter[];
  lines: ScriptLine[];
  totalLines: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
}

export interface StudentPracticeProgress {
  id: string;
  scriptId: string;
  studentFolio: string;
  studentName: string;
  characterName: string;
  linesLearned: string[]; // IDs de las líneas dominadas/memorizadas
  totalLines: number;
  accuracyRate: number; // Porcentaje de 0 a 100
  practiceTimeMinutes: number;
  totalSessions: number;
  lastPracticedAt: string;
  lineFeedback?: Record<
    string,
    {
      attempts: number;
      bestAccuracy: number;
      lastPracticed: string;
    }
  >;
}
