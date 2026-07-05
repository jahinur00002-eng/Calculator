/**
 * Highly robust, feature-rich expression parser and evaluator.
 * Supports standard operations, scientific functions, constants, 
 * implicit multiplication, custom angle modes, and robust error handling.
 */

import { AngleMode } from '../types';

type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'IDENTIFIER' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

class Lexer {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    // Sanitize input
    this.input = input
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi');
  }

  private peek(): string {
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  private next(): string {
    return this.pos < this.input.length ? this.input[this.pos++] : '';
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      const char = this.peek();

      if (/\s/.test(char)) {
        this.next(); // Skip whitespace
        continue;
      }

      if (/[0-9.]/.test(char)) {
        let numStr = '';
        while (/[0-9.]/.test(this.peek())) {
          numStr += this.next();
        }
        tokens.push({ type: 'NUMBER', value: numStr });
        continue;
      }

      if (/[a-zA-Z]/.test(char)) {
        let idStr = '';
        while (/[a-zA-Z]/.test(this.peek())) {
          idStr += this.next();
        }
        tokens.push({ type: 'IDENTIFIER', value: idStr.toLowerCase() });
        continue;
      }

      if ('+-*/^%'.includes(char)) {
        tokens.push({ type: 'OPERATOR', value: this.next() });
        continue;
      }

      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: this.next() });
        continue;
      }

      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: this.next() });
        continue;
      }

      // If we encounter an unexpected character, throw error
      throw new Error(`Unexpected character: '${char}'`);
    }

    tokens.push({ type: 'EOF', value: '' });

    // Apply implicit multiplication logic:
    // e.g. 2(3+4) -> 2*(3+4), 2pi -> 2*pi, (2)(3) -> (2)*(3), pi e -> pi * e
    const processedTokens: Token[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      processedTokens.push(current);

      if (current.type === 'EOF') break;

      const next = tokens[i + 1];
      if (!next || next.type === 'EOF') continue;

      const currentCanEndOperand = 
        current.type === 'NUMBER' || 
        current.type === 'RPAREN' || 
        (current.type === 'IDENTIFIER' && (current.value === 'pi' || current.value === 'e'));

      const nextCanStartOperand = 
        next.type === 'NUMBER' || 
        next.type === 'LPAREN' || 
        next.type === 'IDENTIFIER'; // Can be pi, e, or function like sin

      if (currentCanEndOperand && nextCanStartOperand) {
        processedTokens.push({ type: 'OPERATOR', value: '*' });
      }
    }

    return processedTokens;
  }
}

// AST Nodes
interface ASTNode {
  evaluate(angleMode: AngleMode): number;
}

class NumberNode implements ASTNode {
  constructor(private value: number) {}
  evaluate(): number {
    return this.value;
  }
}

class ConstantNode implements ASTNode {
  constructor(private name: string) {}
  evaluate(): number {
    if (this.name === 'pi') return Math.PI;
    if (this.name === 'e') return Math.E;
    throw new Error(`Unknown constant: ${this.name}`);
  }
}

class UnaryOpNode implements ASTNode {
  constructor(private op: string, private expr: ASTNode) {}
  evaluate(angleMode: AngleMode): number {
    const val = this.expr.evaluate(angleMode);
    if (this.op === '-') return -val;
    if (this.op === '+') return val;
    throw new Error(`Unknown unary operator: ${this.op}`);
  }
}

class BinOpNode implements ASTNode {
  constructor(private left: ASTNode, private op: string, private right: ASTNode) {}
  evaluate(angleMode: AngleMode): number {
    const lVal = this.left.evaluate(angleMode);
    const rVal = this.right.evaluate(angleMode);

    switch (this.op) {
      case '+': return lVal + rVal;
      case '-': return lVal - rVal;
      case '*': return lVal * rVal;
      case '/': 
        if (rVal === 0) throw new Error('Division by zero');
        return lVal / rVal;
      case '%': return lVal % rVal;
      case '^': return Math.pow(lVal, rVal);
      default:
        throw new Error(`Unknown operator: ${this.op}`);
    }
  }
}

class FuncNode implements ASTNode {
  constructor(private name: string, private arg: ASTNode) {}
  evaluate(angleMode: AngleMode): number {
    const val = this.arg.evaluate(angleMode);

    switch (this.name) {
      case 'sin':
        return Math.sin(angleMode === 'deg' ? (val * Math.PI) / 180 : val);
      case 'cos':
        return Math.cos(angleMode === 'deg' ? (val * Math.PI) / 180 : val);
      case 'tan': {
        const rad = angleMode === 'deg' ? (val * Math.PI) / 180 : val;
        // Handle undefined tangent at 90 deg, 270 deg etc.
        const cosVal = Math.cos(rad);
        if (Math.abs(cosVal) < 1e-15) {
          throw new Error('Undefined tangent');
        }
        return Math.sin(rad) / cosVal;
      }
      case 'asin': {
        if (val < -1 || val > 1) throw new Error('Out of domain for asin');
        const rad = Math.asin(val);
        return angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
      }
      case 'acos': {
        if (val < -1 || val > 1) throw new Error('Out of domain for acos');
        const rad = Math.acos(val);
        return angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
      }
      case 'atan': {
        const rad = Math.atan(val);
        return angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
      }
      case 'ln':
        if (val <= 0) throw new Error('Logarithm of non-positive number');
        return Math.log(val);
      case 'log':
        if (val <= 0) throw new Error('Logarithm of non-positive number');
        return Math.log10(val);
      case 'sqrt':
        if (val < 0) throw new Error('Square root of negative number');
        return Math.sqrt(val);
      case 'cbrt':
        return Math.cbrt(val);
      case 'abs':
        return Math.abs(val);
      case 'exp':
        return Math.exp(val);
      default:
        throw new Error(`Unknown function: ${this.name}`);
    }
  }
}

