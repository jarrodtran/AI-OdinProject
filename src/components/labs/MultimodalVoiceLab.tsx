'use client';

import React, { useMemo, useState } from 'react';
import { Mic, Eye } from 'lucide-react';
/* ========================================================================== */
/* 7. Multimodal Vision & Realtime Voice Latency Simulator                    */
/* ========================================================================== */

type VoiceArchMode = 'cascaded' | 'native-s2s';
type VisionMode = 'none' | 'low-res' | 'high-res' | 'pdf-ocr-hybrid';

export function MultimodalVoiceLab() {
  const [voiceArch, setVoiceArch] = useState<VoiceArchMode>('cascaded');
  const [vadThresholdMs, setVadThresholdMs] = useState(450);
  const [bargeInEnabled, setBargeInEnabled] = useState(true);
  const [visionMode, setVisionMode] = useState<VisionMode>('high-res');
  const [turnsPerSession, setTurnsPerSession] = useState(12);

  const metrics = useMemo(() => {
    const vadWait = vadThresholdMs;
    const sttMs = voiceArch === 'cascaded' ? 165 : 0;
    const visionTokens =
      visionMode === 'none'
        ? 0
        : visionMode === 'low-res'
        ? 85
        : visionMode === 'high-res'
        ? 1290
        : 520;
    const prefillPenalty = Math.round(visionTokens * 0.08);
    const llmTtftMs = (voiceArch === 'cascaded' ? 320 : 190) + prefillPenalty;
    const ttsFirstAudioMs = voiceArch === 'cascaded' ? 190 : 85;

    const totalTurnLatencyMs = vadWait + sttMs + llmTtftMs + ttsFirstAudioMs;

    const naturalness =
      totalTurnLatencyMs <= 550
        ? { label: 'Sub-550ms Human-Like', cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' }
        : totalTurnLatencyMs <= 1050
        ? { label: 'Noticeable Pause', cls: 'border-amber-200 bg-amber-50 text-amber-900' }
        : { label: 'Awkward Walkie-Talkie Lag', cls: 'border-rose-200 bg-rose-50 text-rose-800' };

    // Approximate per-session COGS across turns
    const audioCostPerMin = voiceArch === 'native-s2s' ? 0.16 : 0.032;
    const estSessionMinutes = (turnsPerSession * 24) / 60;
    const voiceSessionCost = estSessionMinutes * audioCostPerMin;

    const visionSessionTokens =
      visionMode === 'pdf-ocr-hybrid'
        ? visionTokens // parsed once and cached
        : visionTokens * Math.ceil(turnsPerSession * 0.35);
    const visionCost = (visionSessionTokens / 1_000_000) * 2.5;
    const totalSessionCogs = voiceSessionCost + visionCost;

    const falseCutRisk =
      vadThresholdMs < 350 ? 'High risk of cutting off mid-thought pauses ("um...")' : 'Balanced turn-taking';

    const recommendation =
      voiceArch === 'cascaded' && totalTurnLatencyMs > 1050
        ? 'Trim VAD endpointing toward 350–450ms semantic detection or move to Native Realtime S2S for rapid conversational back-and-forth.'
        : visionMode === 'high-res' && turnsPerSession >= 10
        ? 'Tip: Extract text PDFs once via OCR/Document AI instead of re-sending High-Res PNG tiles across turns.'
        : !bargeInEnabled
        ? 'Enable instant barge-in cancellation so callers can interrupt long AI explanations naturally.'
        : 'Strong multimodal balance across latency, naturalness, and per-session unit cost.';

    return {
      vadWait,
      sttMs,
      llmTtftMs,
      ttsFirstAudioMs,
      totalTurnLatencyMs,
      naturalness,
      visionTokens,
      visionSessionTokens,
      totalSessionCogs,
      falseCutRisk,
      recommendation,
      estSessionMinutes,
    };
  }, [voiceArch, vadThresholdMs, bargeInEnabled, visionMode, turnsPerSession]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-700 uppercase">
          <Mic className="h-4 w-4" /> Lab 7 · Multimodal Vision &amp; Realtime Voice
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Multimodal Vision &amp; Realtime Voice Latency Simulator
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Compare Cascaded STT→LLM→TTS vs. Native Speech-to-Speech turn latency, VAD silence windows,
          and vision/document tokenization economics.
        </p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-6">
          <div>
            <div className="text-xs font-semibold text-slate-700">Voice Pipeline Architecture</div>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                {
                  id: 'cascaded' as const,
                  title: 'Cascaded (STT → LLM → TTS)',
                  sub: '~$0.032/min · Strong tool determinism',
                },
                {
                  id: 'native-s2s' as const,
                  title: 'Native Speech-to-Speech',
                  sub: '~$0.16/min · Sub-500ms native prosody',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVoiceArch(opt.id)}
                  className={`rounded-xl border p-3 text-left text-xs transition ${
                    voiceArch === opt.id
                      ? 'border-amber-600 bg-amber-50 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{opt.title}</div>
                  <div className="mt-0.5 text-[11px] opacity-80">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">VAD Turn-Detection Silence Threshold</span>
              <span className="font-mono font-bold text-slate-900">{vadThresholdMs} ms</span>
            </div>
            <input aria-label="VAD Turn-Detection Silence Threshold"
              type="range"
              min={200}
              max={1000}
              step={50}
              value={vadThresholdMs}
              onChange={(e) => setVadThresholdMs(Number(e.target.value))}
              className="mt-1.5 w-full accent-amber-600"
            />
            <div className="mt-1 text-[11px] text-slate-500">{metrics.falseCutRisk}</div>
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Conversation Turns / Session</span>
              <span className="font-mono font-bold text-slate-900">
                {turnsPerSession} turns (~{metrics.estSessionMinutes.toFixed(1)} min)
              </span>
            </div>
            <input aria-label="Conversation Turns / Session"
              type="range"
              min={4}
              max={30}
              step={2}
              value={turnsPerSession}
              onChange={(e) => setTurnsPerSession(Number(e.target.value))}
              className="mt-1.5 w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Eye className="h-3.5 w-3.5 text-indigo-600" /> Vision / Document Input Mode
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: 'none' as const, label: 'Voice Only (0 tok)' },
                { id: 'low-res' as const, label: 'Low-Res 512px (85 tok)' },
                { id: 'high-res' as const, label: 'High-Res Tiles (1,290 tok)' },
                { id: 'pdf-ocr-hybrid' as const, label: 'OCR + Selective Vision (520)' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVisionMode(v.id)}
                  className={`rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition ${
                    visionMode === v.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800">
            <input
              type="checkbox"
              checked={bargeInEnabled}
              onChange={(e) => setBargeInEnabled(e.target.checked)}
              className="h-4 w-4 accent-amber-600"
            />
            Enable Instant Barge-In Interruption &amp; Playback Buffer Flush
          </label>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-6">
          <div className="space-y-3">
            <div className={`rounded-xl border p-3.5 ${metrics.naturalness.cls}`}>
              <div className="text-xs font-semibold uppercase">Turn-to-Turn Voice Latency</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono text-3xl font-extrabold">
                  {metrics.totalTurnLatencyMs} ms
                </span>
                <span className="text-xs font-bold">{metrics.naturalness.label}</span>
              </div>
            </div>

            {/* Latency Pipeline Breakdown Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Latency Budget Breakdown</span>
                <span className="font-mono text-[11px] text-slate-500">Target &lt; 550–800ms</span>
              </div>
              <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${(metrics.vadWait / metrics.totalTurnLatencyMs) * 100}%` }}
                  title={`VAD: ${metrics.vadWait}ms`}
                />
                {metrics.sttMs > 0 && (
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${(metrics.sttMs / metrics.totalTurnLatencyMs) * 100}%` }}
                    title={`STT: ${metrics.sttMs}ms`}
                  />
                )}
                <div
                  className="bg-indigo-600 transition-all"
                  style={{ width: `${(metrics.llmTtftMs / metrics.totalTurnLatencyMs) * 100}%` }}
                  title={`Model TTFT: ${metrics.llmTtftMs}ms`}
                />
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(metrics.ttsFirstAudioMs / metrics.totalTurnLatencyMs) * 100}%` }}
                  title={`TTS / Audio Out: ${metrics.ttsFirstAudioMs}ms`}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-medium text-slate-600">
                <span>VAD: {metrics.vadWait}ms</span>
                {metrics.sttMs > 0 && <span>STT: {metrics.sttMs}ms</span>}
                <span>Model: {metrics.llmTtftMs}ms</span>
                <span>Audio Out: {metrics.ttsFirstAudioMs}ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-medium text-slate-500">Vision Tokens / Session</div>
                <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                  {metrics.visionSessionTokens.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-medium text-slate-500">Est. Session COGS</div>
                <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                  ${metrics.totalSessionCogs.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700">
            <div className="font-bold text-slate-900">PM Architecture Verdict</div>
            <p className="mt-1 leading-relaxed">{metrics.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
