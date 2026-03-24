import PHPParser from "php-parser";

const parser = new PHPParser.Engine({
  parser: { php7: true },
  ast: { withPositions: true },
});

export function parsePHP(code) {
  try {
    return parser.parseCode(code);
  } catch (e) {
    return null;
  }
}