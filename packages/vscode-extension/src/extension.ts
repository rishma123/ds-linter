import * as vscode from 'vscode';
import * as path from 'path';
import { loadConfig } from './config-loader';
import { analyzeTemplate } from './template-analyzer';
import { analyzeCss } from './css-analyzer';
import { DSLinterConfig, Violation } from './types';

const DIAGNOSTIC_SOURCE = 'ds-linter';
let diagnosticCollection: vscode.DiagnosticCollection;
let config: DSLinterConfig | null = null;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_SOURCE);
  context.subscriptions.push(diagnosticCollection);

  // Load config on activation
  refreshConfig();

  // Watch for config file changes
  const configWatcher = vscode.workspace.createFileSystemWatcher('**/ds-linter.config.json');
  configWatcher.onDidChange(() => refreshConfig());
  configWatcher.onDidCreate(() => refreshConfig());
  context.subscriptions.push(configWatcher);

  // Analyze on open
  if (vscode.window.activeTextEditor) {
    analyzeDocument(vscode.window.activeTextEditor.document);
  }

  // Analyze on change (real-time)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => analyzeDocument(e.document))
  );

  // Analyze on open
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) analyzeDocument(editor.document);
    })
  );

  // Analyze on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => analyzeDocument(doc))
  );

  console.log('DS Linter activated');
}

function refreshConfig() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  const configPath = vscode.workspace.getConfiguration('dsLinter').get<string>('configPath', 'ds-linter.config.json');
  config = loadConfig(workspaceFolders[0].uri.fsPath, configPath);

  if (!config) {
    vscode.window.showInformationMessage('DS Linter: No ds-linter.config.json found. Add one to enable linting.');
  }

  // Re-analyze all open documents
  vscode.workspace.textDocuments.forEach(doc => analyzeDocument(doc));
}

function analyzeDocument(document: vscode.TextDocument) {
  const enabled = vscode.workspace.getConfiguration('dsLinter').get<boolean>('enabled', true);
  if (!enabled || !config) return;

  const ext = path.extname(document.fileName);
  let violations: Violation[] = [];

  if (ext === '.html') {
    violations = analyzeTemplate(document.getText(), config);
  } else if (ext === '.scss' || ext === '.css') {
    violations = analyzeCss(document.getText(), config);
  } else {
    return;
  }

  const diagnostics = violations.map(v => violationToDiagnostic(document, v));
  diagnosticCollection.set(document.uri, diagnostics);
}

function violationToDiagnostic(document: vscode.TextDocument, v: Violation): vscode.Diagnostic {
  const startPos = new vscode.Position(v.line, v.column);
  const endPos = new vscode.Position(v.line, v.column + v.length);
  const range = new vscode.Range(startPos, endPos);

  const severity =
    v.severity === 'error' ? vscode.DiagnosticSeverity.Error :
    v.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
    vscode.DiagnosticSeverity.Information;

  const diagnostic = new vscode.Diagnostic(range, v.message, severity);
  diagnostic.source = DIAGNOSTIC_SOURCE;
  if (v.fix) {
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(document.uri, range),
        `Quick fix: ${v.fix}`
      )
    ];
  }
  return diagnostic;
}

export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
}
