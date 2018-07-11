// Type definitions for mkiso.Adapter
// Project: mkiso
// Definitions by: Gaetano Fiorello <gfiorello@gmail.com>

declare namespace mkiso {
  export interface Adapter {
    args: string[];
    command: string;
    label(name: string): void;
    publisher(name: string): void;
    verbose(): void;
    output(target: string): void;
  }

  export type AdapterInstance = () => Adapter;
}

export = mkiso;
