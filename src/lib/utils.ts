import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// @ts-expect-error idk
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const customOneDark = {
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent', // Remove background from `code`
  },
};
