/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SidebarPriorities } from "./components/SidebarPriorities";
import { DilemmaForm } from "./components/DilemmaForm";
import { ChatFlow } from "./components/ChatFlow";
import { EditPrioritiesModal } from "./components/EditPrioritiesModal";
import { HistoryModal } from "./components/HistoryModal";
import { SettingsModal } from "./components/SettingsModal";
import { AuthModal } from "./components/AuthModal";
import {
  auth,
  saveDecisionToFirestore,
  subscribeUserDecisions,
  callDeciderFlowTemplate
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  PriorityItem,
  DecisionResult,
  ChatMessage,
  AppSettings,
} from "./types";
import { X } from "lucide-react";

const DEFAULT_PRIORITIES_RAW =
  "Financial stability, having a good work life balance that allows me to travel twice a year.";

const DEFAULT_STRUCTURED_PRIORITIES: PriorityItem[] = [
  {
    id: "p1",
    title: "Financial Stability",
    weight: "Critical",
    customWeight: 10,
    description: "Maintaining reliable income and savings growth",
  },
  {
    id: "p2",
    title: "Work-Life Balance",
    weight: "High",
    customWeight: 8,
    description: "Flexible working hours and low burnout risk",
  },
  {
    id: "p3",
    title: "Bi-Annual Travel",
    weight: "High",
    customWeight: 8,
    description: "Freedom and capital to travel twice a year",
  },
];

