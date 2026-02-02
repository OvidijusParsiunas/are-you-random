import './ScoreDisplay.css';

interface ScoreDisplayProps {
  humanScore: number;
  machineScore: number;
}

function getBackgroundStyle(humanScore: number, machineScore: number) {
  const total = humanScore + machineScore;
  if (total === 0) {
    return { background: 'rgba(148, 163, 184, 0.15)' }; // Light neutral gray
  }

  const humanRatio = humanScore / total;
  const intensity = Math.abs(humanRatio - 0.5) * 2; // 0 to 1, based on how lopsided

  if (humanScore > machineScore) {
    // Human winning - softer green tones
    const alpha = 0.1 + intensity * 0.2; // 0.1 to 0.3
    return { background: `rgba(134, 239, 172, ${alpha})` };
  } else if (machineScore > humanScore) {
    // Machine winning - softer red tones
    const alpha = 0.1 + intensity * 0.2;
    return { background: `rgba(252, 165, 165, ${alpha})` };
  } else {
    // Tie - light neutral
    return { background: 'rgba(148, 163, 184, 0.15)' };
  }
}

export function ScoreDisplay({ humanScore, machineScore }: ScoreDisplayProps) {
  const total = humanScore + machineScore;
  const humanPercent = total > 0 ? Math.round((humanScore / total) * 100) : 50;
  const machinePercent = total > 0 ? Math.round((machineScore / total) * 100) : 50;

  const backgroundStyle = getBackgroundStyle(humanScore, machineScore);

  return (
    <div className="score-display" style={backgroundStyle}>
      <div className="score-side human">
        <span className="score-label">You</span>
        <span className="score-value">{humanScore}</span>
        <span className="score-percent">{humanPercent}%</span>
      </div>
      <div className="score-divider">vs</div>
      <div className="score-side machine">
        <span className="score-label">Machine</span>
        <span className="score-value">{machineScore}</span>
        <span className="score-percent">{machinePercent}%</span>
      </div>
    </div>
  );
}
