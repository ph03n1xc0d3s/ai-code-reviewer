import { parse } from "@babel/parser";

export function parseJS(code) {
  try {
    return parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });
  } catch (e) {
    return null;
  }
}