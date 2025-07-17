export interface CodeEditor {
  id: string;
  language: string;
  code: string;
  output: string;
  error: string;
  isRunning: boolean;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
  language: string;
  executionTime?: number | null;
}

export interface Language {
  name: string;
  displayName: string;
  version?: string;
  available: boolean;
  defaultCode: string;
}

export interface CodeExecution {
  code: string;
  language: string;
  input?: string;
}

export interface LanguageConfig {
  [key: string]: Language;
} 