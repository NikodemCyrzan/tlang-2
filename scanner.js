const { error } = require("./errors");
const { reservedKeywords } = require("./reservedKeywords");
const { Token, TT } = require("./token");

class Scanner {
	#source;
	#tokens = [];

	#start = 0;
	#current = 0;
	#line = 1;

	constructor(sourceCode) {
		this.#source = sourceCode;
	}

	scanTokens() {
		while (!this.isAtEnd()) {
			this.#start = this.#current;
			this.scanToken();
		}

		this.#tokens.push(new Token(TT.EOF, "", null, this.#line));
		return this.#tokens;
	}

	scanToken() {
		const char = this.advance();

		switch (char) {
			case " ":
			case "\r":
			case "\t":
				break;

			case "\n":
				this.#line++;
				break;

			case "(":
				this.addToken(TT.LEFT_PAREN);
				break;
			case ")":
				this.addToken(TT.RIGHT_PAREN);
				break;
			case "{":
				this.addToken(TT.LEFT_BRACE);
				break;
			case "}":
				this.addToken(TT.RIGHT_BRACE);
				break;
			case ",":
				this.addToken(TT.COMMA);
				break;
			case ".":
				this.addToken(TT.DOT);
				break;
			case "-":
				this.addToken(TT.MINUS);
				break;
			case "+":
				this.addToken(TT.PLUS);
				break;
			case ";":
				this.addToken(TT.SEMICOLON);
				break;
			case "*":
				this.addToken(TT.STAR);
				break;
			case "!":
				this.addToken(this.match("=") ? TT.BANG_EQUAL : TT.BANG);
				break;
			case "=":
				this.addToken(this.match("=") ? TT.EQUAL_EQUAL : TT.EQUAL);
				break;
			case "<":
				this.addToken(this.match("=") ? TT.LESS_EQUAL : TT.LESS);
				break;
			case ">":
				this.addToken(this.match("=") ? TT.GREATER_EQUAL : TT.GREATER);
				break;

			case "/":
				if (this.match("/")) {
					while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
				} else if (this.match("*")) {
					this.multiLineComment();
				} else {
					this.addToken(TT.SLASH);
				}
				break;

			case '"':
				this.string();
				break;

			default:
				if (this.isDigit(char)) {
					this.number();
				} else if (this.isAlpha(char)) {
					this.identifier();
				} else {
					error(this.#line, `Unexpected character '${char}'`);
				}
				break;
		}
	}

	addToken(type, literal = null) {
		const lexeme = this.#source.substring(this.#start, this.#current);
		this.#tokens.push(new Token(type, lexeme, literal, this.#line));
	}

	string() {
		while (this.peek() != '"' && !this.isAtEnd()) {
			if (this.peek() == "\n") this.#line++;
			this.advance();
		}

		if (this.isAtEnd()) {
			error(this.#line, "Unterminated string literal.");
			return;
		}

		this.advance();

		const lexeme = this.#source.substring(this.#start + 1, this.#current - 1);
		this.addToken(TT.STRING, lexeme);
	}

	number() {
		while (this.isDigit(this.peek())) this.advance();

		if (this.peek() === "." && this.isDigit(this.peekNext())) {
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		this.addToken(TT.NUMBER, Number(this.#source.substring(this.#start, this.#current)));
	}

	identifier() {
		while (this.isAlphaNumeric(this.peek())) this.advance();

		const lexeme = this.#source.substring(this.#start, this.#current);
		let type = reservedKeywords.get(lexeme);

		if (type == null) type = TT.IDENTIFIER;

		this.addToken(type);
	}

	multiLineComment() {
		let nestingLevel = 1;

		while (nestingLevel > 0 && !this.isAtEnd()) {
			if (this.peek() == "\n") {
				this.#line++;
			}

			if (this.#source[this.#current] === "*" && this.peekNext() === "/") {
				nestingLevel--;
				this.advance();
			} else if (this.#source[this.#current] === "/" && this.peekNext() === "*") {
				nestingLevel++;
				this.advance();
			}

			this.advance();
		}
	}

	match(expected) {
		if (this.isAtEnd()) return false;
		if (this.#source[this.#current] != expected) return false;

		this.#current++;
		return true;
	}

	isAtEnd() {
		return this.#current >= this.#source.length;
	}

	advance() {
		return this.#source[this.#current++];
	}

	peek() {
		if (this.isAtEnd()) return "\0";

		return this.#source[this.#current];
	}

	peekNext() {
		if (this.#current + 1 >= this.#source.length) return "\0";

		return this.#source[this.#current + 1];
	}

	isDigit(char) {
		return char >= "0" && char <= "9";
	}

	isAlpha(char) {
		return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_";
	}

	isAlphaNumeric(char) {
		return this.isAlpha(char) || this.isDigit(char);
	}
}

module.exports = { Scanner };
