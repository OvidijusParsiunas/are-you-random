import './ChoiceButtons.css';

interface ChoiceButtonsProps {
  onChoice: (choice: number) => void;
}

export function ChoiceButtons({ onChoice }: ChoiceButtonsProps) {
  return (
    <div className="choice-buttons">
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
