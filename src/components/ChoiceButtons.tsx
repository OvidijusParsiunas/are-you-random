import './ChoiceButtons.css';

interface ChoiceButtonsProps {
  onChoice: (choice: number) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ onChoice, disabled }: ChoiceButtonsProps) {
  return (
    <div className="choice-buttons" style={disabled ? { pointerEvents: 'none' } : undefined}>
      <button
        className="choice-button choice-0"
        onClick={() => onChoice(0)}
      >
        0
      </button>
      <button
        className="choice-button choice-1"
        onClick={() => onChoice(1)}
      >
        1
      </button>
    </div>
  );
}
