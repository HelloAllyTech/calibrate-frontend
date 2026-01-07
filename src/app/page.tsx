"use client";

import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SpeechToTextEvaluation } from "@/components/evaluations/SpeechToTextEvaluation";
import { TextToSpeechEvaluation } from "@/components/evaluations/TextToSpeechEvaluation";
import { LLMEvaluation } from "@/components/evaluations/LLMEvaluation";
import { VoiceSimulationEvaluation } from "@/components/evaluations/VoiceSimulationEvaluation";
import { ChatSimulationEvaluation } from "@/components/evaluations/ChatSimulationEvaluation";

export default function Home() {
  const [activeItem, setActiveItem] = useState("stt");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderEvaluationContent = () => {
    switch (activeItem) {
      case "stt":
        return <SpeechToTextEvaluation />;
      case "tts":
        return <TextToSpeechEvaluation />;
      case "llm":
        return <LLMEvaluation />;
      case "voice-sim":
        return <VoiceSimulationEvaluation />;
      case "chat-sim":
        return <ChatSimulationEvaluation />;
      default:
        return <SpeechToTextEvaluation />;
    }
  };

  return (
    <AppLayout
      activeItem={activeItem}
      onItemChange={setActiveItem}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      {renderEvaluationContent()}
    </AppLayout>
  );
}
