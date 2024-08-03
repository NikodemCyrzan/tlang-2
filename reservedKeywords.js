const reservedKeywords = new Map(
	Object.entries({
		add: "ADD",
		class: "CLASS",
		else: "ELSE",
		false: "FALSE",
		for: "FOR",
		fun: "FUN",
		if: "IF",
		nil: "NIL",
		or: "OR",
		print: "PRINT",
		return: "RETURN",
		super: "SUPER",
		this: "THIS",
		true: "TRUE",
		var: "VAR",
		while: "WHILE",
	})
);

module.exports = { reservedKeywords };
