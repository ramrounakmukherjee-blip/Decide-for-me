import React, { useRef, useEffect } from "react";
import { Sparkles, Bot, User, ArrowUp } from "lucide-react";
import { ChatMessage } from "../types";
import { DecisionResultCard } from "./DecisionResultCard";

interface ChatFlowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectFollowUp: (query: string) => void;
  onSendChatQuery: (text: string) => void;
}

export const ChatFlow: React.FC<ChatFlowProps> = ({
  messages,
  isLoading,
  onSelectFollowUp,
  onSendChatQuery,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = React.useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    onSendChatQuery(chatInput.trim());
    setChatInput("");
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 p-4 md:p-10 overflow-y-auto flex flex-col gap-6 w-full max-w-[1000px] mx-auto scroll-smooth"
    >
      {/* Initial Default System Message */}
      <div className="flex self-start max-w-[85%] md:max-w-[80%]">
        <div className="bg-[#f2f4f6] text-[#191c1e] px-6 py-4 rounded-2xl rounded-tl-sm shadow-xs border border-[#c5c5d4]/30 font-body text-lg md:text-xl font-bold flex items-center gap-3">
          <Bot className="w-6 h-6 text-[#24389c] shrink-0" />
          <span>TELL ME YOUR DILEMMA!</span>
        </div>
      </div>

      {/* Messages Stream */}
      {messages.map((msg) => {
        if (msg.role === "system" || msg.systemTemplateResult) {
          const res = msg.systemTemplateResult;
          return (
            <div key={msg.id} className="flex self-start max-w-[85%] md:max-w-[80%] my-2">
              <div className="bg-[#f7f9fb] border border-[#3f51b5]/30 text-[#191c1e] p-5 rounded-2xl rounded-tl-sm shadow-md flex flex-col gap-3 w-full">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-2 border-b border-[#c5c5d4]/30">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#3f51b5] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#3f51b5]" />
                    <span>System Decider-Flow Output</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#757684]">Template: decider-flow</span>
                </div>

                {res ? (
                  <>
                    {/* Verdict */}
                    <div className="bg-[#3f51b5]/10 border border-[#3f51b5]/20 p-3.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#24389c]">
                        Verdict
                      </span>
                      <p className="font-bold text-base md:text-lg text-[#191c1e] font-headline">
                        {res.verdict}
                      </p>
                    </div>

                    {/* Justification */}
                    <div className="flex flex-col gap-1 px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#757684]">
                        Rational Justification
                      </span>
                      <p className="text-xs md:text-sm text-[#454652] leading-relaxed font-body">
                        {res.justification}
                      </p>
                    </div>

                    {/* First Step */}
                    <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl flex items-start gap-2.5 text-emerald-900 mt-1">
                      <div className="bg-emerald-600 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded mt-0.5 shrink-0">
                        FIRST STEP
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-emerald-950 leading-snug">
                        {res.firstStep}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[#191c1e]">{msg.content}</div>
                )}
              </div>
            </div>
          );
        }

        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex self-end max-w-[85%] md:max-w-[75%] my-1">
              <div className="bg-[#3f51b5] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-xs text-sm md:text-base font-medium flex items-start gap-2.5">
                <User className="w-4 h-4 mt-1 shrink-0 opacity-80" />
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        }

        if (msg.role === "assistant" && msg.decisionResult) {
          return (
            <div key={msg.id} className="w-full">
              <DecisionResultCard
                result={msg.decisionResult}
                onSelectFollowUp={onSelectFollowUp}
              />
            </div>
          );
        }

        // Standard assistant chat response
        return (
          <div key={msg.id} className="flex self-start max-w-[90%] md:max-w-[80%] my-1">
            <div className="bg-white text-[#191c1e] p-5 rounded-2xl rounded-tl-sm shadow-sm border border-[#c5c5d4]/40 text-sm md:text-base leading-relaxed flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3f51b5] font-semibold">
                <Bot className="w-4 h-4" />
                <span>Decide For Me</span>
              </div>
              <div className="whitespace-pre-wrap font-body text-[#191c1e]">
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading Indicator State */}
      {isLoading && (
        <div className="flex self-start max-w-[80%] my-2">
          <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-xs border border-[#c5c5d4]/40 flex items-center gap-3 text-sm font-medium text-[#454652]">
            <Sparkles className="w-5 h-5 text-[#3f51b5] animate-spin" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#191c1e] font-headline">Clinical Analysis in Progress...</span>
              <span className="text-xs text-[#757684]">Weighing options against life priorities & calculating regret index</span>
            </div>
          </div>
        </div>
      )}

      {/* Inline Follow-up Chat Bar (if at least one decision has been made) */}
      {messages.some((m) => m.decisionResult) && !isLoading && (
        <div className="mt-4 pt-4 border-t border-[#c5c5d4]/30">
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question about this decision..."
              className="flex-1 bg-white h-11 rounded-lg px-4 border border-[#c5c5d4]/50 focus:border-[#3f51b5] text-sm text-[#191c1e] outline-none shadow-xs"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-[#3f51b5] text-white h-11 px-4 rounded-lg hover:bg-[#24389c] disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
