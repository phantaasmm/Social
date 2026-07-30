import { Plus, Trash2 } from "lucide-react";
import { Button, Input } from "../../../components/ui";

interface PollOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
  disabled?: boolean;
}

export function PollOptionsEditor({
  options,
  onChange,
  disabled,
}: PollOptionsEditorProps) {
  const updateOption = (index: number, value: string) => {
    onChange(
      options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  return (
    <fieldset disabled={disabled}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <legend className="text-small font-semibold text-foreground">
          Poll options
        </legend>
        <span className="text-xs text-muted">{options.length}/6</span>
      </div>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-start gap-2">
            <Input
              aria-label={`Poll option ${index + 1}`}
              placeholder={`Option ${index + 1}`}
              maxLength={120}
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove option ${index + 1}`}
              title="Remove option"
              disabled={disabled || options.length <= 2}
              onClick={() =>
                onChange(
                  options.filter(
                    (_item, optionIndex) => optionIndex !== index,
                  ),
                )
              }
            >
              <Trash2 size={17} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      {options.length < 6 && (
        <Button
          className="mt-3"
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={16} aria-hidden="true" />}
          disabled={disabled}
          onClick={() => onChange([...options, ""])}
        >
          Add option
        </Button>
      )}
      <p className="mt-2 text-xs text-muted">
        Add between 2 and 6 choices. Each person can vote once.
      </p>
    </fieldset>
  );
}
