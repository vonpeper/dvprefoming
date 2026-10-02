import { ScriptCharacter, ScriptLine } from "@/types/script";

const CHARACTER_PALETTE = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
];

// Palabras o marcadores escénicos que NO deben considerarse personajes
const IGNORED_NAMES = new Set([
  "OSCURO",
  "TELÓN",
  "TELON",
  "FIN",
  "LUCES",
  "CORTE",
  "MUSICA",
  "MÚSICA",
  "SONIDO",
  "EFECTO",
  "TRANSICIÓN",
  "TRANSICION",
  "ENTREACTO",
  "PAUSA",
  "SILENCIO",
  "APAGÓN",
  "APAGON",
  "ESCENA",
  "ACTO",
]);

export interface ParsedScriptResult {
  characters: ScriptCharacter[];
  lines: ScriptLine[];
  totalLines: number;
  detectedActs: number;
  detectedScenes: number;
}

/**
 * Analizador sintáctico inteligente para guiones teatrales en español y multiformato.
 * Detecta:
 * - Personajes con dos puntos: "JUAN: Hola cómo estás"
 * - Personajes con acotaciones: "MARÍA (sonriendo): Bien, gracias"
 * - Formato estándar de guión en líneas separadas:
 *     JUAN
 *     (acotación)
 *     Hola cómo estás
 * - Encabezados de Actos y Escenas
 */
