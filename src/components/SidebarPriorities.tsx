import React from "react";
import { Edit3, Target, ShieldCheck, Sparkles } from "lucide-react";
import { PriorityItem } from "../types";

interface SidebarPrioritiesProps {
  prioritiesRaw: string;
  structuredPriorities: PriorityItem[];
  onOpenEditPriorities: () => void;
  decisionMode: string;
}

export const SidebarPriorities: React.FC<SidebarPrioritiesProps> = ({
  prioritiesRaw,
  structuredPriorities,
  onOpenEditPriorities,
  decisionMode,
}) => {
  return (
    <aside className="w-full lg:w-[25%] bg-[#f2f4f6] border-l border-[#c5c5d4]/40 shadow-sm h-full flex flex-col p-6 gap-6 right-0 top-0 overflow-y-auto shrink-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline text-[#191c1e]">My Priorities</h2>
          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#3f51b5]/10 text-[#24389c]">
            Active
          </span>
        </div>
        <p className="text-sm font-body text-[#454652] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#4c56af]" />
          Clinical Decision Logic
        </p>
      </div>

      {/* Main Quote / Priorities Card */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#c5c5d4]/40 hover:shadow-md transition-shadow flex flex-col gap-3">
        <div className="text-xs font-mono uppercase text-[#757684] tracking-wider font-semibold">
          Primary Life Directive
        </div>
        <p className="font-body text-[#191c1e] leading-relaxed italic text-sm md:text-base border-l-2 border-[#3f51b5] pl-3 py-0.5">
          "{prioritiesRaw}"
        </p>

        {structuredPriorities && structuredPriorities.length > 0 && (
          <div className="mt-2 pt-3 border-t border-[#c5c5d4]/20 flex flex-col gap-2">
            <span className="text-xs font-mono text-[#757684] uppercase">Weighted Priorities</span>
            <div className="flex flex-wrap gap-1.5">
              {structuredPriorities.map((item) => {
                const w = item.customWeight || (item.weight === "Critical" ? 10 : item.weight === "High" ? 8 : 5);
                return (
                  <span
                    key={item.id}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#eceef0] text-[#191c1e] font-medium border border-[#c5c5d4]/30 flex items-center gap-1.5"
                  >
                    <Target className="w-3 h-3 text-[#3f51b5]" />
                    <span>{item.title}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#3f51b5]/15 text-[#24389c] font-bold">
                      {w}/10
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Decision Engine Mode Card */}
      <div className="bg-[#eceef0]/60 rounded-xl p-4 border border-[#c5c5d4]/30 flex flex-col gap-1.5">
        <div className="text-xs font-mono uppercase text-[#757684] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#3f51b5]" />
          Evaluation Lens
        </div>
        <div className="text-sm font-semibold text-[#191c1e]">{decisionMode}</div>
        <p className="text-xs text-[#454652] leading-normal">
          Prioritizes quantifiable priority alignment scores and regret minimization over emotional impulse.
        </p>
      </div>

      {/* Edit Priorities Button */}
      <button
        onClick={onOpenEditPriorities}
        className="mt-auto w-full border border-[#4c56af] text-[#4c56af] bg-transparent hover:bg-[#4c56af]/10 font-button h-12 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-xs"
      >
        <Edit3 className="w-4 h-4 text-[#4c56af]" />
        Edit Priorities
      </button>
    </aside>
  );
};
