'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowUpRight } from 'lucide-react';
import { LabId, getLabById } from '@/data/catalog';

// Each simulator is its own chunk, so a lesson only downloads the lab it embeds.
function LabLoading() {
  return (
    <div
      className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/70"
      role="status"
      aria-label="Loading interactive lab"
    />
  );
}

const TokenEconomicsLab = dynamic(() => import('./labs/TokenEconomicsLab').then((m) => m.TokenEconomicsLab), {
  loading: LabLoading,
});
const PromptSandboxLab = dynamic(() => import('./labs/PromptSandboxLab').then((m) => m.PromptSandboxLab), {
  loading: LabLoading,
});
const EvalStudioLab = dynamic(() => import('./labs/EvalStudioLab').then((m) => m.EvalStudioLab), {
  loading: LabLoading,
});
const RagDebuggerLab = dynamic(() => import('./labs/RagDebuggerLab').then((m) => m.RagDebuggerLab), {
  loading: LabLoading,
});
const AgentReliabilityLab = dynamic(() => import('./labs/AgentReliabilityLab').then((m) => m.AgentReliabilityLab), {
  loading: LabLoading,
});
const PrdStudioLab = dynamic(() => import('./labs/PrdStudioLab').then((m) => m.PrdStudioLab), {
  loading: LabLoading,
});
const MultimodalVoiceLab = dynamic(() => import('./labs/MultimodalVoiceLab').then((m) => m.MultimodalVoiceLab), {
  loading: LabLoading,
});
const IncidentTriageLab = dynamic(() => import('./labs/IncidentTriageLab').then((m) => m.IncidentTriageLab), {
  loading: LabLoading,
});
const ModelRouterLab = dynamic(() => import('./labs/ModelRouterLab').then((m) => m.ModelRouterLab), {
  loading: LabLoading,
});
const PricingPackagingLab = dynamic(() => import('./labs/PricingPackagingLab').then((m) => m.PricingPackagingLab), {
  loading: LabLoading,
});

/* ========================================================================== */
/* Unified Lab Switcher / Embedded Renderer                                   */
/* ========================================================================== */

export function InteractiveLab({
  labId,
  showLessonLink = false,
}: {
  labId: LabId;
  showLessonLink?: boolean;
}) {
  const meta = getLabById(labId);

  const renderBody = () => {
    switch (labId) {
      case 'token-economics':
        return <TokenEconomicsLab />;
      case 'prompt-sandbox':
        return <PromptSandboxLab />;
      case 'eval-studio':
        return <EvalStudioLab />;
      case 'rag-debugger':
        return <RagDebuggerLab />;
      case 'agent-reliability':
        return <AgentReliabilityLab />;
      case 'prd-studio':
        return <PrdStudioLab />;
      case 'multimodal-voice':
        return <MultimodalVoiceLab />;
      case 'incident-triage':
        return <IncidentTriageLab />;
      case 'model-router':
        return <ModelRouterLab />;
      case 'pricing-packaging':
        return <PricingPackagingLab />;
    }
  };

  return (
    <div id={labId} className="scroll-mt-24 space-y-2">
      {showLessonLink && meta && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span>Linked Curriculum Lesson:</span>
          <Link
            href={`/lessons/${meta.relatedLessonSlug}`}
            className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
          >
            Read Lesson <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
      {renderBody()}
    </div>
  );
}
