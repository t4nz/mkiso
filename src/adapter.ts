export interface Adapter {
  args: string[];
  command: string;
  label(name: string): void;
  publisher(name: string): void;
  verbose(): void;
  output(target: string): void;
}

export type AdapterInstance = () => Adapter;
