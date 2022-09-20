"use strict";

const vscode = require("vscode");
const sqlFormatter = require("sql-formatter-plus");

const getSetting = (group, key, def) => {
	const settings = vscode.workspace.getConfiguration(group, null);
	const editor = vscode.window.activeTextEditor;
	const language = editor && editor.document && editor.document.languageId;
	const languageSettings = language && vscode.workspace.getConfiguration(null, null).get(`[${language}]`);
	let value = languageSettings && languageSettings[`${group}.${key}`];
	if (value == null) value = settings.get(key, def);
	return value == null ? def : value;
};

const getConfig = ({ insertSpaces, tabSize }) => ({
	indent: insertSpaces ? " ".repeat(tabSize) : "\t",
	uppercase: getSetting("db2-formatter", "uppercase", false),
	linesBetweenQueries: getSetting("db2-formatter", "linesBetweenQueries", 2),
});

const format = (text, config) => {
	text = sqlFormatter.format(text, config);
	const reg = /\n\t* *@ *\n*/gu;
	return text.replace(reg, "\n@\n").trim();
};

module.exports.activate = () =>
	vscode.languages.registerDocumentRangeFormattingEditProvider("sql", {
		provideDocumentRangeFormattingEdits: (document, range, options) => [
			vscode.TextEdit.replace(range, format(document.getText(range), getConfig(options))),
		],
	});
