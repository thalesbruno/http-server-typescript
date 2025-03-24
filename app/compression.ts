import { $, gzipSync } from "bun";
export const SUPPORTED_ENCODINGS = ["gzip"];

export const $compress = async (text: string) => {
  const output = await $`echo ${text} | gzip`.blob();
  return {
    compressed: output,
    size: output.size,
  };
};

export const compress = async (text: string) => {
  const compressed = gzipSync(new TextEncoder().encode(text));
  return {
    compressed: new Blob([compressed]),
    size: compressed.length,
  };
};