export function parseScriptText(rawText: string): ParsedScriptResult {
  if (!rawText || !rawText.trim()) {
    return {
      characters: [],
      lines: [],
      totalLines: 0,
      detectedActs: 0,
      detectedScenes: 0,
    };
  }

  const cleanedText = rawText
    .replace(/\f/g, "\n\n")
    .replace(/^[ \t]*(\d+|p[aá]g(?:ina)?\.?\s*\d+(?:\s*(?:de|\/)\s*\d+)?)[ \t]*$/gim, "");
  const rawLines = cleanedText.split(/\r?\n/);
  const parsedLines: ScriptLine[] = [];
  const characterCountMap = new Map<string, number>();

  let currentAct = 1;
  let currentScene = 1;
  let currentSceneTitle = "Escena 1";
  let lineOrderCounter = 1;

  let pendingCharacter: string | null = null;
  let pendingDirection: string | null = null;
  let pendingDialogueBuffer: string[] = [];

  const flushPendingLine = () => {
    if (pendingCharacter && pendingDialogueBuffer.length > 0) {
      const dialogueText = pendingDialogueBuffer.join(" ").trim();
      if (dialogueText.length > 0) {
        const cleanCharName = pendingCharacter.trim();
        parsedLines.push({
          id: `line_${lineOrderCounter}_${Date.now().toString(36)}`,
          order: lineOrderCounter++,
          actNumber: currentAct,
          sceneNumber: currentScene,
          sceneTitle: currentSceneTitle,
          characterName: cleanCharName,
          direction: pendingDirection || undefined,
          dialogue: dialogueText,
        });

        characterCountMap.set(
          cleanCharName,
          (characterCountMap.get(cleanCharName) || 0) + 1
        );
      }
    }
    pendingCharacter = null;
    pendingDirection = null;
    pendingDialogueBuffer = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();
    if (!rawLine) {
      // Línea vacía: si teníamos un personaje pendiente con diálogo, consolidamos
      if (pendingCharacter && pendingDialogueBuffer.length > 0) {
        flushPendingLine();
      }
      continue;
    }

    // 1. Detección de Actos y Escenas
    const actMatch = rawLine.match(/^(?:ACTO|ACT)\s+([IVXLCDM0-9]+)/i);
    if (actMatch) {
      flushPendingLine();
      const parsedNum = parseInt(actMatch[1], 10);
      currentAct = isNaN(parsedNum) ? currentAct + 1 : parsedNum;
      currentSceneTitle = rawLine;
      continue;
    }

    const sceneMatch = rawLine.match(/^(?:ESCENA|SCENE|CUADRO)\s+([IVXLCDM0-9]+)/i);
    if (sceneMatch) {
      flushPendingLine();
      const parsedNum = parseInt(sceneMatch[1], 10);
      currentScene = isNaN(parsedNum) ? currentScene + 1 : parsedNum;
      currentSceneTitle = rawLine;
      continue;
    }

    // 2. Patrón común en una sola línea: "NOMBRE (acotación): Parlamento" o "NOMBRE: Parlamento"
    // e.g. "FERNANDO (mirando el reloj): Ya es tarde para volver."
    const singleLineMatch = rawLine.match(
      /^([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s._'-]+?)(?:\s*\(([^)]+)\))?\s*[:.-]\s*(.+)$/
    );

    if (singleLineMatch) {
      const candidateName = singleLineMatch[1].trim();
      const normalizedCandidate = candidateName.toUpperCase();

      // Verificar que el candidato parezca un nombre de personaje (longitud razonable y no palabra clave)
      if (
        candidateName.length >= 2 &&
        candidateName.length <= 35 &&
        !IGNORED_NAMES.has(normalizedCandidate) &&
        !normalizedCandidate.startsWith("NOTA") &&
        !normalizedCandidate.startsWith("ESCENA") &&
        !normalizedCandidate.startsWith("ACTO")
      ) {
        flushPendingLine();
        const direction = singleLineMatch[2]?.trim() || undefined;
        const dialogue = singleLineMatch[3]?.trim() || "";

        if (dialogue) {
          parsedLines.push({
            id: `line_${lineOrderCounter}_${Date.now().toString(36)}`,
            order: lineOrderCounter++,
            actNumber: currentAct,
            sceneNumber: currentScene,
            sceneTitle: currentSceneTitle,
            characterName: candidateName,
            direction,
            dialogue,
          });

          characterCountMap.set(
            candidateName,
            (characterCountMap.get(candidateName) || 0) + 1
          );
        }
        continue;
      }
    }

    // 3. Patrón de personaje en línea propia en Mayúsculas (Standard Script Format)
    // e.g. "BENNY" o "VALERIA (emocionada)"
    const standaloneCharMatch = rawLine.match(
      /^([A-ZÁÉÍÓÚÑ0-9\s._'-]{2,30})(?:\s*\(([^)]+)\))?$/
    );

    if (
      standaloneCharMatch &&
      standaloneCharMatch[1].trim().toUpperCase() === standaloneCharMatch[1].trim()
    ) {
      const candidateName = standaloneCharMatch[1].trim();
      if (!IGNORED_NAMES.has(candidateName)) {
        flushPendingLine();
        pendingCharacter = candidateName;
        pendingDirection = standaloneCharMatch[2]?.trim() || null;
        continue;
      }
    }

    // 4. Si hay acotación solitaria entre paréntesis: "(mira al horizonte)"
    if (pendingCharacter && rawLine.startsWith("(") && rawLine.endsWith(")")) {
      const dirText = rawLine.slice(1, -1).trim();
      pendingDirection = pendingDirection
        ? `${pendingDirection}, ${dirText}`
        : dirText;
      continue;
    }

    // 5. Acumulación de diálogo bajo personaje activo
    if (pendingCharacter) {
      pendingDialogueBuffer.push(rawLine);
      continue;
    }

    // 6. Texto libre o narrativo (si no hay personaje asignado, se puede asignar a "NARRADOR" o "ACOTACIÓN")
    if (rawLine.startsWith("(") && rawLine.endsWith(")")) {
      // Acotación de escena sin diálogo hablado
      continue;
    }
  }

  // Consolidar último parlamento
  flushPendingLine();

  // Construir lista de personajes
  let colorIndex = 0;
  const characters: ScriptCharacter[] = Array.from(characterCountMap.entries())
    .sort((a, b) => b[1] - a[1]) // Más parlamentos primero
    .map(([charName, count]) => {
      const color = CHARACTER_PALETTE[colorIndex % CHARACTER_PALETTE.length];
      colorIndex++;

      // Inferencia básica de género por nombre común (modificable por el director)
      const lower = charName.toLowerCase();
      let voiceGender: "MALE" | "FEMALE" | "NEUTRAL" = "NEUTRAL";
      if (
        lower.endsWith("a") ||
        ["nina", "vanessa", "claudia", "maria", "maría", "ana", "daniela", "sofia", "madre", "bruja"].some((f) => lower.includes(f))
      ) {
        voiceGender = "FEMALE";
      } else if (
        lower.endsWith("o") ||
        ["benny", "usnavi", "sonny", "carlos", "juan", "pedro", "panadero", "lobo", "narrador"].some((m) => lower.includes(m))
      ) {
        voiceGender = "MALE";
      }

      return {
        id: `char_${charName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: charName,
        normalizedName: charName.toUpperCase(),
        totalLinesCount: count,
        voiceGender,
        voicePitch: voiceGender === "FEMALE" ? 1.05 : voiceGender === "MALE" ? 0.95 : 1.0,
        voiceRate: 1.0,
        colorTag: color,
      };
    });

  return {
    characters,
    lines: parsedLines,
    totalLines: parsedLines.length,
    detectedActs: currentAct,
    detectedScenes: currentScene,
  };
}

/**
 * Adaptador opcional con OpenAI:
 * Si process.env.OPENAI_API_KEY está configurada, utiliza gpt-4o-mini
 * para extraer personajes y escenas en guiones desestructurados.
 * Si falla o no hay key, recurre transparentemente al parseador nativo.
 */
export async function parseScriptWithAI(rawText: string): Promise<ParsedScriptResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return parseScriptText(rawText);
  }

  try {
    const prompt = `Eres un asistente experto en dramaturgia y teatro musical. Analiza el siguiente libreto teatral y extrae una lista estructurada en JSON válido con el reparto de personajes y cada línea de diálogo.

Reglas:
1. "characters": array de objetos { "name": string, "voiceGender": "MALE" | "FEMALE" | "NEUTRAL" }
2. "lines": array de objetos { "characterName": string, "direction": string o null, "dialogue": string, "actNumber": number, "sceneNumber": number, "sceneTitle": string }
3. No inventes líneas. Separa acotaciones entre paréntesis en "direction".
4. Devuelve ÚNICAMENTE un JSON parseable sin bloques markdown extras.

Libreto:
${rawText.slice(0, 40000)}
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn("[ScriptParser AI] Falló llamada a OpenAI, recurriendo al parseador nativo.");
      return parseScriptText(rawText);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsedJson = JSON.parse(content);

    if (Array.isArray(parsedJson.lines) && parsedJson.lines.length > 0) {
      let lineCounter = 1;
      const charCounts = new Map<string, number>();

      const finalLines: ScriptLine[] = parsedJson.lines.map((l: any) => {
        const charName = (l.characterName || "PERSONAJE").trim();
        charCounts.set(charName, (charCounts.get(charName) || 0) + 1);
        return {
          id: `line_${lineCounter}_${Date.now().toString(36)}`,
          order: lineCounter++,
          actNumber: l.actNumber || 1,
          sceneNumber: l.sceneNumber || 1,
          sceneTitle: l.sceneTitle || `Escena ${l.sceneNumber || 1}`,
          characterName: charName,
          direction: l.direction || undefined,
          dialogue: l.dialogue || "",
        };
      });

      let colorIndex = 0;
      const characters: ScriptCharacter[] = (parsedJson.characters || []).map((c: any) => {
        const charName = (c.name || "").trim();
        const color = CHARACTER_PALETTE[colorIndex % CHARACTER_PALETTE.length];
        colorIndex++;
        return {
          id: `char_${charName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          name: charName,
          normalizedName: charName.toUpperCase(),
          totalLinesCount: charCounts.get(charName) || 0,
          voiceGender: c.voiceGender || "NEUTRAL",
          voicePitch: c.voiceGender === "FEMALE" ? 1.05 : 0.95,
          voiceRate: 1.0,
          colorTag: color,
        };
      });

      return {
        characters,
        lines: finalLines,
        totalLines: finalLines.length,
        detectedActs: Math.max(...finalLines.map((l) => l.actNumber || 1), 1),
        detectedScenes: Math.max(...finalLines.map((l) => l.sceneNumber || 1), 1),
      };
    }
  } catch (error) {
    console.error("[ScriptParser AI] Error procesando con OpenAI:", error);
  }

  // Fallback garantizado
  return parseScriptText(rawText);
}
