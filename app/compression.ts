import { $ } from "bun";
export const SUPPORTED_ENCODINGS = ["gzip"];

export const compress = async (text: string) => {
  const output = await $`echo -n "${text.trim()}" | gzip`.blob();
  return {
    compressed: output,
    size: output.size,
  };
};
