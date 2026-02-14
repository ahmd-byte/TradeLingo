import type { TradeDiagnostic } from "../../types/api";

/**
 * Renders a structured TradeDiagnostic response from the backend.
 * Maps diagnostic JSON into readable UI sections without modifying
 * the existing design language.
 */
export default function TradeDiagnosticView({ data }: { data: TradeDiagnostic }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Trade Summary ─────────────────────────── */}
      {data.trade_summary && (
        <Section title="Trade Summary">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black leading-relaxed">
            {data.trade_summary}
          </p>
          {data.trade_metrics && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MetricPill label="Symbol" value={data.trade_metrics.symbol} />
              <MetricPill label="Direction" value={data.trade_metrics.direction} />
              <MetricPill
                label="PnL"
                value={`${data.trade_metrics.percentage_pnl >= 0 ? "+" : ""}${data.trade_metrics.percentage_pnl.toFixed(2)}%`}
              />
              <MetricPill label="Duration" value={data.trade_metrics.holding_duration_str} />
            </div>
          )}
        </Section>
      )}

      {/* ── Technical Analysis ────────────────────── */}
      {data.technical_analysis && (
        <Section title="Technical Analysis">
          <DetailRow label="Entry Quality" value={data.technical_analysis.entry_quality} />
          <DetailRow label="Exit Quality" value={data.technical_analysis.exit_quality} />
          <DetailRow label="Risk Management" value={data.technical_analysis.risk_management} />
        </Section>
      )}

      {/* ── Behavioral Analysis ───────────────────── */}
      {data.behavioral_analysis && (
        <Section title="Behavioral Analysis">
          <DetailRow label="Bias Detected" value={data.behavioral_analysis.bias_detected} />
          <DetailRow label="Emotional Pattern" value={data.behavioral_analysis.emotional_pattern} />
        </Section>
      )}

      {/* ── Core Mistake ─────────────────────────── */}
      {data.core_mistake && (
        <Section title="Core Mistake">
          <p className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black leading-relaxed">
            {data.core_mistake}
          </p>
        </Section>
      )}

      {/* ── Improvement Framework ─────────────────── */}
      {data.improvement_framework.length > 0 && (
        <Section title="Improvement Framework">
          <ul className="list-none space-y-2">
            {data.improvement_framework.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-[#22c55e] mt-0.5 flex-shrink-0">
                  {idx + 1}.
                </span>
                <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Linked Knowledge Gap / Recommended Lesson ─── */}
      {(data.linked_knowledge_gap || data.recommended_lesson_topic) && (
        <Section title="Next Steps">
          {data.linked_knowledge_gap && (
            <DetailRow label="Knowledge Gap" value={data.linked_knowledge_gap} />
          )}
          {data.recommended_lesson_topic && (
            <DetailRow label="Recommended Lesson" value={data.recommended_lesson_topic} />
          )}
        </Section>
      )}
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/90 border-[3px] border-black rounded-[16px] p-4 shadow-[3px_3px_0px_#000000]">
      <h4 className="font-['Arimo:Bold',sans-serif] font-bold text-[12px] text-black/50 uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 mb-2 last:mb-0">
      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[11px] text-black/40 uppercase">
        {label}
      </span>
      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f3ff00]/30 border-[2px] border-black rounded-[10px] px-3 py-2 text-center">
      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[10px] text-black/50 uppercase block">
        {label}
      </span>
      <span className="font-['Arimo:Bold',sans-serif] font-bold text-[14px] text-black">
        {value}
      </span>
    </div>
  );
}
