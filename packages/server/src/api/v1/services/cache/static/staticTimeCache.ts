// MUST BE USED ONLY IF YOU WANT THE SAME TIMEOUT INTERVAL BETWEEN TIMEOUTS
// OTHERWISE USE DYNAMIC_TIME_CACHE

export abstract class StaticTimeCache<T> {
  private cache: Record<string, TimeoutNode<T>> = {};
  private timeout: NodeJS.Timeout | null = null;
  private head: TimeoutNode<T> | null = null;
  private tail: TimeoutNode<T> | null = null;

  constructor(private timeoutDurationMS: number = 1000 * 60 * 5) {}

  private getRemaingTimeout(node: TimeoutNode<T>) {
    return node.expiresAt - new Date().getTime();
  }

  private getInitialTimeout() {
    return new Date().getTime() + this.timeoutDurationMS;
  }

  private handleTimeout(node: TimeoutNode<T>) {
    let nextTimeout: TimeoutNode<T> | null = node;

    while (nextTimeout && this.getRemaingTimeout(nextTimeout) <= 0) {
      delete this.cache[nextTimeout.key];
      nextTimeout = nextTimeout.next;
    }

    if (!nextTimeout) {
      this.head = null;
      this.tail = null;
      this.timeout = null;
      return;
    } else if (node === nextTimeout) {
      this.timeout = setTimeout(
        () => this.handleTimeout(nextTimeout),
        this.getRemaingTimeout(nextTimeout)
      );
    } else {
      this.head = nextTimeout;
      this.head.prev = null;
      nextTimeout.next = null;
      this.timeout = setTimeout(
        () => this.handleTimeout(nextTimeout),
        this.getRemaingTimeout(nextTimeout)
      );
    }
  }

  get(key: string): T | undefined {
    return this.cache[key]?.value;
  }

  set(key: string, value: T) {
    if (key in this.cache) {
      this.remove(key);
    }

    const node = new TimeoutNode(
      key,
      value,
      this.getInitialTimeout(),
      null,
      null
    );
    if (this.head === null) {
      this.head = node;
      this.tail = node;
      this.handleTimeout(node);
    } else {
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }

    this.cache[key] = node;
  }

  remove(key: string) {
    const node = this.cache[key];
    delete this.cache[key];

    if (this.head === node && this.tail === node) {
      this.head = null;
      this.tail = null;
      clearTimeout(this.timeout!);
      this.timeout = null;
      return;
    }

    if (node === this.head) {
      this.head = node.next;
      this.head!.prev = null;
    } else if (node == this.tail) {
      this.tail = node.prev;
      this.tail!.next = null;
    } else {
      node.next!.prev = node.prev;
      node.prev!.next = node.next;
    }

    this.handleTimeout(this.head!);
    node.next = null;
    node.prev = null;
  }
}

class TimeoutNode<T> {
  constructor(
    public key: string,
    public value: T,
    public expiresAt: number,
    public prev: TimeoutNode<T> | null,
    public next: TimeoutNode<T> | null
  ) {}
}
