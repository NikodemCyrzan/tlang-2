const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline");
const { Scanner } = require("./scanner");
const { hadError, resetErrors } = require("./errors");

const [, , ...args] = process.argv;

if (args.length > 1) {
	console.log("Usage: jlox [script]");
	process.exit(64);
} else if (args.length == 1) {
	runFile(args[0]);
} else {
	runPropmt();
}

function run(sourceCode) {
	const scanner = new Scanner(sourceCode);
	const tokens = scanner.scanTokens();

	for (const token of tokens) {
		console.log(token);
	}
}

async function runFile(filePath) {
	try {
		const code = await fs.readFile(path.normalize(filePath), { encoding: "utf8" });
		run(code);

		if (hadError) process.exit(65);
	} catch (err) {
		console.log(err);
	}
}

async function runPropmt() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	while (true) {
		await new Promise((resolve) => {
			rl.question(`> `, (code) => {
				if (!code) {
					resolve();
				}

				run(code);
				resetErrors();
				resolve();
			});
		});
	}
}
