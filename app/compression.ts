import { $ } from "bun";
export const SUPPORTED_ENCODINGS = ["gzip"];

export const compress = async (text: string) => {
  const {stdout}= await $`echo -n "${text.trim()}" | gzip`
  const output = new Blob([stdout]);
  return {
    compressed: output,
    size: output.size,
  };
};
