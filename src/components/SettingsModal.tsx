import React from "react";
import { X, Settings, Sliders, Check } from "lucide-react";
import { AppSettings, DecisionMode } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const DECISION_MODES: { id: DecisionMode; title: string; desc: string }[] = [
  {
    id: "Clinical Rational",
    title: "Clinical Rational (Default)",
    desc: "Strict quantitative alignment scoring across all active priorities with zero emotional bias.",
  },
  {
    id: "Regret Minimization",
    title: "Regret Minimization Engine",
    desc: "Applies Jeff Bezos' 10/10/10 rule to prevent future remorse over missed opportunities.",
  },
  {
    id: "Risk-Averse",
    title: "Risk-Averse (Capital/Stability Preservation)",
    desc: "Heavily penalizes options with downside volatility, hidden costs, or career instability.",
  },
  {
    id: "Aggressive Opportunity",
    title: "Aggressive Opportunity (Max Growth)",
    desc: "Maximizes long-term upside potential, adventure, learning leverage, and personal agency.",
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const setMode = (mode: DecisionMode) => {
    onUpdateSettings({ ...settings, decisionMode: mode });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#c5c5d4]/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#c5c5d4]/30 flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#3f51b5]" />
            <h3 className="font-bold text-lg font-headline text-[#191c1e]">
              Engine Logic & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#757684] hover:bg-[#eceef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
          {/* Decision Lens Mode Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 font-label-sm text-[#757684] uppercase tracking-wider text-xs">
              <Sliders className="w-3.5 h-3.5 text-[#3f51b5]" />
              Evaluation Lens Mode
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DECISION_MODES.map((m) => {
                const isSelected = settings.decisionMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "border-[#3f51b5] bg-[#3f51b5]/5 shadow-xs"
                        : "border-[#c5c5d4]/40 hover:border-[#3f51b5]/50 bg-[#f7f9fb]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        isSelected
                          ? "border-[#3f51b5] bg-[#3f51b5] text-white"
                          : "border-[#757684]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#191c1e] text-sm">{m.title}</span>
                      <p className="text-xs text-[#454652] leading-normal">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#c5c5d4]/30">
            <span className="font-label-sm text-[#757684] uppercase tracking-wider text-xs">
              Storage & Persistence
            </span>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#f7f9fb] border border-[#c5c5d4]/30 cursor-pointer">
              <span className="font-medium text-xs md:text-sm text-[#191c1e]">
                Auto-Save Decision History to Browser
              </span>
              <input
                type="checkbox"
                checked={settings.autoSaveHistory}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, autoSaveHistory: e.target.checked })
                }
                className="w-4 h-4 accent-[#3f51b5] rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#c5c5d4]/30 bg-[#f7f9fb] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#3f51b5] text-white hover:bg-[#24389c] font-button text-xs font-semibold"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
