export interface content {
  render: () => Promise<string>;
  run: () => void;
}
