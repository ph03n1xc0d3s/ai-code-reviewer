import { checkSQLInjection } from "./sql-injection.js";
import { checkNPlusOne } from "./promises-loops.js";
import { checkDebugLogs } from "./console.log.js";

const rules = [
  checkSQLInjection,
  checkNPlusOne,
  checkDebugLogs,
];

export function runRules(change, file) {
  return rules
    .map((rule) => rule(change, file))
    .filter(Boolean);
}