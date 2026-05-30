import * as fs from 'fs';
import * as path from 'path';
import { DSLinterConfig } from './types';

export function loadConfig(workspaceRoot: string, configPath: string): DSLinterConfig | null {
  const fullPath = path.join(workspaceRoot, configPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw) as DSLinterConfig;
  } catch {
    return null;
  }
}
