const months = new Map([
  [1, "Jan"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Apr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Aug"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"],
  [12, "Dec"],
]);

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
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 2) {
      return "1 second ago";
    } else if (elapsed < 60) {
      return `${Math.floor(elapsed)} seconds ago`;
    }
    elapsed = elapsed / 60;
    return this.handleNext(elapsed, original);
  }
}

class MinutesHandler extends ElapsedTimeHandler {
  handle(elapsed: number, original: string): string | null {
    if (elapsed < 2) {
      return "1 minute ago";
    } else if (elapsed < 60) {
      return `${Math.floor(elapsed)} minutes ago`;
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

function buildHandler(): ElapsedTimeHandler {
  const root = new SecondsHandler();
  root
    .setNext(new MinutesHandler())
    .setNext(new HoursHandler())
    .setNext(new DaysHandler())
    .setNext(new WeeksHandler())
    .setNext(new BaseCaseHandler());

  return root;
}

export function getElapsedTime(date: string): string {
  const curDate = new Date();
  const deltaSec = (curDate.getTime() - new Date(date).getTime()) * 1e-3;

  return buildHandler().handle(deltaSec, date) ?? "";
}