class Parser {
  private tokens: Token[];
  private currentIdx: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.currentIdx];
  }

  private next(): Token {
    return this.tokens[this.currentIdx++];
  }

  private consume(expectedType: TokenType, errorMsg: string): Token {
    const tok = this.peek();
    if (tok.type !== expectedType) {
      throw new Error(errorMsg);
    }
    return this.next();
  }

  public parse(): ASTNode {
    const expr = this.parseExpression();
    if (this.peek().type !== 'EOF') {
      throw new Error(`Unexpected token '${this.peek().value}' after expression`);
    }
    return expr;
  }

  // Expression -> Term { ('+' | '-') Term }
  private parseExpression(): ASTNode {
    let node = this.parseTerm();

    while (true) {
      const tok = this.peek();
      if (tok.type === 'OPERATOR' && (tok.value === '+' || tok.value === '-')) {
        const op = this.next().value;
        const right = this.parseTerm();
        node = new BinOpNode(node, op, right);
      } else {
        break;
      }
    }

    return node;
  }

  // Term -> Factor { ('*' | '/' | '%') Factor }
  private parseTerm(): ASTNode {
    let node = this.parseFactor();

    while (true) {
      const tok = this.peek();
      if (tok.type === 'OPERATOR' && (tok.value === '*' || tok.value === '/' || tok.value === '%')) {
        const op = this.next().value;
        const right = this.parseFactor();
        node = new BinOpNode(node, op, right);
      } else {
        break;
      }
    }

    return node;
  }

  // Factor -> Primary [ '^' Factor ]
  private parseFactor(): ASTNode {
    let node = this.parsePrimary();

    const tok = this.peek();
    if (tok.type === 'OPERATOR' && tok.value === '^') {
      const op = this.next().value;
      const right = this.parseFactor(); // Right associative exponentiation
      node = new BinOpNode(node, op, right);
    }

    return node;
  }

  // Primary -> [ '+' | '-' ] ( NUMBER | CONSTANT | FUNCTION '(' Expression ')' | '(' Expression ')' )
  private parsePrimary(): ASTNode {
    const tok = this.peek();

    // Check unary operator
    if (tok.type === 'OPERATOR' && (tok.value === '+' || tok.value === '-')) {
      const op = this.next().value;
      const operand = this.parsePrimary();
      return new UnaryOpNode(op, operand);
    }

    if (tok.type === 'NUMBER') {
      const val = parseFloat(this.next().value);
      if (isNaN(val)) {
        throw new Error('Invalid number format');
      }
      return new NumberNode(val);
    }

    if (tok.type === 'IDENTIFIER') {
      const name = this.next().value;
      if (name === 'pi' || name === 'e') {
        return new ConstantNode(name);
      }

      // Otherwise, it must be a function call, so we expect a '(' next
      this.consume('LPAREN', `Expected '(' after function '${name}'`);
      const arg = this.parseExpression();
      this.consume('RPAREN', `Expected ')' after argument of function '${name}'`);
      return new FuncNode(name, arg);
    }

    if (tok.type === 'LPAREN') {
      this.next(); // Consume '('
      const expr = this.parseExpression();
      this.consume('RPAREN', "Expected closing parenthesis ')'");
      return expr;
    }

    throw new Error(`Expected number, constant, function, or parenthesis, but got '${tok.value || 'EOF'}'`);
  }
}

/**
 * Main evaluation function.
 * Takes a raw math string and evaluates it, returning the calculated number.
 */
export function evaluateExpression(expression: string, angleMode: AngleMode = 'rad'): number {
  if (!expression || expression.trim() === '') {
    throw new Error('Empty expression');
  }

  const lexer = new Lexer(expression);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const result = ast.evaluate(angleMode);

  if (!isFinite(result)) {
    throw new Error('Arithmetic overflow or underflow');
  }

  return result;
}

/**
 * Format calculation result nicely to handle floating point noise
 * (e.g. 0.1 + 0.2 -> 0.3)
 */
export function formatResult(val: number): string {
  if (Math.abs(val) < 1e-12) return '0';
  
  // Format to standard scientific if number is huge or tiny
  const absVal = Math.abs(val);
  if (absVal >= 1e12 || (absVal > 0 && absVal < 1e-6)) {
    return val.toExponential(6);
  }

  // Remove trailing decimal noise for standard floats
  const str = val.toFixed(10);
  if (str.includes('.')) {
    return parseFloat(str).toString();
  }
  return str;
}
