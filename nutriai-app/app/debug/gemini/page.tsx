"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Key, Terminal, RefreshCw, UploadCloud, AlertCircle } from "lucide-react";

export default function GeminiDebugPage() {
  const [config, setConfig] = useState<{
    apiKeyLoaded: boolean;
    primaryModel: string;
    fallbackModel: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rawResult, setRawResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/debug/gemini");
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
      } else {
        toast.error("Failed to load Gemini config. Authenticate first.");
      }
    } catch {
      toast.error("Network error reading config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRawResult(null);
      setErrorDetails(null);
    }
  };

  const runTestRequest = async () => {
    if (!imageFile) {
      toast.error("Please upload an image to test.");
      return;
    }

    setTesting(true);
    setRawResult(null);
    setErrorDetails(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const mimeType = imageFile.type;

        const res = await fetch("/api/debug/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setRawResult(data);
          toast.success("Gemini API test request succeeded!");
        } else {
          setRawResult(data);
          setErrorDetails(data.error || "Analysis failed");
          toast.error("Test Request Failed");
        }
        setTesting(false);
      };
    } catch (err: any) {
      setErrorDetails(err.message || "Failed to process image file");
      toast.error("Processing Exception");
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            Gemini Vision Diagnostics
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Verify API key bindings, testing fallback routes, and parsing output schemas.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* API KEY CARD */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800">API Key Status</h3>
          </div>
          {config ? (
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  config.apiKeyLoaded ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                {config.apiKeyLoaded ? "Active Key Loaded" : "Missing API Key"}
              </span>
            </div>
          ) : (
            <div className="h-6 w-24 bg-gray-100 animate-pulse rounded"></div>
          )}
        </div>

        {/* PRIMARY MODEL CARD */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800">Primary Model</h3>
          </div>
          {config ? (
            <code className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-700 font-mono">
              {config.primaryModel}
            </code>
          ) : (
            <div className="h-6 w-32 bg-gray-100 animate-pulse rounded"></div>
          )}
        </div>

        {/* FALLBACK MODEL CARD */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800">Fallback Model</h3>
          </div>
          {config ? (
            <code className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-700 font-mono">
              {config.fallbackModel}
            </code>
          ) : (
            <div className="h-6 w-32 bg-gray-100 animate-pulse rounded"></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Run Diagnostic Upload Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UPLOAD FORM */}
          <div>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium mb-2">Select a testing food image</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleTestUpload}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            {imageFile && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 truncate max-w-[200px]">Selected: {imageFile.name}</p>
                <button
                  onClick={runTestRequest}
                  disabled={testing}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 transition px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:bg-gray-300"
                >
                  {testing ? "Analyzing..." : "Trigger API Test"}
                </button>
              </div>
            )}
          </div>

          {/* RESPONSE OUTPUT */}
          <div className="bg-gray-900 rounded-2xl p-6 font-mono text-xs text-emerald-400 overflow-auto max-h-[300px]">
            {testing && <p className="animate-pulse text-yellow-400">Executing Gemini model and handling automatic fallback routes...</p>}
            {!testing && !rawResult && !errorDetails && <p className="text-gray-500">API Response output will display here...</p>}
            {errorDetails && (
              <div className="text-red-400 flex flex-col gap-2">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Diagnostic Failure
                </p>
                <p className="bg-red-950 p-2 rounded text-red-300 border border-red-900">{errorDetails}</p>
              </div>
            )}
            {rawResult && (
              <pre className="whitespace-pre-wrap">{JSON.stringify(rawResult, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}