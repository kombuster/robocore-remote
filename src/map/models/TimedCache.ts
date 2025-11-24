export class TimedCache<T> {
  private cache: Map<string, { value: T, expires: number }> = new Map();

  constructor(private ttl: number) { }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.value;
    }
    return null;
  }

  set(key: string, value: T) {
    this.cache.set(key, { value, expires: Date.now() + this.ttl });
  }

  count() {
    return this.cache.size;
  }

  clear() {
    this.cache.clear();
  }
}
