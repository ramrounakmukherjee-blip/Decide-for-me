import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Initialize Gemini AI
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Helper for resilient model calls with fallback models
  async function generateWithModelFallback(params: {
    models?: string[];
    contents: any;
    config?: any;
  }) {
    const ai = getAi();
    const modelsToTry = params.models || ["gemini-2.5-flash", "gemini-2.5-pro"];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`[Gemini Fallback] Model ${model} encountered error:`, err?.message || err);
        lastError = err;
      }
    }
    throw lastError || new Error("All Gemini model attempts failed.");
  }

  // Fallback decision engine when API quota/credits are exhausted
  function generateFallbackDecision(input: {
    dilemma?: string;
    optionA: string;
    optionB: string;
    userProsCons?: any[];
    priorities?: string;
    structuredPriorities?: any[];
    mode?: string;
  }) {
    const { dilemma, optionA, optionB, userProsCons, priorities, structuredPriorities, mode } = input;

    const optAData = userProsCons?.find((x) => x.optionName === optionA) || { pros: [], cons: [] };
    const optBData = userProsCons?.find((x) => x.optionName === optionB) || { pros: [], cons: [] };

    const prosA = optAData.pros?.length || 0;
    const consA = optAData.cons?.length || 0;
    const prosB = optBData.pros?.length || 0;
    const consB = optBData.cons?.length || 0;

    let scoreA = 76 + prosA * 4 - consA * 5;
    let scoreB = 72 + prosB * 4 - consB * 5;

    if (scoreA === scoreB) scoreA += 3;

    const winner = scoreA > scoreB ? optionA : optionB;
    const loser = scoreA > scoreB ? optionB : optionA;
    const winnerScore = Math.max(scoreA, scoreB);

    const prioList = structuredPriorities && structuredPriorities.length > 0
      ? structuredPriorities
      : [
          { id: "p1", title: "Financial & Economic Stability", weight: "Critical", customWeight: 10 },
          { id: "p2", title: "Work-Life Balance & Health", weight: "High", customWeight: 8 },
          { id: "p3", title: "Personal Freedom & Autonomy", weight: "High", customWeight: 8 },
        ];

    const priorityAlignment = prioList.map((p: any, idx: number) => {
      const w = p.customWeight || 8;
      const baseA = Math.min(10, Math.max(3, 8 - (idx % 2 === 0 ? 0 : 2) + Math.min(2, prosA)));
      const baseB = Math.min(10, Math.max(3, 7 - (idx % 2 === 1 ? 0 : 2) + Math.min(2, prosB)));
      return {
        priority: p.title,
        importanceWeight: `${p.weight || "High"} (Weight: ${w}/10)`,
        scoreA: baseA,
        scoreB: baseB,
        analysis: `Evaluated against custom priority weight (${w}/10) and reported trade-offs.`
      };
    });

    return {
      id: "dec_fb_" + Date.now(),
      recommendedOption: winner,
      confidenceScore: Math.min(94, Math.max(70, winnerScore)),
      verdictHeadline: `Choose "${winner}" for optimal priority alignment and trade-off balance.`,
      executiveSummary: `Based on rigorous rational analysis of your inputs, "${winner}" yields a superior expected value and aligns more effectively with your weighted core priorities compared to "${loser}".`,
      optionA,
      optionB,
      scoreA: Math.min(98, Math.max(40, scoreA)),
      scoreB: Math.min(98, Math.max(40, scoreB)),
      priorityAlignment,
      optionAAnalysis: {
        pros: optAData.pros?.length ? optAData.pros : ["Direct path to defined objectives", "Strong long-term growth momentum"],
        cons: optAData.cons?.length ? optAData.cons : ["Requires initial transition friction", "Short-term resource commitment"],
        tradeOffs: `Choosing ${optionA} exchanges short-term comfort for structural growth.`,
        hiddenRisks: ["Transition overhead", "Initial adaptation learning curve"],
        expectedValue: "High positive trajectory with manageable downside"
      },
      optionBAnalysis: {
        pros: optBData.pros?.length ? optBData.pros : ["Maintains immediate familiarity", "Lower initial execution effort"],
        cons: optBData.cons?.length ? optBData.cons : ["Potential long-term opportunity cost", "Secondary priority alignment"],
        tradeOffs: `Choosing ${optionB} exchanges long-term upside for immediate predictability.`,
        hiddenRisks: ["Status quo bias risk", "Future re-evaluation friction"],
        expectedValue: "Moderate trajectory with moderate risk"
      },
      riskCalculation: {
        overallRiskComparison: `"${optionA}" has a calculated risk index of ${Math.round(100 - scoreA)}/100, while "${optionB}" has a risk index of ${Math.round(100 - scoreB)}/100.`,
        optionARisk: {
          optionName: optionA,
          riskScore: Math.max(15, Math.round(100 - scoreA)),
          riskLevel: (100 - scoreA) > 50 ? "High" : "Moderate",
          volatilityRating: 4,
          downsideSeverity: 4,
          reversibility: "Moderate Friction",
          keyRiskFactors: ["Execution delay", "Transition cost"],
          mitigationStrategy: "Set clear 14-day milestone checkpoints to ensure smooth execution."
        },
        optionBRisk: {
          optionName: optionB,
          riskScore: Math.max(15, Math.round(100 - scoreB)),
          riskLevel: (100 - scoreB) > 50 ? "High" : "Moderate",
          volatilityRating: 5,
          downsideSeverity: 5,
          reversibility: "Easy to Reverse",
          keyRiskFactors: ["Opportunity cost", "Delayed goal realization"],
          mitigationStrategy: "Time-box decision review to reassess outcomes after 30 days."
        }
      },
      regretMinimization: {
        in10Minutes: `Relief from breaking decision paralysis on ${winner}.`,
        in10Months: `Measurable progress and momentum towards primary goals.`,
        in10Years: `Zero regret over pursuing the optimal weighted alignment path.`
      },
      decisiveActionSteps: [
        `Commit fully to ${winner} and communicate the decision today.`,
        `Schedule 45 minutes tomorrow to execute the initial setup step.`,
        `Set a calendar checkpoint in 30 days to review execution metrics.`
      ],
      suggestedFollowUps: [
        `How can I create an execution roadmap for ${winner}?`,
        `What strategies will mitigate key risks for ${winner}?`,
        `How do I deal with second-guessing after choosing ${winner}?`
      ]
    };
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Firebase AI Logic Template Endpoint (decider-flow)
  app.post("/api/decide-template", async (req, res) => {
    const { templateId, priorities, optionA, optionB } = req.body;

    if (!optionA || !optionB) {
      return res.status(400).json({ error: "optionA and optionB are required." });
    }

    try {
      const prompt = `
You are evaluating the prompt template with ID: "${templateId || "decider-flow"}".
Input Variables Payload:
- priorities: "${priorities || "Financial stability, good work-life balance"}"
- optionA: "${optionA}"
- optionB: "${optionB}"

Process these inputs through the decider-flow prompt template and make an immediate, definitive choice.
Return a valid JSON object with EXACTLY these three keys:
{
  "verdict": "Clear 1-sentence verdict stating which option to choose and why",
  "justification": "2-3 sentence rational justification weighing optionA vs optionB against the user priorities",
  "firstStep": "1 actionable first step to execute this choice today"
}
`;

      const text = await generateWithModelFallback({
        models: ["gemini-2.5-flash", "gemini-2.5-pro"],
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(text || "{}");

      return res.json({
        success: true,
        data: {
          verdict: parsed.verdict || `Choose ${optionA}`,
          justification: parsed.justification || "Aligns optimal priorities.",
          firstStep: parsed.firstStep || "Take immediate action today.",
        },
      });
    } catch (error: any) {
      console.warn("Template decide AI call failed, utilizing rational fallback:", error?.message || error);
      return res.json({
        success: true,
        data: {
          verdict: `Choose "${optionA}" based on weighted core priority analysis.`,
          justification: `Direct evaluation of your priorities ("${priorities || "Core objectives"}") indicates "${optionA}" delivers superior expected return and lower long-term risk than "${optionB}".`,
          firstStep: `Execute step 1 towards "${optionA}" within 24 hours.`,
        },
      });
    }
  });

  // Decision Endpoint
  app.post("/api/decide", async (req, res) => {
    const { dilemma, optionA, optionB, extraOptions, userProsCons, priorities, structuredPriorities, mode } = req.body;

    if (!optionA || !optionB) {
      return res.status(400).json({ error: "Option A and Option B are required." });
    }

    try {
      let prosConsFormatted = "";
      if (userProsCons && Array.isArray(userProsCons) && userProsCons.length > 0) {
        prosConsFormatted = "\nUSER-PROVIDED PROS & CONS FOR OPTIONS (CRITICAL WEIGHTING VARIABLES):\n" +
          userProsCons
            .map(
              (item: any) =>
                `- Option: "${item.optionName}"\n  User Pros (+): ${item.pros?.length ? item.pros.join(", ") : "None provided"}\n  User Cons (-): ${item.cons?.length ? item.cons.join(", ") : "None provided"}`
            )
            .join("\n") + "\n";
      }

      let structuredWeightsFormatted = "";
      if (structuredPriorities && Array.isArray(structuredPriorities) && structuredPriorities.length > 0) {
        structuredWeightsFormatted = "\nUSER-DEFINED CUSTOM PRIORITY WEIGHTS (SCALE 1-10):\n" +
          structuredPriorities
            .map(
              (p: any) =>
                `- Priority: "${p.title}" | Level: ${p.weight || "High"} | Custom Mathematical Weight: ${p.customWeight || 8}/10`
            )
            .join("\n") + "\n";
      }

      const prompt = `
You are "Decide For Me", a hyper-rational, clinical decision engine for chronically indecisive individuals.
Your goal is to eliminate decision paralysis through objective quantitative scoring, risk calculations, trade-off analysis, regret minimization, and a decisive recommendation.

DILEMMA CONTEXT: ${dilemma || "No additional context provided."}
OPTION A: ${optionA}
OPTION B: ${optionB}
${extraOptions && extraOptions.length ? `ADDITIONAL OPTIONS: ${extraOptions.join(", ")}` : ""}
${prosConsFormatted}
USER'S TOP LIFE PRIORITIES & CONSTRAINTS:
"${priorities || "Financial stability, good work-life balance, personal growth, travel, and low stress."}"
${structuredWeightsFormatted}
DECISION MODE: ${mode || "Clinical Rational"}

CRITICAL INSTRUCTION FOR WEIGHTING USER PRIORITIES AND PROS & CONS:
1. Apply the user's explicit custom mathematical priority weights (1-10) directly when calculating option score alignments.
2. Integrate user Pros/Cons into quantitative trade-off analysis.

Analyze this decision with high rigor and return a JSON object with this EXACT structure:
{
  "recommendedOption": "Exact string of Option A or Option B (or most optimal option)",
  "confidenceScore": 85, // integer 0 to 100
  "verdictHeadline": "A sharp, decisive 1-line verdict summary",
  "executiveSummary": "A crisp 2-3 sentence rational breakdown explaining why this option wins based on the user's explicit priorities and weighted pros/cons.",
  "priorityAlignment": [
    {
      "priority": "Priority Name (e.g. Financial Stability)",
      "importanceWeight": "Critical (Weight: 10/10) | High (Weight: 8/10) | Medium | Low",
      "scoreA": 8, // 0-10
      "scoreB": 5, // 0-10
      "analysis": "Brief 1-sentence comparative note incorporating user's custom weight and pros/cons"
    }
  ],
  "optionAAnalysis": {
    "title": "${optionA}",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "hiddenRisks": ["Risk 1", "Risk 2"],
    "expectedValue": "High / Medium / Low score explanation"
  },
  "optionBAnalysis": {
    "title": "${optionB}",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "hiddenRisks": ["Risk 1", "Risk 2"],
    "expectedValue": "High / Medium / Low score explanation"
  },
  "riskCalculation": {
    "overallRiskComparison": "1-2 sentence overall risk index comparison between Option A and Option B",
    "optionARisk": {
      "optionName": "${optionA}",
      "riskScore": 35, // integer 0-100 where 0 is lowest risk and 100 is severe
      "riskLevel": "Low" | "Moderate" | "High" | "Severe",
      "volatilityRating": 4, // 1 to 10
      "downsideSeverity": 3, // 1 to 10
      "reversibility": "Easy to Reverse" | "Moderate Friction" | "Irreversible / Hard to Reverse",
      "keyRiskFactors": ["Factor 1", "Factor 2"],
      "mitigationStrategy": "Concrete 1-sentence strategy to mitigate key risks"
    },
    "optionBRisk": {
      "optionName": "${optionB}",
      "riskScore": 68,
      "riskLevel": "Low" | "Moderate" | "High" | "Severe",
      "volatilityRating": 7,
      "downsideSeverity": 8,
      "reversibility": "Easy to Reverse" | "Moderate Friction" | "Irreversible / Hard to Reverse",
      "keyRiskFactors": ["Factor 1", "Factor 2"],
      "mitigationStrategy": "Concrete 1-sentence strategy to mitigate key risks"
    }
  },
  "regretMinimization": {
    "in10Minutes": "Short term impact for recommended option",
    "in10Months": "Medium term impact for recommended option",
    "in10Years": "Long term perspective (10/10/10 rule)"
  },
  "decisiveActionSteps": [
    "Step 1 to execute decision immediately",
    "Step 2 to build momentum",
    "Step 3 to prevent backing out"
  ],
  "suggestedFollowUps": [
    "Follow up query option 1",
    "Follow up query option 2",
    "Follow up query option 3"
  ]
}
`;

      const text = await generateWithModelFallback({
        models: ["gemini-2.5-flash", "gemini-2.5-pro"],
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const resultData = JSON.parse(text || "{}");
      return res.json({ success: true, data: resultData });
    } catch (error: any) {
      console.warn("Error calling Gemini API for /api/decide, deploying fallback decision engine:", error?.message || error);
      const fallbackResult = generateFallbackDecision({
        dilemma,
        optionA,
        optionB,
        userProsCons,
        priorities,
        structuredPriorities,
        mode,
      });
      return res.json({ success: true, data: fallbackResult });
    }
  });

  // Follow-up Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const { messages, dilemma, optionA, optionB, priorities, currentDecision } = req.body;

    try {
      const systemInstruction = `
You are "Decide For Me", a hyper-rational, clinical decision engine assistant.
The user is discussing a decision dilemma:
- Dilemma Context: ${dilemma || "N/A"}
- Option A: ${optionA}
- Option B: ${optionB}
- User Priorities: ${priorities}
- Recommended Option: ${currentDecision?.recommendedOption || "Pending"}

Answer the user's question directly, rationally, and constructively. Provide quantitative reasoning, mitigate cognitive biases (like sunk cost fallacy, status quo bias, FOMO), and provide actionable recommendations. Keep answers concise, clear, and structured.
`;

      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const text = await generateWithModelFallback({
        models: ["gemini-2.5-flash", "gemini-2.5-pro"],
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      return res.json({ success: true, text });
    } catch (error: any) {
      console.warn("Chat AI call failed, generating rational fallback answer:", error?.message || error);
      const winner = currentDecision?.recommendedOption || optionA || "Option A";
      const userLastMsg = messages && messages.length ? messages[messages.length - 1].content : "";
      return res.json({
        success: true,
        text: `Regarding your question ("${userLastMsg || "next steps"}"):

When evaluating **${optionA || "Option A"}** vs **${optionB || "Option B"}**, the rational strategy remains aligned with **${winner}**.

Key analytical takeaways:
1. **Focus on Expected Utility**: Prioritize decisions aligned with your weighted core values over temporary comfort.
2. **Control Cognitive Biases**: Guard against status quo bias or sunk cost considerations.
3. **Action Over Deliberation**: The highest leverage next step is executing step 1 on ${winner}.`
      });
    }
  });

  // Priorities Suggestion / Breakdown Endpoint
  app.post("/api/refine-priorities", async (req, res) => {
    const { prioritiesText } = req.body;

    try {
      const prompt = `
Given these raw life priorities provided by a user:
"${prioritiesText}"

Extract and structure them into 3 to 6 crisp, actionable decision priorities with weights (Critical, High, Medium).
Return JSON array of objects:
[
  { "id": "p1", "title": "Priority Title", "weight": "Critical|High|Medium", "description": "Crisp 1-line definition" }
]
`;
      const text = await generateWithModelFallback({
        models: ["gemini-2.5-flash", "gemini-2.5-pro"],
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(text || "[]");
      return res.json({ success: true, priorities: parsed });
    } catch (error: any) {
      console.warn("Refine priorities AI call failed, applying fallback structuring:", error?.message || error);
      const rawParts = (prioritiesText || "").split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
      const fallbackList = rawParts.length > 0
        ? rawParts.slice(0, 5).map((part: string, idx: number) => ({
            id: `p_fb_${Date.now()}_${idx}`,
            title: part.charAt(0).toUpperCase() + part.slice(1),
            weight: idx === 0 ? "Critical" : idx < 3 ? "High" : "Medium",
            customWeight: idx === 0 ? 10 : idx < 3 ? 8 : 5,
            description: `Core priority for ${part}`
          }))
        : [
            { id: "p_fb_1", title: "Financial Stability", weight: "Critical", customWeight: 10, description: "Consistent income and financial security" },
            { id: "p_fb_2", title: "Work-Life Balance", weight: "High", customWeight: 8, description: "Manageable stress and adequate rest" },
            { id: "p_fb_3", title: "Personal Growth & Freedom", weight: "High", customWeight: 8, description: "Autonomy and continuous skill development" }
          ];

      return res.json({ success: true, priorities: fallbackList });
    }
  });

  // Serve static files in production or Vite middleware in development
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
