import React, { useState } from "react";
import { Plus, Trash2, HelpCircle, ArrowRight, Sparkles, ThumbsUp, ThumbsDown, ListPlus, ChevronDown, ChevronUp } from "lucide-react";
import { UserOptionProsCons } from "../types";

interface DilemmaFormProps {
  onSubmit: (data: {
    dilemma: string;
    optionA: string;
    optionB: string;
    extraOptions: string[];
    userProsCons: UserOptionProsCons[];
  }) => void;
  isLoading: boolean;
}

export const DilemmaForm: React.FC<DilemmaFormProps> = ({ onSubmit, isLoading }) => {
  const [optionA, setOptionA] = useState("Move to New York");
  const [optionB, setOptionB] = useState("Stay in London");
  const [dilemma, setDilemma] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);
  const [showProsConsSection, setShowProsConsSection] = useState(false);
  const [extraOptions, setExtraOptions] = useState<string[]>([]);

  // Pros and cons state
  const [prosA, setProsA] = useState<string[]>(["Higher salary potential", "Vibrant networking scene"]);
  const [consA, setConsA] = useState<string[]>(["High cost of rent", "Far from family"]);
  const [newProA, setNewProA] = useState("");
  const [newConA, setNewConA] = useState("");

  const [prosB, setProsB] = useState<string[]>(["Established social circle", "Familiar lifestyle"]);
  const [consB, setConsB] = useState<string[]>(["Slower career progression"]);
  const [newProB, setNewProB] = useState("");
  const [newConB, setNewConB] = useState("");

  // Pros & cons for extra options (indexed by extra option idx)
  const [extraPros, setExtraPros] = useState<{ [key: number]: string[] }>({});
  const [extraCons, setExtraCons] = useState<{ [key: number]: string[] }>({});
  const [newExtraPro, setNewExtraPro] = useState<{ [key: number]: string }>({});
  const [newExtraCon, setNewExtraCon] = useState<{ [key: number]: string }>({});

  const handleAddProA = () => {
    if (newProA.trim()) {
      setProsA([...prosA, newProA.trim()]);
      setNewProA("");
    }
  };

  const handleAddConA = () => {
    if (newConA.trim()) {
      setConsA([...consA, newConA.trim()]);
      setNewConA("");
    }
  };

  const handleAddProB = () => {
    if (newProB.trim()) {
      setProsB([...prosB, newProB.trim()]);
      setNewProB("");
    }
  };

  const handleAddConB = () => {
    if (newConB.trim()) {
      setConsB([...consB, newConB.trim()]);
      setNewConB("");
    }
  };

  const handleAddExtraPro = (idx: number) => {
    const text = newExtraPro[idx]?.trim();
    if (text) {
      setExtraPros({
        ...extraPros,
        [idx]: [...(extraPros[idx] || []), text],
      });
      setNewExtraPro({ ...newExtraPro, [idx]: "" });
    }
  };

  const handleAddExtraCon = (idx: number) => {
    const text = newExtraCon[idx]?.trim();
    if (text) {
      setExtraCons({
        ...extraCons,
        [idx]: [...(extraCons[idx] || []), text],
      });
      setNewExtraCon({ ...newExtraCon, [idx]: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionA.trim() || !optionB.trim()) return;

    const userProsCons: UserOptionProsCons[] = [
      {
        optionName: optionA.trim(),
        pros: prosA,
        cons: consA,
      },
      {
        optionName: optionB.trim(),
        pros: prosB,
        cons: consB,
      },
    ];

    extraOptions.forEach((opt, idx) => {
      if (opt.trim()) {
        userProsCons.push({
          optionName: opt.trim(),
          pros: extraPros[idx] || [],
          cons: extraCons[idx] || [],
        });
      }
    });

    onSubmit({
      dilemma: dilemma.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      extraOptions: extraOptions.filter((opt) => opt.trim().length > 0),
      userProsCons,
    });
  };

  const addExtraOption = () => {
    if (extraOptions.length < 2) {
      setExtraOptions([...extraOptions, ""]);
    }
  };

  const updateExtraOption = (index: number, val: string) => {
    const next = [...extraOptions];
    next[index] = val;
    setExtraOptions(next);
  };

  const removeExtraOption = (index: number) => {
    setExtraOptions(extraOptions.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 md:px-10 pt-0 w-full max-w-[950px] mx-auto mt-auto mb-6 shrink-0 z-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#c5c5d4]/40 p-5 md:p-6 flex flex-col gap-4 transition-all duration-200 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.12)] focus-within:border-[#3f51b5]/50"
      >
        {/* Top Control Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#757684]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowContextInput(!showContextInput)}
              className="flex items-center gap-1.5 text-[#3f51b5] hover:underline font-semibold text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showContextInput ? "Hide Context" : "+ Add Dilemma Context"}
            </button>

            <button
              type="button"
              onClick={() => setShowProsConsSection(!showProsConsSection)}
              className="flex items-center gap-1.5 text-[#4c56af] hover:underline font-semibold text-xs bg-[#3f51b5]/10 px-2.5 py-1 rounded-md"
            >
              <ListPlus className="w-3.5 h-3.5" />
              {showProsConsSection ? "Hide Pros & Cons" : "+ Add Pros & Cons for Options"}
              {showProsConsSection ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {extraOptions.length < 2 && (
            <button
              type="button"
              onClick={addExtraOption}
              className="flex items-center gap-1 text-[#4c56af] hover:text-[#24389c] text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Option C
            </button>
          )}
        </div>

        {/* Optional Context Field */}
        {showContextInput && (
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-[#757684] uppercase tracking-wider text-[11px]">
              Dilemma Background / Specific Question
            </label>
            <input
              type="text"
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              placeholder="e.g. Balancing salary vs quality of life for my next 3 years..."
              className="w-full bg-[#f7f9fb] h-10 rounded-lg px-3.5 border border-[#c5c5d4]/50 focus:border-[#3f51b5] focus:bg-white focus:ring-1 focus:ring-[#3f51b5] text-sm text-[#191c1e] outline-none transition-colors"
            />
          </div>
        )}

        {/* Primary Inputs Grid */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* Option A */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="optionA" className="font-label-sm text-[#757684] uppercase tracking-wider">
              Option A
            </label>
            <input
              id="optionA"
              type="text"
              required
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder="Enter first option..."
              className="w-full bg-[#f7f9fb] h-14 rounded-lg px-4 border border-[#c5c5d4]/50 focus:border-[#3f51b5] focus:bg-white focus:ring-1 focus:ring-[#3f51b5] transition-colors font-body text-base text-[#191c1e] outline-none"
            />
          </div>

          <div className="hidden md:flex w-px bg-[#c5c5d4]/30 self-stretch my-2"></div>

          {/* Option B */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="optionB" className="font-label-sm text-[#757684] uppercase tracking-wider">
              Option B
            </label>
            <input
              id="optionB"
              type="text"
              required
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder="Enter alternative..."
              className="w-full bg-[#f7f9fb] h-14 rounded-lg px-4 border border-[#c5c5d4]/50 focus:border-[#3f51b5] focus:bg-white focus:ring-1 focus:ring-[#3f51b5] transition-colors font-body text-base text-[#191c1e] outline-none"
            />
          </div>

          {/* Extra Options (if added) */}
          {extraOptions.map((opt, idx) => (
            <React.Fragment key={idx}>
              <div className="hidden md:flex w-px bg-[#c5c5d4]/30 self-stretch my-2"></div>
              <div className="flex-1 flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-[#757684] uppercase tracking-wider">
                    Option {String.fromCharCode(67 + idx)}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeExtraOption(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateExtraOption(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(67 + idx)}...`}
                  className="w-full bg-[#f7f9fb] h-14 rounded-lg px-4 border border-[#c5c5d4]/50 focus:border-[#3f51b5] focus:bg-white focus:ring-1 focus:ring-[#3f51b5] transition-colors font-body text-base text-[#191c1e] outline-none"
                />
              </div>
            </React.Fragment>
          ))}

          {/* Submit GO Button */}
          <button
            type="submit"
            disabled={isLoading || !optionA.trim() || !optionB.trim()}
            className="bg-[#3f51b5] text-white h-14 px-8 rounded-lg font-button uppercase tracking-wide shadow-sm hover:bg-[#24389c] active:scale-[0.98] transition-all flex items-center justify-center min-w-[110px] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Thinking
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                GO
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>

        {/* Pros and Cons Input Section */}
        {showProsConsSection && (
          <div className="mt-2 pt-4 border-t border-[#c5c5d4]/30 flex flex-col gap-4 bg-[#f7f9fb] p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#24389c] tracking-wider">
                User-Weighted Pros & Cons Section
              </span>
              <span className="text-xs text-[#757684]">
                Inputs here directly influence quantitative decision scores
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A Pros & Cons */}
              <div className="p-3.5 rounded-lg bg-white border border-[#c5c5d4]/40 flex flex-col gap-3">
                <div className="font-bold text-sm text-[#191c1e] flex items-center justify-between border-b border-gray-100 pb-2">
                  <span>Pros & Cons for {optionA || "Option A"}</span>
                  <span className="text-[11px] font-mono text-[#3f51b5] font-semibold">
                    {prosA.length} Pros / {consA.length} Cons
                  </span>
                </div>

                {/* Pros A Input & List */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" /> Pros (+)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newProA}
                      onChange={(e) => setNewProA(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProA();
                        }
                      }}
                      placeholder="Add a pro for Option A..."
                      className="flex-1 bg-[#f7f9fb] h-8 px-2.5 rounded text-xs border border-[#c5c5d4]/40 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddProA}
                      className="px-2.5 h-8 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prosA.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() => setProsA(prosA.filter((_, i) => i !== idx))}
                          className="hover:text-red-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cons A Input & List */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3 text-amber-600" /> Cons (-)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newConA}
                      onChange={(e) => setNewConA(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddConA();
                        }
                      }}
                      placeholder="Add a con for Option A..."
                      className="flex-1 bg-[#f7f9fb] h-8 px-2.5 rounded text-xs border border-[#c5c5d4]/40 focus:border-amber-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddConA}
                      className="px-2.5 h-8 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {consA.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => setConsA(consA.filter((_, i) => i !== idx))}
                          className="hover:text-red-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Option B Pros & Cons */}
              <div className="p-3.5 rounded-lg bg-white border border-[#c5c5d4]/40 flex flex-col gap-3">
                <div className="font-bold text-sm text-[#191c1e] flex items-center justify-between border-b border-gray-100 pb-2">
                  <span>Pros & Cons for {optionB || "Option B"}</span>
                  <span className="text-[11px] font-mono text-[#3f51b5] font-semibold">
                    {prosB.length} Pros / {consB.length} Cons
                  </span>
                </div>

                {/* Pros B Input & List */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" /> Pros (+)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newProB}
                      onChange={(e) => setNewProB(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProB();
                        }
                      }}
                      placeholder="Add a pro for Option B..."
                      className="flex-1 bg-[#f7f9fb] h-8 px-2.5 rounded text-xs border border-[#c5c5d4]/40 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddProB}
                      className="px-2.5 h-8 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prosB.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() => setProsB(prosB.filter((_, i) => i !== idx))}
                          className="hover:text-red-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cons B Input & List */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3 text-amber-600" /> Cons (-)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newConB}
                      onChange={(e) => setNewConB(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddConB();
                        }
                      }}
                      placeholder="Add a con for Option B..."
                      className="flex-1 bg-[#f7f9fb] h-8 px-2.5 rounded text-xs border border-[#c5c5d4]/40 focus:border-amber-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddConB}
                      className="px-2.5 h-8 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {consB.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => setConsB(consB.filter((_, i) => i !== idx))}
                          className="hover:text-red-600 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra Options Pros & Cons */}
              {extraOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-white border border-[#c5c5d4]/40 flex flex-col gap-3 md:col-span-2"
                >
                  <div className="font-bold text-sm text-[#191c1e] flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>Pros & Cons for Option {String.fromCharCode(67 + idx)} ({opt || "Untitled"})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-emerald-700">Pros (+)</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newExtraPro[idx] || ""}
                          onChange={(e) => setNewExtraPro({ ...newExtraPro, [idx]: e.target.value })}
                          placeholder="Add pro..."
                          className="flex-1 bg-[#f7f9fb] h-8 px-2 rounded text-xs border outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddExtraPro(idx)}
                          className="px-2 h-8 bg-emerald-600 text-white text-xs rounded"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(extraPros[idx] || []).map((p, pIdx) => (
                          <span key={pIdx} className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-amber-700">Cons (-)</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newExtraCon[idx] || ""}
                          onChange={(e) => setNewExtraCon({ ...newExtraCon, [idx]: e.target.value })}
                          placeholder="Add con..."
                          className="flex-1 bg-[#f7f9fb] h-8 px-2 rounded text-xs border outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddExtraCon(idx)}
                          className="px-2 h-8 bg-amber-600 text-white text-xs rounded"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(extraCons[idx] || []).map((c, cIdx) => (
                          <span key={cIdx} className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

