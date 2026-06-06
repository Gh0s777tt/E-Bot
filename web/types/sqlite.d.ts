// Minimalne typy dla wbudowanego node:sqlite (brak ich jeszcze w @types/node 20).
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>);
    prepare(sql: string): {
      all(...params: unknown[]): any[];
      get(...params: unknown[]): any;
      run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    };
    exec(sql: string): void;
    close(): void;
  }
}