export default function App() {
  // Firebase Auth user state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // State
  const [prioritiesRaw, setPrioritiesRaw] = useState<string>(() => {
    return localStorage.getItem("dfm_priorities_raw") || DEFAULT_PRIORITIES_RAW;
  });

  const [structuredPriorities, setStructuredPriorities] = useState<PriorityItem[]>(() => {
    const saved = localStorage.getItem("dfm_structured_priorities");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_STRUCTURED_PRIORITIES;
  });

  const [history, setHistory] = useState<DecisionResult[]>(() => {
    const saved = localStorage.getItem("dfm_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("dfm_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      decisionMode: "Clinical Rational",
      autoSaveHistory: true,
    };
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<DecisionResult | null>(null);

  // Modals state
  const [isEditPrioritiesOpen, setIsEditPrioritiesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth Listener & Firestore Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubFirestore = subscribeUserDecisions(user.uid, (firestoreDecisions) => {
      if (firestoreDecisions && firestoreDecisions.length > 0) {
        setHistory(firestoreDecisions);
      }
    });
    return () => unsubFirestore();
  }, [user]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("dfm_priorities_raw", prioritiesRaw);
  }, [prioritiesRaw]);

  useEffect(() => {
    localStorage.setItem("dfm_structured_priorities", JSON.stringify(structuredPriorities));
  }, [structuredPriorities]);

  useEffect(() => {
    if (settings.autoSaveHistory) {
      localStorage.setItem("dfm_history", JSON.stringify(history));
    }
  }, [history, settings.autoSaveHistory]);

  useEffect(() => {
    localStorage.setItem("dfm_settings", JSON.stringify(settings));
  }, [settings]);

  // Handle Dilemma Submission
  const handleDilemmaSubmit = async (data: {
    dilemma: string;
    optionA: string;
    optionB: string;
    extraOptions: string[];
    userProsCons?: any[];
  }) => {
    setIsLoading(true);

    let prosConsSummary = "";
    if (data.userProsCons && data.userProsCons.length > 0) {
      const summaryItems = data.userProsCons.map(
        (pc) =>
          `${pc.optionName}: ${pc.pros?.length ? pc.pros.length + ' pros' : '0 pros'}, ${pc.cons?.length ? pc.cons.length + ' cons' : '0 cons'}`
      );
      prosConsSummary = `\nUser Pros & Cons: ${summaryItems.join(" | ")}`;
    }

    // Create user prompt message
    const userPromptText = `DILEMMA: ${data.dilemma || "Comparative Choice"}
Option A: ${data.optionA}
Option B: ${data.optionB}${data.extraOptions.length ? `\nAdditional Options: ${data.extraOptions.join(", ")}` : ""}${prosConsSummary}`;

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: userPromptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // 1. Call Firebase AI Logic SDK with prompt template "decider-flow"
      try {
        const templateRes = await callDeciderFlowTemplate({
          priorities: prioritiesRaw,
          optionA: data.optionA,
          optionB: data.optionB,
        });

        const systemMessage: ChatMessage = {
          id: "msg_sys_" + Date.now(),
          role: "system",
          systemTemplateResult: templateRes,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, systemMessage]);
      } catch (templateErr: any) {
        console.warn("Template decider-flow execution warning:", templateErr);
      }

      // 2. Fetch full quantitative decision analysis
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma: data.dilemma,
          optionA: data.optionA,
          optionB: data.optionB,
          extraOptions: data.extraOptions,
          userProsCons: data.userProsCons,
          priorities: prioritiesRaw,
          structuredPriorities: structuredPriorities,
          mode: settings.decisionMode,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to analyze decision.");
      }

      const result: DecisionResult = {
        id: "dec_" + Date.now(),
        timestamp: new Date().toISOString(),
        dilemma: data.dilemma,
        optionA: data.optionA,
        optionB: data.optionB,
        extraOptions: data.extraOptions,
        userProsCons: data.userProsCons,
        prioritiesUsed: prioritiesRaw,
        ...resData.data,
      };

      setCurrentDecision(result);
      if (settings.autoSaveHistory) {
        setHistory((prev) => [result, ...prev]);
      }

      // If user is authenticated, persist to Firestore
      if (user) {
        saveDecisionToFirestore(user.uid, result);
      }

      const assistantMessage: ChatMessage = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        decisionResult: result,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Decision error:", error);
      const errorMessage: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `Error evaluating decision: ${error.message || "Something went wrong. Please check your network and try again."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Chat / Follow-up queries
  const handleSendChatQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const chatPayloadMessages = messages
        .filter((m) => m.content)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      chatPayloadMessages.push({ role: "user", content: queryText });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatPayloadMessages,
          dilemma: currentDecision?.dilemma || "",
          optionA: currentDecision?.optionA || "Option A",
          optionB: currentDecision?.optionB || "Option B",
          priorities: prioritiesRaw,
          currentDecision,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to respond.");
      }

      const assistantMessage: ChatMessage = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: resData.text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `Sorry, I encountered an issue answering: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Selecting a decision from history to reload
  const handleSelectHistoryDecision = (result: DecisionResult) => {
    setCurrentDecision(result);
    setMessages([
      {
        id: "msg_hist_u_" + Date.now(),
        role: "user",
        content: `DILEMMA: ${result.dilemma || "Historical Decision"}\nOption A: ${result.optionA}\nOption B: ${result.optionB}`,
        timestamp: result.timestamp,
      },
      {
        id: "msg_hist_a_" + Date.now(),
        role: "assistant",
        decisionResult: result,
        timestamp: result.timestamp,
      },
    ]);
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("dfm_history");
  };

  return (
    <div className="font-body h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#f7f9fb] text-[#191c1e]">
      {/* Left Panel: Main Workspace */}
      <main className="flex-1 flex flex-col relative h-full bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 w-full lg:w-[75%] transition-all duration-300">
        {/* Top Header */}
        <Header
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPrioritiesMobile={() => setIsMobileSidebarOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          user={user}
        />

        {/* Chat / Analysis Workspace */}
        <ChatFlow
          messages={messages}
          isLoading={isLoading}
          onSelectFollowUp={handleSendChatQuery}
          onSendChatQuery={handleSendChatQuery}
        />

        {/* Dilemma Input Box at Bottom */}
        <DilemmaForm onSubmit={handleDilemmaSubmit} isLoading={isLoading} />
      </main>

      {/* Right Panel: SideNavBar / Priorities Sidebar (Desktop) */}
      <div className="hidden lg:block w-[25%] h-full">
        <SidebarPriorities
          prioritiesRaw={prioritiesRaw}
          structuredPriorities={structuredPriorities}
          onOpenEditPriorities={() => setIsEditPrioritiesOpen(true)}
          decisionMode={settings.decisionMode}
        />
      </div>

      {/* Mobile Priorities Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#f2f4f6] h-full shadow-2xl ml-auto flex flex-col z-10">
            <div className="p-4 flex justify-between items-center border-b border-[#c5c5d4]/30">
              <span className="font-bold font-headline text-base">Priorities Drawer</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded text-[#757684]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarPriorities
                prioritiesRaw={prioritiesRaw}
                structuredPriorities={structuredPriorities}
                onOpenEditPriorities={() => {
                  setIsMobileSidebarOpen(false);
                  setIsEditPrioritiesOpen(true);
                }}
                decisionMode={settings.decisionMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditPrioritiesModal
        isOpen={isEditPrioritiesOpen}
        onClose={() => setIsEditPrioritiesOpen(false)}
        prioritiesRaw={prioritiesRaw}
        structuredPriorities={structuredPriorities}
        onSave={(raw, items) => {
          setPrioritiesRaw(raw);
          setStructuredPriorities(items);
        }}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectDecision={handleSelectHistoryDecision}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
      />
    </div>
  );
}
