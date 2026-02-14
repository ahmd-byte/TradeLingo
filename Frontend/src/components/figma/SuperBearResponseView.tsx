/**
 * SuperBearResponseView — Renders ALL structured AI responses
 * from the SuperBear backend into clean, readable chat messages.
 *
 * Handles 7 response types:
 *   1. educational          — lesson / research answers
 *   2. trade_diagnostic     — deep trade analysis (with real trade data)
 *   3. trade_explain_conceptual — trade guidance (no trade data)
 *   4. trade_explain_error  — trade analysis fallback
 *   5. curriculum_modify    — curriculum adjustment confirmation
 *   6. wellness             — therapy / emotional support
 *   7. integrated           — combined educational + wellness
 *
 * Keeps the existing bold/cartoonish design language.
 */

import type {
  SuperBearResponse,
  EducationalResponse,
  TradeDiagnosticResponse,
  TradeExplainConceptualResponse,
  TradeExplainErrorResponse,
  CurriculumModifyResponse,
  WellnessResponse,
  IntegratedResponse,
} from '../../types/api';

// ─── Shared Styles ──────────────────────────────────────────────────────────

const font = "font-['Arimo:Bold',sans-serif] font-bold";
const sectionTitle = `${font} text-[12px] text-black/50 uppercase tracking-wider mb-1`;
const bodyText = `${font} text-[14px] text-black leading-relaxed`;
const cardBg = "bg-white/40 rounded-[8px] px-3 py-2 mt-1";

// ─── Shared Components ──────────────────────────────────────────────────────

function SectionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className={sectionTitle}>{label}</p>
      <div className={bodyText}>{children}</div>
    </div>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={cardBg}>
      <p className={`${font} text-[13px] text-black/80 leading-relaxed`}>
        {children}
      </p>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-block bg-black/10 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">
      <span className={`${font} text-[11px] text-black/60`}>{label}</span>
    </span>
  );
}

// ProgressBadge and NextTopic intentionally hidden from users.
// Progress/mastery data is tracked internally but not displayed in chat.

// ─── 1. Educational Response ────────────────────────────────────────────────

function EducationalView({ data }: { data: EducationalResponse }) {
  return (
    <div className="space-y-0">
      {data.learning_concept && (
        <div className="mb-2 pb-2 border-b-[2px] border-black/15">
          <p className={`${font} text-[16px] text-black`}>{data.learning_concept}</p>
        </div>
      )}

      {data.teaching_explanation && <p className={bodyText}>{data.teaching_explanation}</p>}

      {data.teaching_example && (
        <SectionBlock label="Example">
          <InfoCard>{data.teaching_example}</InfoCard>
        </SectionBlock>
      )}

      {data.why_it_matters && (
        <SectionBlock label="Why it matters">{data.why_it_matters}</SectionBlock>
      )}

      {data.actionable_takeaway && (
        <SectionBlock label="Try this">{data.actionable_takeaway}</SectionBlock>
      )}

    </div>
  );
}

// ─── 2. Deep Trade Diagnostic ───────────────────────────────────────────────

