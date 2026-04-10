"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STAGE_LABELS = [
  "What energises you",
  "What drains you",
  "Professional goals",
  "Life priorities",
  "Communication style",
  "Autonomy preference",
  "Wrapping up",
];

export function OnboardingChat() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [personaReady, setPersonaReady] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/onboarding/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm Alter — I'd love to get to know you so I can be truly useful. Let's start with what gives you energy. What activities or situations make you feel most alive and engaged?",
        },
      ],
      onFinish: () => {
        const userMsgCount = messages.filter((m) => m.role === "user").length;
        if (userMsgCount >= 5 && !personaReady) {
          setPersonaReady(true);
        }
      },
    });

  // Compute progress
  const userMessages = messages.filter((m) => m.role === "user").length;
  const progress = Math.min((userMessages / 7) * 100, 100);
  const currentStage = Math.min(userMessages, STAGE_LABELS.length - 1);

  // Check personaReady based on message count
  useEffect(() => {
    if (userMessages >= 6 && !personaReady) {
      setPersonaReady(true);
    }
  }, [userMessages, personaReady]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build conversation history for persona generation
  function getConversationHistory() {
    return messages.map((m) => ({
      role: (m.role === "user" ? "USER" : "ASSISTANT") as "USER" | "ASSISTANT",
      content: m.content,
    }));
  }

  async function handleGeneratePersona() {
    setGenerating(true);
    try {
      const response = await fetch("/api/onboarding/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: getConversationHistory(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate persona");
      }

      router.push("/onboarding/persona");
    } catch {
      setGenerating(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Pass full conversation history in the body
    handleSubmit(e, {
      body: {
        conversationHistory: getConversationHistory(),
      },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] max-w-2xl mx-auto flex-col gap-4 p-4">
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{STAGE_LABELS[currentStage]}</span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-muted text-xs">
                  <Sparkles className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Generate persona button */}
      {personaReady && (
        <Button
          onClick={handleGeneratePersona}
          disabled={generating}
          size="lg"
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating your persona...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate my persona
            </>
          )}
        </Button>
      )}

      {/* Input */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          rows={1}
          className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="shrink-0 rounded-xl"
        >
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
