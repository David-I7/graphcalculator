export interface ElapsedTimeStrategy {
  display(time: number): string;
}

export class SecondsAgo implements ElapsedTimeStrategy {
  display(time: number): string {
    if (time < 2) {
      return "1 second ago";
    } else {
      return `${Math.floor(time)} seconds ago`;
    }
  }
}
export class MinutesAgo implements ElapsedTimeStrategy {
  display(time: number): string {
    if (time < 2) {
      return "1 minute ago";
    } else {
      return `${Math.floor(time)} minutes ago`;
    }
  }
}

export class SecondsRemaning implements ElapsedTimeStrategy {
  display(time: number): string {
    return time >= 10 ? time.toString() : `0${time.toString()}`;
  }
}
export class MinutesRemaning implements ElapsedTimeStrategy {
  display(time: number): string {
    const integer = Math.floor(time);
    const decimalDigits = time - integer;

    const strInt = time >= 10 ? integer.toString() : `0${integer}`;
    const seconds = new SecondsRemaning().display(
      Math.round(decimalDigits * 60)
    );

    return strInt.concat(":", seconds);
  }
}