function TradeDiagnosticView({ data }: { data: TradeDiagnosticResponse }) {
  const metrics = data.trade_metrics;

  return (
    <div className="space-y-0">
      {/* Header with metrics */}
      {metrics && (
        <div className="mb-2 pb-2 border-b-[2px] border-black/15 flex flex-wrap gap-2">
          <Pill label={metrics.symbol} />
          <Pill label={metrics.direction} />
          <Pill label={`${metrics.percentage_pnl >= 0 ? '+' : ''}${metrics.percentage_pnl}%`} />
          {metrics.holding_duration_str && <Pill label={metrics.holding_duration_str} />}
        </div>
      )}

      {data.trade_summary && <p className={bodyText}>{data.trade_summary}</p>}

      {/* Technical Analysis */}
      {data.technical_analysis && (
        <SectionBlock label="Technical Analysis">
          <div className="space-y-1.5 mt-1">
            {data.technical_analysis.entry_quality && (
              <p className={`${font} text-[13px] text-black/80`}>
                <span className="text-black/50">Entry: </span>{data.technical_analysis.entry_quality}
              </p>
            )}
            {data.technical_analysis.exit_quality && (
              <p className={`${font} text-[13px] text-black/80`}>
                <span className="text-black/50">Exit: </span>{data.technical_analysis.exit_quality}
              </p>
            )}
            {data.technical_analysis.risk_management && (
              <p className={`${font} text-[13px] text-black/80`}>
                <span className="text-black/50">Risk: </span>{data.technical_analysis.risk_management}
              </p>
            )}
          </div>
        </SectionBlock>
      )}

      {/* Behavioral Analysis */}
      {data.behavioral_analysis && (
        <SectionBlock label="Behavioral Analysis">
          <div className="space-y-1.5 mt-1">
            {data.behavioral_analysis.bias_detected && (
              <p className={`${font} text-[13px] text-black/80`}>
                <span className="text-black/50">Bias: </span>{data.behavioral_analysis.bias_detected}
              </p>
            )}
            {data.behavioral_analysis.emotional_pattern && (
              <p className={`${font} text-[13px] text-black/80`}>
                <span className="text-black/50">Pattern: </span>{data.behavioral_analysis.emotional_pattern}
              </p>
            )}
          </div>
        </SectionBlock>
      )}

      {/* Core Mistake */}
      {data.core_mistake && data.core_mistake.toLowerCase() !== 'none' && (
        <SectionBlock label="Core Mistake">
          <InfoCard>{data.core_mistake}</InfoCard>
        </SectionBlock>
      )}

      {/* Improvement Framework */}
      {data.improvement_framework && data.improvement_framework.length > 0 && (
        <SectionBlock label="Improvements">
          <ol className="list-decimal list-inside space-y-1 mt-1">
            {data.improvement_framework.map((item, i) => (
              <li key={i} className={`${font} text-[13px] text-black/80`}>{item}</li>
            ))}
          </ol>
        </SectionBlock>
      )}

    </div>
  );
}

// ─── 3. Conceptual Trade Explanation ────────────────────────────────────────

function TradeExplainConceptualView({ data }: { data: TradeExplainConceptualResponse }) {
  return (
    <div className="space-y-0">
      {data.what_happened && <p className={bodyText}>{data.what_happened}</p>}

      {data.general_analysis && (
        <SectionBlock label="Analysis">{data.general_analysis}</SectionBlock>
      )}

      {data.common_mistakes && (
        <SectionBlock label="Common Mistakes">
          <InfoCard>{data.common_mistakes}</InfoCard>
        </SectionBlock>
      )}

      {data.improvement_suggestion && (
        <SectionBlock label="Suggestion">{data.improvement_suggestion}</SectionBlock>
      )}

    </div>
  );
}

// ─── 4. Trade Explain Error ─────────────────────────────────────────────────

function TradeExplainErrorView({ data }: { data: TradeExplainErrorResponse }) {
  return (
    <div className="space-y-0">
      <p className={bodyText}>{data.error || 'Unable to analyze trade at this time.'}</p>
      {data.fallback_advice && (
        <SectionBlock label="In the meantime">{data.fallback_advice}</SectionBlock>
      )}
    </div>
  );
}

// ─── 5. Curriculum Modify ───────────────────────────────────────────────────

