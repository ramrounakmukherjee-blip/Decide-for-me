import React from "react";
import { X, History, ArrowRight, Trash2, Calendar, Award } from "lucide-react";
import { DecisionResult } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DecisionResult[];
  onSelectDecision: (result: DecisionResult) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectDecision,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#c5c5d4]/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#c5c5d4]/30 flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#3f51b5]" />
            <h3 className="font-bold text-lg font-headline text-[#191c1e]">
              Decision History Log
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
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {history.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3 text-[#757684]">
              <History className="w-10 h-10 stroke-1 opacity-50" />
              <p className="text-sm">No decisions logged yet.</p>
              <p className="text-xs text-[#757684]/80 max-w-xs">
                Your past dilemmas and hyper-rational analyses will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectDecision(item);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-[#c5c5d4]/40 hover:border-[#3f51b5] bg-[#f7f9fb] hover:bg-white transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#757684]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#24389c] bg-[#3f51b5]/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {item.confidenceScore}% Confidence
                    </span>
                  </div>

                  <div className="text-sm font-bold font-headline text-[#191c1e]">
                    {item.optionA} <span className="text-[#757684] font-normal">vs</span> {item.optionB}
                  </div>

                  <p className="text-xs text-[#454652] line-clamp-2">
                    {item.verdictHeadline}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#3f51b5] font-semibold pt-1 border-t border-[#c5c5d4]/20 group-hover:translate-x-0.5 transition-transform">
                    <span>Winner: {item.recommendedOption}</span>
                    <span className="flex items-center gap-1">
                      View Full Analysis <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-[#c5c5d4]/30 bg-[#f7f9fb] flex justify-between items-center">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#3f51b5] text-white hover:bg-[#24389c] font-button text-xs font-semibold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
