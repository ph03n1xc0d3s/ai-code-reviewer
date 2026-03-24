import { parse } from "@babel/parser";

export function parseJS(code) {
  try {
    return parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      errorRecovery: true,
      ranges: true,
      tokens: true,
      allowReturnOutsideFunction: true,
    });
  } catch (e) {
    return null;
  }
}