function CurriculumModifyView({ data }: { data: CurriculumModifyResponse }) {
  const mod = data.updated_module;
  return (
    <div className="space-y-0">
      {data.new_focus && <p className={bodyText}>{data.new_focus}</p>}

      {data.adjustment_type && (
        <div className="mt-2">
          <Pill label={data.adjustment_type} />
        </div>
      )}

      {mod && (
        <SectionBlock label="Updated Module">
          <div className={cardBg}>
            {mod.topic && (
              <p className={`${font} text-[14px] text-black`}>{mod.topic}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {mod.difficulty && <Pill label={mod.difficulty} />}
              {mod.explanation_style && <Pill label={mod.explanation_style} />}
              {mod.estimated_duration && <Pill label={mod.estimated_duration} />}
            </div>
          </div>
        </SectionBlock>
      )}

    </div>
  );
}

// ─── 6. Wellness Response ───────────────────────────────────────────────────

function WellnessView({ data }: { data: WellnessResponse }) {
  return (
    <div className="space-y-0">
      {data.validation && <p className={bodyText}>{data.validation}</p>}

      {data.perspective && (
        <SectionBlock label="Perspective">{data.perspective}</SectionBlock>
      )}

      {data.coping_strategy && (
        <SectionBlock label="Coping Strategy">{data.coping_strategy}</SectionBlock>
      )}

      {data.actionable_steps && data.actionable_steps.length > 0 && (
        <SectionBlock label="Steps you can take">
          <ol className="list-decimal list-inside space-y-1 mt-1">
            {data.actionable_steps.map((step, i) => (
              <li key={i} className={`${font} text-[13px] text-black/80`}>{step}</li>
            ))}
          </ol>
        </SectionBlock>
      )}

      {data.educational_focus && (
        <SectionBlock label="Related Learning">{data.educational_focus}</SectionBlock>
      )}

      {data.encouragement && (
        <div className="mt-3 bg-black/10 rounded-[10px] px-3 py-2">
          <p className={`${font} text-[13px] text-black/70 leading-relaxed`}>
            {data.encouragement}
          </p>
        </div>
      )}

    </div>
  );
}

// ─── 7. Integrated Response ─────────────────────────────────────────────────

function IntegratedView({ data }: { data: IntegratedResponse }) {
  return (
    <div className="space-y-4">
      {data.primary_mode === 'therapy' ? (
        <>
          {data.therapy && <WellnessView data={{ ...data.therapy, type: 'wellness' }} />}
          {data.research && (
            <div className="border-t-[2px] border-black/15 pt-3">
              <p className={sectionTitle}>Related Lesson</p>
              <EducationalView data={{ ...data.research, type: 'educational' }} />
            </div>
          )}
        </>
      ) : (
        <>
          {data.research && <EducationalView data={{ ...data.research, type: 'educational' }} />}
          {data.therapy && (
            <div className="border-t-[2px] border-black/15 pt-3">
              <p className={sectionTitle}>Wellness Note</p>
              <WellnessView data={{ ...data.therapy, type: 'wellness' }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

interface Props {
  data: SuperBearResponse;
}

export default function SuperBearResponseView({ data }: Props) {
  const responseType = data.type;

  switch (responseType) {
    case 'educational':
      return <EducationalView data={data as EducationalResponse} />;

    case 'trade_diagnostic':
      return <TradeDiagnosticView data={data as TradeDiagnosticResponse} />;

    case 'trade_explain_conceptual':
      return <TradeExplainConceptualView data={data as TradeExplainConceptualResponse} />;

    case 'trade_explain_error':
      return <TradeExplainErrorView data={data as TradeExplainErrorResponse} />;

    case 'curriculum_modify':
      return <CurriculumModifyView data={data as CurriculumModifyResponse} />;

    case 'wellness':
      return <WellnessView data={data as WellnessResponse} />;

    case 'integrated':
      return <IntegratedView data={data as IntegratedResponse} />;

    default: {
      // Smart fallback: detect shape even if type is unknown
      const d = data as Record<string, unknown>;
      if ('teaching_explanation' in d) {
        return <EducationalView data={data as EducationalResponse} />;
      }
      if ('trade_summary' in d) {
        return <TradeDiagnosticView data={data as TradeDiagnosticResponse} />;
      }
      if ('what_happened' in d) {
        return <TradeExplainConceptualView data={data as TradeExplainConceptualResponse} />;
      }
      if ('validation' in d) {
        return <WellnessView data={data as WellnessResponse} />;
      }
      if ('adjustment_type' in d) {
        return <CurriculumModifyView data={data as CurriculumModifyResponse} />;
      }
      if ('therapy' in d || 'research' in d) {
        return <IntegratedView data={data as IntegratedResponse} />;
      }
      // Absolute last resort: display first meaningful string value
      const fallbackText = Object.values(d).find(
        (v) => typeof v === 'string' && v.length > 10
      ) as string | undefined;
      return (
        <p className={bodyText}>
          {fallbackText || 'SuperBear responded, but the format was unexpected.'}
        </p>
      );
    }
  }
}
