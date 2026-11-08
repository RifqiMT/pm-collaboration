"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from "react";

interface SharedFieldProps {
  value: string;
  onCommit: (value: string) => void | boolean | Promise<void | boolean>;
  ariaLabel: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  className?: string;
  rows?: number;
}

export function SharedField({
  value,
  onCommit,
  ariaLabel,
  placeholder,
  maxLength,
  multiline = false,
  className,
  rows = 3,
}: SharedFieldProps) {
  const [text, setText] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value);
  }, [value]);

  const commit = (next: string) => {
    focused.current = false;
    const cleaned = next.trim();
    if (cleaned === value) {
      setText(value);
      return;
    }
    setText(cleaned);
    const saved = onCommit(cleaned);
    const revert = () => setText(value);
    if (saved === false) {
      revert();
      return;
    }
    if (saved && typeof (saved as Promise<void | boolean>).then === "function") {
      void Promise.resolve(saved).then(
        (ok) => {
          if (ok === false) revert();
        },
        () => revert(),
      );
    }
  };

  const props = {
    value: text,
    placeholder,
    maxLength,
    "aria-label": ariaLabel,
    className,
    onFocus: () => {
      focused.current = true;
    },
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(event.target.value),
    onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => commit(event.target.value),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || multiline || event.shiftKey) return;
      event.preventDefault();
      event.currentTarget.blur();
    },
  };

  if (multiline) return <textarea {...props} rows={rows} />;
  return <input {...props} />;
}
