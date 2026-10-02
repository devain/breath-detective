import { useEffect, useRef } from 'react';

const fmt = (t) => new Date(t).toLocaleTimeString([], { hour12: false });

export default function CaseLog({ run }) {
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [run.log.length]);
  return (
    <div className="console fade-in">
      <div className="console-head mono">
        <span className="dot r" /> <span className="dot y" /> <span className="dot g" /> case.log — {run.log.length} lines
      </div>
      <div className="console-body mono">
        {run.log.map((l, i) => (
          <div key={i} className={`log-line log-${l.type}`}>
            <span className="log-t">[{fmt(l.t)}]</span> <span className="log-type">{l.type.toUpperCase().padEnd(10)}</span> {l.text}
          </div>
        ))}
        <div className="log-line cursor">
          <span className="log-t">&gt;</span> <span className="blink">▌</span>
        </div>
        <div ref={end} />
      </div>
    </div>
  );
}
