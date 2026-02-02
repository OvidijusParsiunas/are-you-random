import { useEffect, useRef } from 'react';
import { Round } from '../hooks/useGame';
import './History.css';

interface HistoryProps {
  rounds: Round[];
}

export function History({ rounds }: HistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [rounds]);

  if (rounds.length === 0) {
    return (
      <div className="history">
        <h3>History</h3>
        <p className="history-empty">Make your first choice to start!</p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-scroll" ref={scrollRef}>
        {rounds.map((round, index) => {
          const roundNumber = index + 1;
          return (
            <div
              key={roundNumber}
              className={`history-card ${round.correct ? 'machine-won' : 'human-won'}`}
            >
              <span className="round-number">#{roundNumber}</span>
              <div className="card-content">
                <span className="user-choice">{round.userChoice}</span>
                <span className="vs">vs</span>
                <span className="prediction">{round.prediction}</span>
              </div>
              <span className="result">
                {round.correct ? 'Machine' : 'You'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
