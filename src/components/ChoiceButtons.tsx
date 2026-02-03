import './ChoiceButtons.css';

interface ChoiceButtonsProps {
  onChoice: (choice: number) => void;
  disabled?: boolean;
  optionCount: number;
}

export function ChoiceButtons({ onChoice, disabled, optionCount }: ChoiceButtonsProps) {
  return (
    <div className="choice-buttons" style={disabled ? { pointerEvents: 'none' } : undefined}>
      {Array.from({ length: optionCount }, (_, i) => (
        <button
          key={i}
          className={`choice-button choice-${i}`}
          onClick={() => onChoice(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
