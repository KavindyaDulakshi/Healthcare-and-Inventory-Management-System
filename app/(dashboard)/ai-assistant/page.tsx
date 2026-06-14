"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  MessageSquare,
  History,
  Pill,
  AlertTriangle,
  TrendingUp,
  LineChart,
  User,
  Plus
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  component?: React.ReactNode;
}

export default function AiAssistantPage() {
  const { medicines, appointments } = useHealthcare();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Hello! I am your clinical inventory copilot. I can query inventory statuses, predict medicine demand forecasting, review billing statements, and check doctor availability. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const [activeSession, setActiveSession] = useState("session-1");
  const sessions = [
    { id: "session-1", title: "Warehouse Evaluation", date: "Today" },
    { id: "session-2", title: "Monthly Revenue Digest", date: "Yesterday" },
    { id: "session-3", title: "Expiry Audit Report", date: "3 days ago" }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = generateAiResponse(text);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  // Generate specialized mock responses for clinical prompts
  const generateAiResponse = (query: string): ChatMessage => {
    const textLower = query.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `msg-${Date.now()}`;

    // 1. Show medicines expiring soon
    if (textLower.includes("expiring") || textLower.includes("expire")) {
      const expiringList = medicines.filter((m) => {
        const exp = new Date(m.expiryDate);
        const limit = new Date("2026-07-30"); 
        return exp <= limit;
      });

      return {
        id,
        sender: "ai",
        text: `I identified ${expiringList.length} pharmaceutical batches nearing or past their expiry constraints:`,
        timestamp,
        component: (
          <div className="flex flex-col gap-2.5 mt-3 border border-border bg-card rounded-xl p-3 text-xs w-full max-w-md">
            <span className="font-bold text-warning flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Expiry Audit Alerts
            </span>
            <div className="flex flex-col gap-2">
              {expiringList.map((m) => (
                <div key={m.id} className="flex justify-between items-center border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                  <span className="font-bold">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Expires: {m.expiryDate}</span>
                    <Badge variant={m.status === "expired" ? "danger" : "warning"}>{m.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      };
    }

    // 2. Predict demand & reorder quantity
    if (textLower.includes("demand") || textLower.includes("predict") || textLower.includes("reorder")) {
      return {
        id,
        sender: "ai",
        text: "Analyzing scheduling queue metrics and historical dispensing transaction volume...",
        timestamp,
        component: (
          <div className="flex flex-col gap-3 mt-3 border border-border bg-card rounded-xl p-4 text-xs w-full max-w-md">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 shrink-0" /> Demand Forecast & Reorder Guide
            </span>
            <p className="text-muted-foreground leading-normal text-left">
              Based on the 6 scheduled consultations and Walk-in indexes, I forecast an increase in demand. I recommend these reorder levels:
            </p>
            <div className="flex flex-col gap-2.5 border-t border-border pt-3 text-left">
              <div className="flex justify-between items-center">
                <span>Atorvastatin 20mg</span>
                <span className="font-bold text-secondary">Suggest Reorder: +150 units</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Amoxicillin 250mg</span>
                <span className="font-bold text-secondary">Suggest Reorder: +200 units</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Salbutamol Inhaler</span>
                <span className="font-bold text-danger">Critically Out of Stock (Reorder 100 units immediately)</span>
              </div>
            </div>
          </div>
        )
      };
    }

    // 3. Low stock medicines
    if (textLower.includes("low stock") || textLower.includes("stock")) {
      const lowStockList = medicines.filter((m) => m.status === "low-stock" || m.status === "out-of-stock");
      return {
        id,
        sender: "ai",
        text: `Here is the log of depleted/depleting items currently flagged in warehouse audits:`,
        timestamp,
        component: (
          <div className="flex flex-col gap-3 mt-3 border border-border bg-card rounded-xl p-3 text-xs w-full max-w-md">
            <span className="font-bold text-danger flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Low/Out-of-stock index
            </span>
            <div className="flex flex-col gap-2">
              {lowStockList.map((m) => (
                <div key={m.id} className="flex justify-between items-center border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                  <span className="font-bold text-left">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{m.quantity} left</span>
                    <Badge variant={m.status === "out-of-stock" ? "danger" : "warning"}>{m.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      };
    }

    // 4. Generate inventory report summary
    if (textLower.includes("report") || textLower.includes("inventory report") || textLower.includes("summary")) {
      const val = medicines.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
      return {
        id,
        sender: "ai",
        text: `I generated a real-time ledger report for your clinical inventory holdings:`,
        timestamp,
        component: (
          <div className="flex flex-col gap-3 mt-3 border border-border bg-card rounded-xl p-4 text-xs w-full max-w-md">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <LineChart className="h-4 w-4" /> Real-time Warehouse Summary
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1 pb-3 border-b border-border text-left">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Items</span>
                <span className="text-base font-black text-foreground">{medicines.length} batches</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Holdings Value</span>
                <span className="text-base font-black text-foreground">${val.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1 text-left">
              Currently, {medicines.filter((m) => m.status === "expired").length} batch is expired. Reorder operations are recommended for out-of-stock items.
            </p>
          </div>
        )
      };
    }

    // Default response
    return {
      id,
      sender: "ai",
      text: `I processed your inquiry regarding "${query}". While I compile specific analytical logs, you can examine inventory metrics directly via the sidebar menus, or execute stock replenishments using the quick actions on the Dashboard. Let me know if you need specific expiry indices or revenue metrics.`,
      timestamp
    };
  };

  const SUGGESTION_PROMPTS = [
    { text: "Show medicines expiring soon", icon: AlertTriangle, color: "text-warning bg-warning/10" },
    { text: "Predict reorder levels & demand", icon: TrendingUp, color: "text-primary bg-primary/10" },
    { text: "Generate inventory summary report", icon: Brain, color: "text-accent bg-accent/10" },
    { text: "Show low stock medicines", icon: Pill, color: "text-danger bg-danger/10" }
  ];

  return (
    <div className="flex-1 flex gap-6 h-[calc(100vh-12rem)] relative overflow-hidden">
      
      {/* Sidebar: Conversation Sessions */}
      <aside className="hidden md:flex flex-col w-64 bg-card border border-border rounded-2xl p-4 shrink-0 justify-between">
        <div className="flex flex-col gap-4">
          <Button variant="outline" className="w-full rounded-xl gap-2 text-xs py-5" onClick={() => setMessages([messages[0]])}>
            <Plus className="h-4 w-4" />
            <span>New Chat Session</span>
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Recent Audits</span>
            <div className="flex flex-col gap-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSession(s.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                    activeSession === s.id ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground font-semibold">
          <History className="h-4.5 w-4.5" />
          <span>Session Auto-Cached</span>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs relative">
        
        {/* Chat Window Panel Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">Clinical Assistant</span>
              <span className="text-[10px] text-muted-foreground">MediCare Copilot</span>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-lg text-[10px]">Active Model</Badge>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 bg-background/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Profile letter marker */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                msg.sender === "user" ? "bg-primary text-white" : "bg-card border border-border text-primary"
              }`}>
                {msg.sender === "user" ? <User className="h-4.5 w-4.5" /> : <Brain className="h-4.5 w-4.5 text-primary" />}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed text-left border shadow-xs ${
                  msg.sender === "user"
                    ? "bg-primary text-white border-transparent rounded-tr-none"
                    : "bg-card text-foreground border-border rounded-tl-none"
                }`}>
                  {msg.text}
                  {msg.component}
                </div>
                <span className={`text-[9px] text-muted-foreground/85 px-1 mt-0.5 ${msg.sender === "user" ? "text-right" : ""}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typewriter loader bubble */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-xl bg-card border border-border text-primary flex items-center justify-center shrink-0">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <div className="bg-card text-foreground border border-border rounded-2xl rounded-tl-none p-4 text-xs shadow-xs flex items-center gap-1">
                <span>Clinical Assistant is typing</span>
                <span className="flex gap-0.5 items-center pl-1 h-3 mt-1.5">
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce delay-350" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Panel area with Prompt Suggestions overlay */}
        <div className="p-4 border-t border-border bg-card shrink-0 flex flex-col gap-4">
          
          {/* Suggestion prompt list */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {SUGGESTION_PROMPTS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.text}
                    onClick={() => handleSendMessage(s.text)}
                    className="p-3 border border-border rounded-xl hover:border-primary text-left flex items-start gap-2.5 transition-all bg-muted/15 cursor-pointer"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${s.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col justify-center gap-0.5">
                      <span className="font-bold text-foreground/90">{s.text}</span>
                      <span className="text-[10px] text-muted-foreground">Instant query response</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Message form text bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about inventory, forecasts, or billing..."
              className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-primary focus:bg-card focus:outline-hidden transition-all duration-200"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <Button type="submit" size="icon" className="rounded-xl shrink-0">
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>

        </div>

      </div>

    </div>
  );
}
