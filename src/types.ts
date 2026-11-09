export interface PriorityItem {
  id: string;
  title: string;
  weight: "Critical" | "High" | "Medium" | "Low";
  customWeight: number; // 1 to 10 numerical weight value
  description?: string;
}

export interface PriorityAlignment {
  priority: string;
  importanceWeight: string;
  scoreA: number;
  scoreB: number;
  analysis: string;
}

export interface OptionAnalysis {
  title: string;
  pros: string[];
  cons: string[];
  hiddenRisks: string[];
  expectedValue: string;
}

export interface OptionRiskProfile {
  optionName: string;
  riskScore: number; // 0 to 100
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  volatilityRating: number; // 1 to 10
  downsideSeverity: number; // 1 to 10
  reversibility: "Easy to Reverse" | "Moderate Friction" | "Irreversible / Hard to Reverse";
  keyRiskFactors: string[];
  mitigationStrategy: string;
}

export interface RiskCalculation {
  overallRiskComparison: string;
  optionARisk: OptionRiskProfile;
  optionBRisk: OptionRiskProfile;
}

export interface RegretMinimization {
  in10Minutes: string;
  in10Months: string;
  in10Years: string;
}

export interface UserOptionProsCons {
  optionName: string;
  pros: string[];
  cons: string[];
}

export interface DecisionResult {
  id: string;
  timestamp: string;
  dilemma: string;
  optionA: string;
  optionB: string;
  extraOptions?: string[];
  userProsCons?: UserOptionProsCons[];
  prioritiesUsed: string;
  recommendedOption: string;
  confidenceScore: number;
  verdictHeadline: string;
  executiveSummary: string;
  priorityAlignment: PriorityAlignment[];
  optionAAnalysis: OptionAnalysis;
  optionBAnalysis: OptionAnalysis;
  riskCalculation?: RiskCalculation;
  regretMinimization: RegretMinimization;
  decisiveActionSteps: string[];
  suggestedFollowUps: string[];
}

export interface SystemTemplateResult {
  verdict: string;
  justification: string;
  firstStep: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string;
  decisionResult?: DecisionResult;
  systemTemplateResult?: SystemTemplateResult;
  timestamp: string;
}

export type DecisionMode = "Clinical Rational" | "Regret Minimization" | "Risk-Averse" | "Aggressive Opportunity";

export interface AppSettings {
  decisionMode: DecisionMode;
  autoSaveHistory: boolean;
}
