let hadError = false;

function error(line, message) {
	hadError = true;
	report(line, "", message);
}

function resetErrors() {
	hadError = false;
}

function report(line, where, message) {
	console.log(`[line ${line}] Error ${where}: ${message}`);
}

module.exports = { error, report, hadError, resetErrors };
