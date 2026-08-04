declare module 'd3-cloud' {
  interface CloudWord {
    text: string;
    size: number;
    x?: number;
    y?: number;
    rotate?: number;
    [key: string]: any;
  }

  interface CloudLayout {
    size(s: [number, number]): this;
    words(w: CloudWord[]): this;
    padding(p: number): this;
    rotate(r: number): this;
    font(f: string): this;
    fontSize(fn: (d: CloudWord) => number): this;
    on(type: string, callback: (words: CloudWord[]) => void): this;
    start(): this;
  }

  export default function cloud(): CloudLayout;
}
