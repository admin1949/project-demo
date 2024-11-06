type Awaitable<T> = T | Promise<T>;

export const autoRunTask = <A extends unknown[], T>(
  task: (...args: A) => Awaitable<T>,
  timeout = 10_000
) => {
  let timer: number | NodeJS.Timeout = 0;
  let runId = 0;

  const clearAndStart = (...args: A) => {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
    const sid = ++runId;
    const run = async () => {
      if (sid !== runId) {
        return;
      }

      try {
        await task(...args);
      } catch (err) {
        console.log("run auto task error", err);
      }
      timer = setTimeout(() => run(), timeout);
    };

    return run();
  };

  const clearAndNextStart = (...args: A) => {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
    runId += 1;
    timer = setTimeout(() => clearAndStart(...args), timeout);
  };

  const stop = () => {
    runId += 1;
    clearTimeout(timer);
  };

  return {
    clearAndStart,
    clearAndNextStart,
    stop,
  };
};

export const isAllowNumber = (val: unknown): val is number => {
  return typeof val === "number" && !isNaN(val);
};
