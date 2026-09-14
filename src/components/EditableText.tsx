import { useRef, useEffect, KeyboardEvent, ElementType } from "react";
import { useEditMode } from "@/contexts/EditModeContext";

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function EditableText({
  contentKey,
  defaultValue,
  as: Tag = "span",
  className = "",
  multiline = false,
}: EditableTextProps) {
  const { editMode, content, updateField } = useEditMode();
  const ref = useRef<HTMLElement>(null);
  const isFocused = useRef(false);
  const value = content[contentKey] ?? defaultValue;

  useEffect(() => {
    if (ref.current && !isFocused.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value, editMode]);

  if (!editMode) {
    const Comp = Tag as ElementType;
    return <Comp className={className}>{value}</Comp>;
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  const Comp = Tag as ElementType;
  return (
    <Comp
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      dir="ltr"
      className={`${className} outline-none cursor-text ring-2 ring-accent/60 ring-offset-1 rounded-sm px-0.5 focus:ring-accent transition-all`}
      onFocus={() => {
        isFocused.current = true;
      }}
      onInput={() => {
        updateField(contentKey, ref.current?.textContent ?? "");
      }}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        isFocused.current = false;
        updateField(contentKey, ref.current?.textContent ?? "");
      }}
    />
  );
}
