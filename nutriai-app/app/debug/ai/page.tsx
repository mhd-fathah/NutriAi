"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Key, Terminal, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function AIDebugPage() {
  const [config, setConfig] = useState<{
    geminiKeyLoaded: boolean;
    currentGeminiModel: string;
    geminiFallbackModel: string;
    lastRequestStatus: string;
    lastError: string | null;
    lastResponseTime: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/debug/ai");
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
      } else {
        toast.error("Failed to load AI config. Authenticate first.");
      }
    } catch {
      toast.error("Network error reading AI diagnostics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            AI Diagnostics Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Monitor model failover routes, key states, telemetry, and parsing execution errors.
          </p>
        </div>
        <button
          onClick={fetchConfig}
          disabled={loading}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* MODEL CONFIGURATION */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Gemini Setup</h3>
              {config ? (
                config.geminiKeyLoaded ? (
                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Loaded
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Key Missing
                  </span>
                )
              ) : (
                <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-full"></div>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-6 font-medium">
              Target models utilized dynamically within the primary failover pipeline.
            </p>
          </div>
          {config && (
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Primary Model:</span>
                <span className="font-mono bg-gray-50 text-gray-700 px-2 py-1 rounded font-bold">
                  {config.currentGeminiModel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Fallback Model:</span>
                <span className="font-mono bg-gray-50 text-gray-700 px-2 py-1 rounded font-bold">
                  {config.geminiFallbackModel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TELEMETRY METRICS */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">Pipeline Telemetry</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">
              Performance metrics and query tracing parameters caught from the last active execution loop.
            </p>
          </div>
          {config && (
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Last Request Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    config.lastRequestStatus === "Success"
                      ? "bg-emerald-50 text-emerald-700"
                      : config.lastRequestStatus === "Failure"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {config.lastRequestStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Response Latency:</span>
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {config.lastResponseTime}ms
                </span>
              </div>
              {config.lastError && (
                <div className="flex flex-col gap-1 text-[11px] bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-100">
                  <span className="font-bold">Last Error:</span>
                  <span className="break-all">{config.lastError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}