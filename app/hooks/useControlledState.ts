import { useState, useCallback } from "react";

export interface UseControlledStateOptions<T> {
  value?: T;
  onChange?: (value: T, ...args: unknown[]) => void;
}

export default function useControlledState<T>(
  defaultState: T | (() => T),
  { value, onChange }: UseControlledStateOptions<T> = {},
): [T, (newValue: T) => void] {
  const [localState, setLocalState] = useState<T>(defaultState);
  const isControlled = value !== undefined;

  const state = isControlled ? value : (localState as T);

  const updateState = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setLocalState(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  return [state, updateState];
}
