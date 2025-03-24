import { $ } from "bun";
export const SUPPORTED_ENCODINGS = ["gzip"];

export const compress = async (text: string) => {
  const output = await $`echo -n ${text} | gzip`.blob()
  const content = await output.text();
  console.log(content);
  
  return {
    compressed: content,
    size: output.size,
  };
};
