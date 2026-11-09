import React, { useState } from "react";
import { X, Sparkles, Check, Plus, Trash2, ShieldCheck } from "lucide-react";
import { PriorityItem } from "../types";

interface EditPrioritiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prioritiesRaw: string;
  structuredPriorities: PriorityItem[];
  onSave: (rawText: string, structured: PriorityItem[]) => void;
}

const PRESET_PRIORITIES = [
  "Financial Stability & High Savings",
  "Work-Life Balance & Flexible Hours",
  "Bi-Annual Travel & Freedom to Explore",
  "Accelerated Career & Leadership Growth",
  "Proximity to Family & Loved Ones",
  "Mental Well-being & Low Stress",
  "Living in a Vibrant Global City",
];

export const EditPrioritiesModal: React.FC<EditPrioritiesModalProps> = ({
  isOpen,
  onClose,
  prioritiesRaw,
  structuredPriorities,
  onSave,
}) => {
  const [text, setText] = useState(prioritiesRaw);
  const [items, setItems] = useState<PriorityItem[]>(structuredPriorities);
  const [isRefining, setIsRefining] = useState(false);

  if (!isOpen) return null;

  const handleRefine = async () => {
    if (!text.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/refine-priorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prioritiesText: text }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.priorities)) {
        setItems(data.priorities);
      }
    } catch (e) {
      console.error("Refinement failed", e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddPreset = (preset: string) => {
    if (text.includes(preset)) return;
    const newText = text.trim() ? `${text.trim()}\n${preset}` : preset;
    setText(newText);
    setItems([
      ...items,
      {
        id: "p_" + Date.now() + Math.random(),
        title: preset,
        weight: "High",
        customWeight: 8,
      },
    ]);
  };

  const handleUpdateWeight = (id: string, weightValue: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let weightLevel: "Critical" | "High" | "Medium" | "Low" = "Medium";
        if (weightValue >= 9) weightLevel = "Critical";
        else if (weightValue >= 7) weightLevel = "High";
        else if (weightValue >= 4) weightLevel = "Medium";
        else weightLevel = "Low";

        return {
          ...item,
          customWeight: weightValue,
          weight: weightLevel,
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    onSave(text, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#c5c5d4]/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#c5c5d4]/30 flex items-center justify-between bg-[#f7f9fb]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3f51b5]" />
            <h3 className="font-bold text-lg font-headline text-[#191c1e]">
              Edit Clinical Priorities
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#757684] hover:bg-[#eceef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-[#757684] uppercase tracking-wider text-xs">
              Primary Life Values & Directives (Natural Language)
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Financial stability, having a good work life balance that allows me to travel twice a year."
              className="w-full bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c5c5d4]/50 focus:border-[#3f51b5] focus:bg-white text-[#191c1e] outline-none font-body text-sm leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleRefine}
              disabled={isRefining || !text.trim()}
              className="text-xs bg-[#3f51b5]/10 hover:bg-[#3f51b5] hover:text-white text-[#24389c] font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRefining ? "animate-spin" : ""}`} />
              {isRefining ? "Structuring Priorities..." : "Auto-Extract Priority Tags"}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase text-[#757684]">Quick Add Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRIORITIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="text-xs bg-[#eceef0] hover:bg-[#c5c5d4]/40 text-[#191c1e] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3 text-[#3f51b5]" />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Items */}
          {items.length > 0 && (
            <div className="flex flex-col gap-3 pt-3 border-t border-[#c5c5d4]/30">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-[#757684]">
                  Active Decision Variables ({items.length})
                </span>
                <span className="text-[11px] font-mono text-[#3f51b5] font-semibold">
                  Custom Weighting (1 = Minor, 10 = Critical)
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const weightVal = item.customWeight || (item.weight === "Critical" ? 10 : item.weight === "High" ? 8 : item.weight === "Medium" ? 5 : 3);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl bg-[#f7f9fb] border border-[#c5c5d4]/30 gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3f51b5] shrink-0"></span>
                        <span className="font-semibold text-xs md:text-sm text-[#191c1e]">
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-[#c5c5d4]/30">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          weightVal >= 9
                            ? "bg-red-100 text-red-800"
                            : weightVal >= 7
                            ? "bg-indigo-100 text-indigo-800"
                            : weightVal >= 4
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          Weight: {weightVal}/10 ({item.weight || "High"})
                        </span>

                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={weightVal}
                          onChange={(e) => handleUpdateWeight(item.id, parseInt(e.target.value))}
                          className="w-24 accent-[#3f51b5] cursor-pointer"
                        />

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove priority"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#c5c5d4]/30 bg-[#f7f9fb] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[#454652] hover:bg-[#eceef0] font-button text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#3f51b5] text-white hover:bg-[#24389c] font-button text-sm font-semibold flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Priorities
          </button>
        </div>
      </div>
    </div>
  );
};
