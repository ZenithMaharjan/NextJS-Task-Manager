export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  { leading }: { leading?: boolean } = {},
) => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let shouldInvoke: boolean = false;

  return (...args: Parameters<T>) => {
    shouldInvoke = true;

    if (!timerId && leading) {
      func(...args);
      shouldInvoke = false;
    }

    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      if (shouldInvoke) {
        func(...args);
      }
      timerId = undefined;
    }, delay);
  };
};
