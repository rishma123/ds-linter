import { DSLinterConfig, Violation } from './types';

export function analyzeCss(content: string, config: DSLinterConfig): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');
  const prefix = config.prefix;

  lines.forEach((line, lineIndex) => {
    // Block ng-deep
    if (config.cssRules.blockNgDeep && line.includes('::ng-deep')) {
      const col = line.indexOf('::ng-deep');
      violations.push({
        type: 'ng-deep',
        severity: 'warning',
        message: `::ng-deep is deprecated and will be removed in a future Angular version. It breaks component encapsulation.`,
        fix: 'Use component inputs or CSS custom properties instead',
        line: lineIndex,
        column: col,
        length: 9
      });
    }

    // Block global overrides targeting design system classes
    if (config.cssRules.blockGlobalOverrides) {
      const dsClassMatch = line.match(new RegExp(`\\.${prefix}-([a-z][a-z0-9-]*)`, 'g'));
      if (dsClassMatch) {
        dsClassMatch.forEach(match => {
          const col = line.indexOf(match);
          violations.push({
            type: 'global-css-override',
            severity: 'error',
            message: `Global CSS targets design system internals: ${match}. This will break all instances across consuming apps.`,
            fix: `Use the component's input properties or CSS custom properties instead`,
            line: lineIndex,
            column: col,
            length: match.length
          });
        });
      }
    }
  });

  return violations;
}
