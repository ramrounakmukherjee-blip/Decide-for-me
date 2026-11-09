import React, { useState } from "react";
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Share2,
  Download,
  Printer,
  FileText,
  Scale
} from "lucide-react";
import { DecisionResult } from "../types";

interface DecisionResultCardProps {
  result: DecisionResult;
  onSelectFollowUp: (query: string) => void;
}

export const DecisionResultCard: React.FC<DecisionResultCardProps> = ({
  result,
  onSelectFollowUp,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showMatrixDetails, setShowMatrixDetails] = useState(true);
  const [showRiskDetails, setShowRiskDetails] = useState(true);

  const handleCopySummary = () => {
    const text = `Decide For Me Verdict:\n${result.verdictHeadline}\n\nRecommended: ${result.recommendedOption} (${result.confidenceScore}% confidence)\n\nExecutive Summary:\n${result.executiveSummary}`;
    navigator.clipboard.writeText(text);
    setCopiedText("Summary Copied!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-report-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedText("JSON Downloaded!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# Decision Evaluation Report - Decide For Me

## Recommended Option: ${result.recommendedOption} (${result.confidenceScore}% Confidence)
**Verdict**: ${result.verdictHeadline}

### Executive Rational Synthesis
${result.executiveSummary}

### Options Compared
- **Option A**: ${result.optionA}
- **Option B**: ${result.optionB}

### Priority Alignment Breakdown
${result.priorityAlignment?.map((p) => `- **${p.priority}** (${p.importanceWeight}): Option A (${p.scoreA}/10) vs Option B (${p.scoreB}/10) -> ${p.analysis}`).join("\n") || "N/A"}

### Quantitative Risk Calculation
${result.riskCalculation?.overallRiskComparison || "N/A"}
- **${result.optionA} Risk Index**: ${result.riskCalculation?.optionARisk?.riskScore ?? "N/A"}/100 (${result.riskCalculation?.optionARisk?.riskLevel ?? "N/A"})
  - Volatility: ${result.riskCalculation?.optionARisk?.volatilityRating ?? "N/A"}/10 | Downside: ${result.riskCalculation?.optionARisk?.downsideSeverity ?? "N/A"}/10
  - Reversibility: ${result.riskCalculation?.optionARisk?.reversibility ?? "N/A"}
  - Mitigation: ${result.riskCalculation?.optionARisk?.mitigationStrategy ?? "N/A"}
- **${result.optionB} Risk Index**: ${result.riskCalculation?.optionBRisk?.riskScore ?? "N/A"}/100 (${result.riskCalculation?.optionBRisk?.riskLevel ?? "N/A"})
  - Volatility: ${result.riskCalculation?.optionBRisk?.volatilityRating ?? "N/A"}/10 | Downside: ${result.riskCalculation?.optionBRisk?.downsideSeverity ?? "N/A"}/10
  - Reversibility: ${result.riskCalculation?.optionBRisk?.reversibility ?? "N/A"}
  - Mitigation: ${result.riskCalculation?.optionBRisk?.mitigationStrategy ?? "N/A"}

### Immediate Action Protocol
${result.decisiveActionSteps?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "N/A"}

---
*Generated via Decide For Me Clinical Engine on ${new Date(result.timestamp).toLocaleString()}*
`;

    navigator.clipboard.writeText(md);
    setCopiedText("Markdown Copied!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isOptionAWinner =
    result.recommendedOption.toLowerCase().trim() === result.optionA.toLowerCase().trim();

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Moderate":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Severe":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c5c5d4]/50 shadow-md p-6 md:p-8 flex flex-col gap-6 w-full my-4 font-body text-[#191c1e] print:shadow-none print:border-none">
      {/* Top Banner: Winning Verdict */}
      <div className="bg-gradient-to-r from-[#24389c]/10 via-[#3f51b5]/5 to-transparent p-5 md:p-6 rounded-xl border-l-4 border-[#3f51b5] flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider bg-[#3f51b5] text-white px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Optimal Choice Identified
            </span>
            <span className="text-xs font-mono text-[#757684]">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold font-headline text-[#191c1e] tracking-tight">
            {result.recommendedOption}
          </h3>

          <p className="text-sm md:text-base text-[#454652] font-medium leading-relaxed">
            {result.verdictHeadline}
          </p>
        </div>

        {/* Confidence Gauge Badge */}
        <div className="bg-white p-4 rounded-xl border border-[#c5c5d4]/40 shadow-xs flex flex-col items-center justify-center min-w-[130px] shrink-0">
          <span className="text-2xl md:text-3xl font-extrabold font-headline text-[#24389c]">
            {result.confidenceScore}%
          </span>
          <span className="text-[11px] font-mono text-[#757684] uppercase tracking-wider font-semibold mt-0.5">
            Alignment Score
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-[#f7f9fb] p-5 rounded-xl border border-[#c5c5d4]/30">
        <div className="text-xs font-mono uppercase text-[#757684] tracking-wider font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3f51b5]" />
          Executive Rational Synthesis
        </div>
        <p className="text-sm md:text-base text-[#191c1e] leading-relaxed">
          {result.executiveSummary}
        </p>
      </div>

      {/* Priority Alignment Matrix */}
      {result.priorityAlignment && result.priorityAlignment.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold font-headline text-[#191c1e] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#3f51b5]" />
              Priority Alignment Breakdown
            </h4>
            <button
              onClick={() => setShowMatrixDetails(!showMatrixDetails)}
              className="text-xs font-mono text-[#3f51b5] hover:underline flex items-center gap-1 font-semibold"
            >
              {showMatrixDetails ? "Collapse Details" : "Expand Details"}
              {showMatrixDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showMatrixDetails && (
            <div className="grid grid-cols-1 gap-3">
              {result.priorityAlignment.map((item, idx) => {
                const scoreAPercent = (item.scoreA / 10) * 100;
                const scoreBPercent = (item.scoreB / 10) * 100;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#f2f4f6]/60 border border-[#c5c5d4]/30 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="font-bold text-[#191c1e] flex items-center gap-1.5">
                        {item.priority}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-200 text-[#454652]">
                          {item.importanceWeight}
                        </span>
                      </span>
                      <span className="text-xs text-[#757684] italic hidden sm:inline">
                        {item.analysis}
                      </span>
                    </div>

                    {/* Bar comparison */}
                    <div className="flex flex-col gap-1 text-xs font-mono">
                      {/* Option A bar */}
                      <div className="flex items-center gap-2">
                        <span className={`w-28 truncate ${isOptionAWinner ? "font-bold text-[#24389c]" : "text-[#454652]"}`}>
                          {result.optionA}
                        </span>
                        <div className="flex-1 bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOptionAWinner ? "bg-[#3f51b5]" : "bg-[#757684]"
                            }`}
                            style={{ width: `${scoreAPercent}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right font-bold">{item.scoreA}/10</span>
                      </div>

                      {/* Option B bar */}
                      <div className="flex items-center gap-2">
                        <span className={`w-28 truncate ${!isOptionAWinner ? "font-bold text-[#24389c]" : "text-[#454652]"}`}>
                          {result.optionB}
                        </span>
                        <div className="flex-1 bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              !isOptionAWinner ? "bg-[#3f51b5]" : "bg-[#757684]"
                            }`}
                            style={{ width: `${scoreBPercent}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right font-bold">{item.scoreB}/10</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Risk Calculation & Vulnerability Matrix */}
      {result.riskCalculation && (
        <div className="bg-[#fff9f6] p-5 md:p-6 rounded-xl border border-amber-200/80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold font-headline text-[#191c1e] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Quantitative Risk Index & Vulnerability Assessment
            </h4>
            <button
              onClick={() => setShowRiskDetails(!showRiskDetails)}
              className="text-xs font-mono text-amber-800 hover:underline flex items-center gap-1 font-semibold"
            >
              {showRiskDetails ? "Collapse Risk Specs" : "Expand Risk Specs"}
              {showRiskDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-100">
            {result.riskCalculation.overallRiskComparison}
          </p>

          {showRiskDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {/* Option A Risk Box */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#191c1e]">{result.optionA}</span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getRiskColor(result.riskCalculation.optionARisk?.riskLevel)}`}>
                    Risk: {result.riskCalculation.optionARisk?.riskScore ?? 0}% ({result.riskCalculation.optionARisk?.riskLevel ?? "Moderate"})
                  </span>
                </div>

                {/* Risk Bar */}
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (result.riskCalculation.optionARisk?.riskScore ?? 0) > 60
                        ? "bg-red-500"
                        : (result.riskCalculation.optionARisk?.riskScore ?? 0) > 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, result.riskCalculation.optionARisk?.riskScore ?? 0))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Volatility</span>
                    <span className="font-bold text-gray-900">{result.riskCalculation.optionARisk?.volatilityRating ?? 5}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Downside Severity</span>
                    <span className="font-bold text-gray-900">{result.riskCalculation.optionARisk?.downsideSeverity ?? 5}/10</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-mono text-[10px] text-gray-500 uppercase font-bold block mb-1">Reversibility Index:</span>
                  <span className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium text-xs border border-blue-100">
                    {result.riskCalculation.optionARisk?.reversibility ?? "Moderate Friction"}
                  </span>
                </div>

                {result.riskCalculation.optionARisk?.mitigationStrategy && (
                  <div className="text-xs bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-0.5 font-mono text-[10px] uppercase">Mitigation Strategy:</span>
                    <p className="text-emerald-800 leading-snug">{result.riskCalculation.optionARisk.mitigationStrategy}</p>
                  </div>
                )}
              </div>

              {/* Option B Risk Box */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#191c1e]">{result.optionB}</span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getRiskColor(result.riskCalculation.optionBRisk?.riskLevel)}`}>
                    Risk: {result.riskCalculation.optionBRisk?.riskScore ?? 0}% ({result.riskCalculation.optionBRisk?.riskLevel ?? "Moderate"})
                  </span>
                </div>

                {/* Risk Bar */}
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (result.riskCalculation.optionBRisk?.riskScore ?? 0) > 60
                        ? "bg-red-500"
                        : (result.riskCalculation.optionBRisk?.riskScore ?? 0) > 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, result.riskCalculation.optionBRisk?.riskScore ?? 0))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Volatility</span>
                    <span className="font-bold text-gray-900">{result.riskCalculation.optionBRisk?.volatilityRating ?? 5}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Downside Severity</span>
                    <span className="font-bold text-gray-900">{result.riskCalculation.optionBRisk?.downsideSeverity ?? 5}/10</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="font-mono text-[10px] text-gray-500 uppercase font-bold block mb-1">Reversibility Index:</span>
                  <span className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium text-xs border border-blue-100">
                    {result.riskCalculation.optionBRisk?.reversibility ?? "Moderate Friction"}
                  </span>
                </div>

                {result.riskCalculation.optionBRisk?.mitigationStrategy && (
                  <div className="text-xs bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-0.5 font-mono text-[10px] uppercase">Mitigation Strategy:</span>
                    <p className="text-emerald-800 leading-snug">{result.riskCalculation.optionBRisk.mitigationStrategy}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Pros, Cons & Hidden Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A Card */}
        <div
          className={`p-5 rounded-xl border ${
            isOptionAWinner ? "border-[#3f51b5] bg-[#3f51b5]/5" : "border-[#c5c5d4]/40 bg-white"
          } flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <h5 className="font-bold font-headline text-lg text-[#191c1e]">
              {result.optionAAnalysis.title}
            </h5>
            {isOptionAWinner && (
              <span className="text-[10px] font-mono font-bold bg-[#3f51b5] text-white px-2 py-0.5 rounded uppercase">
                Recommended
              </span>
            )}
          </div>

          {/* User provided pros/cons badge for Option A */}
          {result.userProsCons &&
            result.userProsCons.find(
              (u) => u.optionName.toLowerCase().trim() === result.optionA.toLowerCase().trim()
            ) && (
              <div className="bg-[#3f51b5]/10 border border-[#3f51b5]/20 p-2.5 rounded-lg text-xs flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase font-bold text-[#24389c]">
                  User-Submitted Weighted Factors:
                </span>
                {(() => {
                  const userFactor = result.userProsCons.find(
                    (u) => u.optionName.toLowerCase().trim() === result.optionA.toLowerCase().trim()
                  );
                  return (
                    <div className="flex flex-col gap-1 text-[11px] text-[#191c1e]">
                      {userFactor?.pros?.length ? (
                        <div>
                          <strong className="text-emerald-700">Pros:</strong> {userFactor.pros.join(", ")}
                        </div>
                      ) : null}
                      {userFactor?.cons?.length ? (
                        <div>
                          <strong className="text-amber-700">Cons:</strong> {userFactor.cons.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            )}

          <div className="flex flex-col gap-2 text-sm">
            <div className="font-semibold text-emerald-700 text-xs uppercase font-mono">Synthesized Pros</div>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#191c1e] space-y-1">
              {result.optionAAnalysis.pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <div className="font-semibold text-amber-700 text-xs uppercase font-mono mt-2">Synthesized Cons</div>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#454652] space-y-1">
              {result.optionAAnalysis.cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            {result.optionAAnalysis.hiddenRisks?.length > 0 && (
              <>
                <div className="font-semibold text-red-700 text-xs uppercase font-mono mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Hidden Friction Points
                </div>
                <ul className="list-disc list-inside text-xs text-[#454652] space-y-1">
                  {result.optionAAnalysis.hiddenRisks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Option B Card */}
        <div
          className={`p-5 rounded-xl border ${
            !isOptionAWinner ? "border-[#3f51b5] bg-[#3f51b5]/5" : "border-[#c5c5d4]/40 bg-white"
          } flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <h5 className="font-bold font-headline text-lg text-[#191c1e]">
              {result.optionBAnalysis.title}
            </h5>
            {!isOptionAWinner && (
              <span className="text-[10px] font-mono font-bold bg-[#3f51b5] text-white px-2 py-0.5 rounded uppercase">
                Recommended
              </span>
            )}
          </div>

          {/* User provided pros/cons badge for Option B */}
          {result.userProsCons &&
            result.userProsCons.find(
              (u) => u.optionName.toLowerCase().trim() === result.optionB.toLowerCase().trim()
            ) && (
              <div className="bg-[#3f51b5]/10 border border-[#3f51b5]/20 p-2.5 rounded-lg text-xs flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase font-bold text-[#24389c]">
                  User-Submitted Weighted Factors:
                </span>
                {(() => {
                  const userFactor = result.userProsCons.find(
                    (u) => u.optionName.toLowerCase().trim() === result.optionB.toLowerCase().trim()
                  );
                  return (
                    <div className="flex flex-col gap-1 text-[11px] text-[#191c1e]">
                      {userFactor?.pros?.length ? (
                        <div>
                          <strong className="text-emerald-700">Pros:</strong> {userFactor.pros.join(", ")}
                        </div>
                      ) : null}
                      {userFactor?.cons?.length ? (
                        <div>
                          <strong className="text-amber-700">Cons:</strong> {userFactor.cons.join(", ")}
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            )}

          <div className="flex flex-col gap-2 text-sm">
            <div className="font-semibold text-emerald-700 text-xs uppercase font-mono">Synthesized Pros</div>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#191c1e] space-y-1">
              {result.optionBAnalysis.pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <div className="font-semibold text-amber-700 text-xs uppercase font-mono mt-2">Synthesized Cons</div>
            <ul className="list-disc list-inside text-xs md:text-sm text-[#454652] space-y-1">
              {result.optionBAnalysis.cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            {result.optionBAnalysis.hiddenRisks?.length > 0 && (
              <>
                <div className="font-semibold text-red-700 text-xs uppercase font-mono mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Hidden Friction Points
                </div>
                <ul className="list-disc list-inside text-xs text-[#454652] space-y-1">
                  {result.optionBAnalysis.hiddenRisks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Regret Minimization Framework (10/10/10 Rule) */}
      {result.regretMinimization && (
        <div className="bg-[#f2f4f6] p-5 rounded-xl border border-[#c5c5d4]/40 flex flex-col gap-3">
          <h4 className="text-sm font-bold font-headline text-[#191c1e] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3f51b5]" />
            10 / 10 / 10 Regret Minimization Lens
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
            <div className="bg-white p-3.5 rounded-lg border border-[#c5c5d4]/30 flex flex-col gap-1">
              <span className="font-mono font-bold text-[#3f51b5] text-xs">10 Minutes Later</span>
              <p className="text-[#454652] leading-normal">{result.regretMinimization.in10Minutes}</p>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-[#c5c5d4]/30 flex flex-col gap-1">
              <span className="font-mono font-bold text-[#3f51b5] text-xs">10 Months Later</span>
              <p className="text-[#454652] leading-normal">{result.regretMinimization.in10Months}</p>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-[#c5c5d4]/30 flex flex-col gap-1">
              <span className="font-mono font-bold text-[#3f51b5] text-xs">10 Years Later</span>
              <p className="text-[#454652] leading-normal">{result.regretMinimization.in10Years}</p>
            </div>
          </div>
        </div>
      )}

      {/* Decisive Action Steps */}
      {result.decisiveActionSteps && result.decisiveActionSteps.length > 0 && (
        <div className="bg-[#3f51b5]/5 p-5 rounded-xl border border-[#3f51b5]/20 flex flex-col gap-3">
          <h4 className="text-sm font-bold font-headline text-[#24389c] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#3f51b5]" />
            Immediate Action Protocol (Momentum Steps)
          </h4>

          <div className="flex flex-col gap-2">
            {result.decisiveActionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-xs md:text-sm text-[#191c1e]">
                <span className="w-5 h-5 rounded-full bg-[#3f51b5] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-Up Questions */}
      {result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#c5c5d4]/30">
          <span className="text-xs font-mono uppercase text-[#757684]">Probe Further</span>
          <div className="flex flex-wrap gap-2">
            {result.suggestedFollowUps.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFollowUp(q)}
                className="text-xs bg-[#eceef0] hover:bg-[#3f51b5] hover:text-white text-[#191c1e] px-3 py-1.5 rounded-lg transition-colors border border-[#c5c5d4]/40 flex items-center gap-1.5 font-medium"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Utility Actions & Export Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-[#c5c5d4]/40 print:hidden">
        <div className="flex items-center gap-2">
          {copiedText && (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {copiedText}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="text-xs font-mono text-[#454652] hover:text-[#24389c] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            title="Copy Executive Summary"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Briefing</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="text-xs font-mono text-[#454652] hover:text-[#24389c] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            title="Copy Full Markdown Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Copy Markdown</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="text-xs font-mono text-[#454652] hover:text-[#24389c] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="text-xs font-mono text-[#454652] hover:text-[#24389c] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
