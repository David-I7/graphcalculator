import { months } from "./date";
import {
  ElapsedTimeStrategy,
  MinutesAgo,
  MinutesRemaning,
  SecondsAgo,
  SecondsRemaning,
} from "./elapsedTimeStrategy";

abstract class ElapsedTimeHandler {
  private next!: ElapsedTimeHandler;

  setNext(handler: ElapsedTimeHandler) {
    this.next = handler;
    return this.next;
  }

  handleNext(elapsed: number, original: string): string | null {
    if (!this.next) return null;
    return this.next.handle(elapsed, original);
  }

  abstract handle(elapsed: number, original: string): string | null;
}

class SecondsHandler extends ElapsedTimeHandler {
  constructor(private strategy: ElapsedTimeStrategy) {
    super();
  }

  handle(elapsed: number, original: string): string | null {
    if (elapsed < 60) {
      return this.strategy.display(elapsed);
    }
    elapsed = elapsed / 60;
    return this.handleNext(elapsed, original);
  }
}

class MinutesHandler extends ElapsedTimeHandler {
  constructor(private strategy: ElapsedTimeStrategy) {
    super();
  }
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 60) {
      return this.strategy.display(elapsed);
    }
    elapsed = elapsed / 60;
    return this.handleNext(elapsed, original);
  }
}

class HoursHandler extends ElapsedTimeHandler {
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 2) {
      return "1 hour ago";
    } else if (elapsed < 24) {
      return `${Math.floor(elapsed)} hours ago`;
    }
    elapsed = elapsed / 24;
    return this.handleNext(elapsed, original);
  }
}

class DaysHandler extends ElapsedTimeHandler {
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 2) {
      return "1 day ago";
    } else if (elapsed < 7) {
      return `${Math.floor(elapsed)} days ago`;
    }

    elapsed = elapsed / 7;
    return this.handleNext(elapsed, original);
  }
}

class WeeksHandler extends ElapsedTimeHandler {
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 2) {
      return "1 week ago";
    } else if (elapsed < 4) {
      return `${Math.floor(elapsed)} weeks ago`;
    }

    return this.handleNext(elapsed, original);
  }
}

class BaseCaseHandler extends ElapsedTimeHandler {
  handle(elapsed: number, original: string): string | null {
    const parts = original.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!parts) return null;

    const [year, month, day] = parts;
    return `${months.get(Number(month))} ${Number(day)}, ${year}`;
  }
}

export function buildElapsedHandler(): ElapsedTimeHandler {
  const root = new SecondsHandler(new SecondsAgo());
  root
    .setNext(new MinutesHandler(new MinutesAgo()))
    .setNext(new HoursHandler())
    .setNext(new DaysHandler())
    .setNext(new WeeksHandler())
    .setNext(new BaseCaseHandler());

  return root;
}

export function buildRemaingHandler(): ElapsedTimeHandler {
  return new MinutesHandler(new MinutesRemaning());
}
