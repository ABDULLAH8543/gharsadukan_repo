type BreakingNewsProps = {
  items: string[];
};

export function BreakingNews({ items }: BreakingNewsProps) {
  const tickerText = items.join("  |  ");

  return (
    <section className="breaking-wrap border-y border-[var(--line)] bg-[var(--paper-strong)] px-4 py-2 sm:px-8" style={{padding: "10px 0px"}}>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="kicker rounded-sm bg-[var(--accent)] px-2 py-1 text-[var(--paper)]" style={{padding: "5px 10px", color: "white"}}>
          Breaking News
        </span>
        <div className="ticker-track" aria-label="Breaking news ticker">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    </section>
  );
}
