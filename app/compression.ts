import { $ } from "bun";
export const SUPPORTED_ENCODINGS = ["gzip"];

export const compress = async (text: string) => {
  const { stdout } = await $`echo -n ${text} | gzip`.quiet();
  const size = stdout.byteLength;

  return { compressed: stdout, size };
};
