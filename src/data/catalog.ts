import { LESSON_INDEX } from "./lessonIndex.generated";

export type PathSlug = 'foundations' | 'ai-product-strategy' | 'technical-ai-pm';

export type LabId =
  | 'token-economics'
  | 'prompt-sandbox'
  | 'eval-studio'
  | 'rag-debugger'
  | 'agent-reliability'
  | 'prd-studio'
  | 'multimodal-voice'
  | 'incident-triage'
  | 'pricing-packaging'
  | 'model-router';

export type SkillCategory =
  | 'LLM Architecture & Economics'
  | 'AI Discovery & UX'
  | 'Prompt & Spec Engineering'
  | 'Evals & Quality Gates'
  | 'RAG & Context Engineering'
  | 'Agents & Safety'
  | 'AI Strategy & Monetization';

export interface LessonCallout {
  tone: 'odin' | 'warning' | 'tip' | 'mental-model';
  title: string;
  body: string;
}

export interface LessonSection {
  id: string;
  heading: string;
  paragraphs: string[];
  callout?: LessonCallout;
  codeExample?: {
    label: string;
    language: string;
    code: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  bulletPoints?: {
    title: string;
    description: string;
  }[];
}

export interface LessonAssignment {
  title: string;
  scenario: string;
  steps: string[];
  deliverable: string;
  exemplarSolution: string;
}

export interface ReflectionQuestion {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ResourceLink {
  title: string;
  source: string;
  url: string;
  kind: 'Paper' | 'Guide' | 'Engineering Blog' | 'Spec' | 'Benchmark';
  description: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  description: string;
}

export interface RubricCriterion {
  id: string;
  criterion: string;
  bar: string;
}

export interface ProjectBrief {
  scenario: string;
  role: string;
  constraints: string[];
  starterMarkdown: string;
  exemplarArtifact?: string;
}

export interface LessonItem {
  slug: string;
  title: string;
  pathSlug: PathSlug;
  courseId: string;
  type: 'lesson' | 'project';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  skills: SkillCategory[];
  learningOutcomes: string[];
  keyTakeaways?: string[];
  realWorldCaseStudy?: {
    company: string;
    productSurface: string;
    architectureHighlight: string;
    pmTakeaway: string;
  };
  sections: LessonSection[];
  interactiveLabId?: LabId;
  assignment?: LessonAssignment;
  reflectionQuestions?: ReflectionQuestion[];
  projectBrief?: ProjectBrief;
  projectDeliverables?: ProjectDeliverable[];
  rubricCriteria?: RubricCriterion[];
  quiz: QuizQuestion[];
  resources: ResourceLink[];
}

export interface Course {
  id: string;
  pathSlug: PathSlug;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  lessonSlugs: string[];
}

export interface LearningPath {
  slug: PathSlug;
  title: string;
  shortTitle: string;
  badge: string;
  tagline: string;
  description: string;
  estimatedHours: string;
  targetRole: string;
  prerequisites: string;
  accentColor: 'amber' | 'teal' | 'indigo';
  outcomes: string[];
  courseIds: string[];
}

export interface LabMeta {
  id: LabId;
  title: string;
  shortTitle: string;
  description: string;
  skills: SkillCategory[];
  relatedLessonSlug: string;
  badge: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  'LLM Architecture & Economics',
  'AI Discovery & UX',
  'Prompt & Spec Engineering',
  'Evals & Quality Gates',
  'RAG & Context Engineering',
  'Agents & Safety',
  'AI Strategy & Monetization',
];

export const LAB_CATALOG: LabMeta[] = [
  {
    id: 'token-economics',
    title: 'Token Economics & Latency Budget Simulator',
    shortTitle: 'Token Economics',
    description:
      'Model input/output token asymmetry, prompt caching hit rates, multi-tier model routing, TTFT/TPOT latency budgets, and SaaS gross margins across seat tiers.',
    skills: ['LLM Architecture & Economics', 'AI Strategy & Monetization'],
    relatedLessonSlug: 'foundations-context-economics',
    badge: 'Unit Economics',
  },
  {
    id: 'prompt-sandbox',
    title: 'System Prompt as Product Spec Sandbox',
    shortTitle: 'Prompt Spec Sandbox',
    description:
      'Assemble production-grade system prompts with role framing, XML-delimited context, constitutional constraints, JSON output schemas, and refusal edge-case testing.',
    skills: ['Prompt & Spec Engineering', 'Agents & Safety'],
    relatedLessonSlug: 'foundations-system-prompts-as-specs',
    badge: 'Specification',
  },
  {
    id: 'eval-studio',
    title: 'Evals-Driven Development (EDD) Studio',
    shortTitle: 'Eval Studio',
    description:
      'Compare candidate model/prompt builds against a golden dataset using deterministic assertions and LLM-as-a-Judge calibration (TPR/TNR) before making a ship/no-ship call.',
    skills: ['Evals & Quality Gates'],
    relatedLessonSlug: 'tech-evals-driven-development',
    badge: 'Quality Gate',
  },
  {
    id: 'rag-debugger',
    title: 'RAG Pipeline & Failure Mode Debugger',
    shortTitle: 'RAG Debugger',
    description:
      'Tune chunk sizes, overlap, hybrid BM25 + dense vector weights, and cross-encoder reranking to diagnose whether an answer failed in retrieval (Recall@K) or generation (Faithfulness).',
    skills: ['RAG & Context Engineering'],
    relatedLessonSlug: 'tech-rag-architecture',
    badge: 'Retrieval',
  },
  {
    id: 'agent-reliability',
    title: 'Agent Reliability & Compounding Error Calculator',
    shortTitle: 'Agent Reliability',
    description:
      'Simulate multi-step agent success rates under compounding step errors, verification checkpoints, retry budgets, and Human-in-the-Loop (HITL) escalation thresholds.',
    skills: ['Agents & Safety', 'Evals & Quality Gates'],
    relatedLessonSlug: 'tech-agents-tool-calling',
    badge: 'Agentic Systems',
  },
  {
    id: 'prd-studio',
    title: 'AI-Native PRD & Guardrail Builder',
    shortTitle: 'AI PRD Studio',
    description:
      'Generate a structured AI Product Requirements Document complete with suitability classification, non-deterministic UX fallbacks, golden eval gates, and cost circuit breakers.',
    skills: ['Prompt & Spec Engineering', 'AI Discovery & UX', 'Evals & Quality Gates'],
    relatedLessonSlug: 'project-ai-prd-teardown',
    badge: 'PRD Blueprint',
  },
  {
    id: 'multimodal-voice',
    title: 'Multimodal Vision & Realtime Voice Latency Simulator',
    shortTitle: 'Multimodal & Voice',
    description:
      'Model turn-to-turn voice latency (VAD endpointing + STT/LLM/TTS vs. native Speech-to-Speech), barge-in handling, and vision image/PDF tokenization costs.',
    skills: ['AI Discovery & UX', 'LLM Architecture & Economics'],
    relatedLessonSlug: 'foundations-multimodal-voice-vision',
    badge: 'Multimodal & Voice',
  },
  {
    id: 'incident-triage',
    title: 'Production AI Incident & Interview War-Room Simulator',
    shortTitle: 'Incident War-Room',
    description:
      'Practice Staff-level AI PM diagnosis under pressure: contain live regressions across model snapshot drift, semantic cache leaks, RAG sync bugs, and runaway loops.',
    skills: ['Evals & Quality Gates', 'Agents & Safety', 'AI Strategy & Monetization'],
    relatedLessonSlug: 'strategy-cracking-ai-pm-interviews',
    badge: 'Staff War-Room',
  },
  {
    id: 'model-router',
    title: 'Cascade Model Router & Reasoning Compute Simulator',
    shortTitle: 'Model Router',
    description:
      'Model System-1 fast models vs. System-2 test-time reasoning budgets (`reasoning_effort`), cascade routing mixes, TTFT penalties, and blended cost/accuracy curves.',
    skills: ['LLM Architecture & Economics', 'Evals & Quality Gates'],
    relatedLessonSlug: 'foundations-reasoning-models-test-time-compute',
    badge: 'Routing & Compute',
  },
  {
    id: 'pricing-packaging',
    title: 'AI SaaS Pricing, Credit Metering & Margin Stress-Tester',
    shortTitle: 'Pricing & Margins',
    description:
      'Stress-test flat unlimited seats vs. hybrid credit pools, usage metering, and outcome pricing against power-user whale multipliers to protect 75%+ gross margins.',
    skills: ['AI Strategy & Monetization', 'LLM Architecture & Economics'],
    relatedLessonSlug: 'strategy-ai-pricing-models',
    badge: 'Monetization',
  },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: 'foundations',
    title: 'Foundations of AI Product Management',
    shortTitle: 'Foundations',
    badge: 'Start Here · Core Path',
    tagline: 'Master probabilistic UX, token economics, multimodal voice/vision, prompt specs, and AI sprint execution.',
    description:
      'Just like The Odin Project starts every developer in Foundations before branching, every AI PM needs rock-solid mental models of how foundation models fail, what inference actually costs, how to write prompts as rigorous product specs, how to design multimodal/voice interfaces beyond the chatbox, and how to lead weekly AI error-analysis sprints.',
    estimatedHours: '22–28 hours',
    targetRole: 'PM transitioning into AI · Founding PM · Associate AI PM',
    prerequisites: 'Basic familiarity with product discovery, PRDs, and metrics. No ML degree required.',
    accentColor: 'amber',
    outcomes: [
      'Reason accurately about next-token prediction, temperature, context windows, and probabilistic failure modes',
      'Calculate per-request COGS, prompt caching savings, vision/audio token burn, and TTFT/TPOT latency budgets',
      'Decide cleanly between deterministic rules, classical ML, single-shot LLMs, RAG, and agents',
      'Lead hill-climbing AI execution rituals, multimodal UX reviews, and AI-native PRD release gates',
    ],
    courseIds: [
      'foundations-course-1',
      'foundations-course-2',
      'foundations-course-3',
      'foundations-course-4',
      'foundations-course-5',
    ],
  },
  {
    slug: 'ai-product-strategy',
    title: 'AI Product Strategy, Discovery & Growth Track',
    shortTitle: 'AI Strategy & Growth',
    badge: 'Specialization Track 1',
    tagline: 'Build defensible AI moats, margin-safe pricing, IP/compliance governance, shadow A/B testing, and interview mastery.',
    description:
      'Shipping an impressive demo is easy; building a high-margin, defensible AI business is hard. This track equips Product Leaders and Strategy PMs to avoid thin-wrapper traps, engineer proprietary data flywheels, protect gross margins under heavy AI usage, manage copyright/PII risk, run AI experimentation, and ace Staff AI PM interviews.',
    estimatedHours: '22–28 hours',
    targetRole: 'Senior PM · Group PM · Head of Product · AI Founder',
    prerequisites: 'Completion of Foundations (or equivalent understanding of LLM mechanics and unit economics).',
    accentColor: 'teal',
    outcomes: [
      'Design implicit telemetry loops (accept/edit/reject) that compound into proprietary data moats',
      'Architect hybrid seat, credit, and outcome-based AI pricing that defends 75%+ software gross margins',
      'Lead enterprise trust, IP/licensing, PII redaction, and EU AI Act readiness reviews',
      'Run shadow-mode & canary A/B tests and defend Staff-level AI PM case studies in interviews',
    ],
    courseIds: [
      'strategy-course-1',
      'strategy-course-2',
      'strategy-course-3',
      'strategy-course-4',
      'strategy-course-5',
    ],
  },
  {
    slug: 'technical-ai-pm',
    title: 'Technical AI PM: Evals, RAG & Agents Track',
    shortTitle: 'Technical AI PM',
    badge: 'Specialization Track 2',
    tagline: 'Go deep on Evals-Driven Development, hybrid RAG debugging, computer-use sandboxes, MCP agents, and distillation.',
    description:
      'The highest-leverage AI PMs sit right alongside ML and backend engineers—designing golden eval suites, diagnosing whether hallucinations stem from bad chunking or weak grounding, architecting browser/coding sandboxes and MCP tool contracts, and turning production outages and traces into distilled fast models.',
    estimatedHours: '26–32 hours',
    targetRole: 'Technical AI PM · Platform AI PM · Staff PM',
    prerequisites: 'Completion of Foundations and comfort reading JSON schemas, metrics, and system diagrams.',
    accentColor: 'indigo',
    outcomes: [
      'Replace subjective vibe checks with Evals-Driven Development (code graders + calibrated LLM judges)',
      'Diagnose and fix RAG failures across chunking, BM25/vector hybrid retrieval, and cross-encoder reranking',
      'Architect multi-agent tool-calling and computer-use workflows using MCP, sandboxes, and HITL escalation',
      'Lead production AI incident triage, semantic caching, and teacher-to-student model distillation',
    ],
    courseIds: [
      'tech-course-1',
      'tech-course-2',
      'tech-course-3',
      'tech-course-4',
      'tech-course-5',
    ],
  },
];

export const COURSES: Course[] = [
  // Path 1: Foundations
  {
    id: 'foundations-course-1',
    pathSlug: 'foundations',
    order: 1,
    title: 'How Modern AI Actually Works (Mental Models for PMs)',
    subtitle: 'Course 1 · Foundations',
    description:
      'Replace magic-box thinking with accurate mental models of autoregressive generation, context budgets, latency physics, and token unit economics.',
    lessonSlugs: [
      'foundations-llm-mental-models',
      'foundations-context-economics',
      'project-model-selection-memo',
    ],
  },
  {
    id: 'foundations-course-2',
    pathSlug: 'foundations',
    order: 2,
    title: 'Identifying High-Leverage AI Problems',
    subtitle: 'Course 2 · Foundations',
    description:
      'Learn when NOT to use an LLM, how to map task verifiability vs. error tolerance, and how to discover real AI value through failure taxonomies.',
    lessonSlugs: [
      'foundations-ai-problem-framing',
      'foundations-synthetic-user-research',
    ],
  },
  {
    id: 'foundations-course-3',
    pathSlug: 'foundations',
    order: 3,
    title: 'Prompt Engineering as Product Specification',
    subtitle: 'Course 3 · Foundations',
    description:
      'Treat system prompts, schemas, and constitutional guardrails as testable product specifications—and write your first complete AI-native PRD.',
    lessonSlugs: [
      'foundations-system-prompts-as-specs',
      'project-ai-prd-teardown',
    ],
  },
  {
    id: 'foundations-course-4',
    pathSlug: 'foundations',
    order: 4,
    title: 'Designing AI-Native & Multimodal UX',
    subtitle: 'Course 4 · Foundations',
    description:
      'Move past empty chat interfaces to inline copilots, artifact canvases, vision/document parsers, and sub-500ms realtime voice interactions.',
    lessonSlugs: [
      'foundations-ai-ux-patterns',
      'foundations-multimodal-voice-vision',
    ],
  },
  {
    id: 'foundations-course-5',
    pathSlug: 'foundations',
    order: 5,
    title: 'Running AI Product Execution & Cross-Functional Rituals',
    subtitle: 'Course 5 · Foundations',
    description:
      'Master the weekly AI operating cadence: hill-climbing roadmaps, reasoning-model compute routing, cross-functional error analysis with ML engineers, and non-deterministic bug triage.',
    lessonSlugs: [
      'foundations-ai-execution-rituals',
      'foundations-reasoning-models-test-time-compute',
      'project-ai-sprint-error-analysis',
    ],
  },

  // Path 2: AI Product Strategy
  {
    id: 'strategy-course-1',
    pathSlug: 'ai-product-strategy',
    order: 1,
    title: 'AI Moats, Defensibility & Data Flywheels',
    subtitle: 'Course 1 · AI Strategy',
    description:
      'Understand why foundation model capabilities commoditize quickly, dissect category-defining AI product wedges, and architect compounding workflow context graphs.',
    lessonSlugs: [
      'strategy-data-flywheels',
      'strategy-build-vs-buy-fine-tune',
      'strategy-ai-product-teardowns',
    ],
  },
  {
    id: 'strategy-course-2',
    pathSlug: 'ai-product-strategy',
    order: 2,
    title: 'AI Monetization, Pricing & Unit Economics',
    subtitle: 'Course 2 · AI Strategy',
    description:
      'Prevent AI adoption from cannibalizing SaaS gross margins by choosing the right blend of seats, usage credits, and outcome pricing.',
    lessonSlugs: [
      'strategy-ai-pricing-models',
      'project-ai-pricing-strategy',
    ],
  },
  {
    id: 'strategy-course-3',
    pathSlug: 'ai-product-strategy',
    order: 3,
    title: 'Trust, Safety, IP & Enterprise Governance',
    subtitle: 'Course 3 · AI Strategy',
    description:
      'Unblock enterprise deals by designing defenses against prompt injection, zero-data-retention pipelines, IP/copyright licensing, and PII redaction.',
    lessonSlugs: [
      'strategy-safety-governance',
      'strategy-ai-ip-copyright-privacy',
    ],
  },
  {
    id: 'strategy-course-4',
    pathSlug: 'ai-product-strategy',
    order: 4,
    title: 'Go-To-Market, Onboarding & AI Experimentation',
    subtitle: 'Course 4 · AI Strategy',
    description:
      'Solve the blank-prompt-box problem, accelerate Time-to-First-Magic, and ship shadow-mode, canary, and paired-eval launch plans.',
    lessonSlugs: [
      'strategy-ai-gtm-onboarding',
      'strategy-ai-experimentation-metrics',
      'project-ai-gtm-launch-playbook',
    ],
  },
  {
    id: 'strategy-course-5',
    pathSlug: 'ai-product-strategy',
    order: 5,
    title: 'Executive AI Strategy & Career Mastery',
    subtitle: 'Course 5 · AI Strategy',
    description:
      'Ship a board-ready 0-to-1 AI product strategy memo and prepare to crush L5/L6/Staff AI PM system design, metrics, and case interviews.',
    lessonSlugs: [
      'project-strategy-capstone',
      'strategy-cracking-ai-pm-interviews',
    ],
  },

  // Path 3: Technical AI PM
  {
    id: 'tech-course-1',
    pathSlug: 'technical-ai-pm',
    order: 1,
    title: 'Evals-Driven Development (EDD)',
    subtitle: 'Course 1 · Technical AI PM',
    description:
      'Build the foundational engineering discipline of AI products: golden datasets, deterministic assertions, calibrated LLM judges, and CI release gates.',
    lessonSlugs: [
      'tech-evals-driven-development',
      'project-eval-suite-design',
    ],
  },
  {
    id: 'tech-course-2',
    pathSlug: 'technical-ai-pm',
    order: 2,
    title: 'Retrieval-Augmented Generation (RAG) & Context Engineering',
    subtitle: 'Course 2 · Technical AI PM',
    description:
      'Master document chunking, hybrid BM25 + dense search, cross-encoder reranking, context rot prevention, persistent memory, and RAG failure diagnostics.',
    lessonSlugs: [
      'tech-rag-architecture',
      'tech-memory-context-engineering',
      'project-rag-diagnostic-recovery',
    ],
  },
  {
    id: 'tech-course-3',
    pathSlug: 'technical-ai-pm',
    order: 3,
    title: 'Multi-Agent Systems, Tool Use, Sandboxes & MCP',
    subtitle: 'Course 3 · Technical AI PM',
    description:
      'Architect reliable tool-calling workflows, coding/browser computer-use sandboxes, and async Generative UI using MCP while taming compounding errors.',
    lessonSlugs: [
      'tech-agents-tool-calling',
      'tech-computer-use-async-agents',
      'project-agentic-architecture-spec',
    ],
  },
  {
    id: 'tech-course-4',
    pathSlug: 'technical-ai-pm',
    order: 4,
    title: 'Multi-Agent Topologies, Observability & Model Distillation',
    subtitle: 'Course 4 · Technical AI PM',
    description:
      'Turn production spans and user corrections into semantic caches, distilled small models, and bounded supervisor/state-graph agent topologies.',
    lessonSlugs: [
      'tech-observability-finetuning',
      'tech-multi-agent-orchestration-topologies',
    ],
  },
  {
    id: 'tech-course-5',
    pathSlug: 'technical-ai-pm',
    order: 5,
    title: 'AI Security, Red-Teaming & Incident War-Gaming',
    subtitle: 'Course 5 · Technical AI PM',
    description:
      'Defend against indirect prompt injection and markdown exfiltration, engineer parallel guardrails, and lead Staff postmortem recovery drills.',
    lessonSlugs: [
      'tech-enterprise-ai-security-redteaming',
      'project-production-ai-incident-postmortem',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Lightweight lesson index                                                   */
/* -------------------------------------------------------------------------- */
// Client components import this module instead of ./curriculum so the full
// lesson bodies (~350 KB of source) are not shipped to every page. The index is
// generated from ./curriculum by `npm run generate:index` and checked by tests.

export const LESSON_SUMMARY_FIELDS = [
  'slug',
  'title',
  'pathSlug',
  'courseId',
  'type',
  'duration',
  'difficulty',
  'summary',
  'skills',
  'interactiveLabId',
] as const;

export type LessonSummary = Pick<LessonItem, (typeof LESSON_SUMMARY_FIELDS)[number]>;

export function toLessonSummary(lesson: LessonItem): LessonSummary {
  const out: Record<string, unknown> = {};
  for (const key of LESSON_SUMMARY_FIELDS) {
    if (lesson[key] !== undefined) out[key] = lesson[key];
  }
  return out as LessonSummary;
}

/** Lesson summaries in curriculum order. */
export const LESSONS: LessonSummary[] = LESSON_INDEX;

export function getPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getCoursesForPath(pathSlug: PathSlug): Course[] {
  return COURSES.filter((c) => c.pathSlug === pathSlug).sort((a, b) => a.order - b.order);
}

export function getLessonBySlug(slug: string): LessonSummary | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonsForCourse(courseId: string): LessonSummary[] {
  const course = getCourseById(courseId);
  if (!course) return [];
  return course.lessonSlugs
    .map((slug) => getLessonBySlug(slug))
    .filter((item): item is LessonSummary => Boolean(item));
}

export function getLessonsForPath(pathSlug: PathSlug): LessonSummary[] {
  return getCoursesForPath(pathSlug).flatMap((course) => getLessonsForCourse(course.id));
}

export function getAdjacentLessons(lessonSlug: string): {
  prev: LessonSummary | null;
  next: LessonSummary | null;
} {
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) return { prev: null, next: null };
  const ordered = getLessonsForPath(lesson.pathSlug);
  const idx = ordered.findIndex((l) => l.slug === lessonSlug);
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}

export function getNextCrossPathLesson(lessonSlug: string): {
  path: LearningPath;
  lesson: LessonSummary;
} | null {
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) return null;
  const pathIdx = LEARNING_PATHS.findIndex((p) => p.slug === lesson.pathSlug);
  if (pathIdx === -1) return null;
  const nextPath = LEARNING_PATHS[pathIdx + 1];
  if (!nextPath) return null;
  const nextPathLessons = getLessonsForPath(nextPath.slug);
  if (nextPathLessons.length === 0) return null;
  return { path: nextPath, lesson: nextPathLessons[0] };
}

export function getLabById(labId: LabId): LabMeta | undefined {
  return LAB_CATALOG.find((lab) => lab.id === labId);
}

export function getSkillBreakdown(completedSlugs: string[]): {
  skill: SkillCategory;
  completed: number;
  total: number;
  percent: number;
}[] {
  const completedSet = new Set(completedSlugs);
  return SKILL_CATEGORIES.map((skill) => {
    const matching = LESSONS.filter((l) => l.skills.includes(skill));
    const completed = matching.filter((l) => completedSet.has(l.slug)).length;
    const total = matching.length;
    return {
      skill,
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}
