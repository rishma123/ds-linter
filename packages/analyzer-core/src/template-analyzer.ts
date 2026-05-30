import { DSLinterConfig, Violation } from './types';

const COMPONENT_TAG_REGEX = /<([a-z][a-z0-9-]*)/g;
const ATTRIBUTE_REGEX = /\[?([a-zA-Z][a-zA-Z0-9-]*)\]?\s*=/g;

export function analyzeTemplate(content: string, config: DSLinterConfig): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    const tagMatches = [...line.matchAll(/<([a-z][a-z0-9-]*)/g)];

    tagMatches.forEach(match => {
      const selector = match[1];
      const col = match.index ?? 0;

      // Find component definition
      const componentDef = config.components.find(c => c.selector === selector);

      if (componentDef) {
        // Check deprecated
        if (componentDef.deprecated) {
          violations.push({
            type: 'deprecated',
            severity: 'warning',
            message: `${selector} is deprecated.${componentDef.replacement ? ` Use ${componentDef.replacement} instead.` : ''}`,
            fix: componentDef.replacement ? `Replace with <${componentDef.replacement}>` : undefined,
            line: lineIndex,
            column: col,
            length: selector.length + 1
          });
          return;
        }

        // Check required inputs
        const requiredInputs = componentDef.inputs?.filter(i => i.required) ?? [];
        requiredInputs.forEach(input => {
          const hasInput =
            line.includes(`[${input.name}]`) ||
            line.includes(`${input.name}=`) ||
            new RegExp(`\\s${input.name}[\\s>]`).test(line);

          if (!hasInput) {
            const values = input.values ? ` Accepted: ${input.values.map(v => `"${v}"`).join(' | ')}` : '';
            violations.push({
              type: 'missing-input',
              severity: 'error',
              message: `Missing required input [${input.name}] on <${selector}>.${values}`,
              fix: `Add ${input.name}="${input.values?.[0] ?? ''}"`,
              line: lineIndex,
              column: col,
              length: selector.length + 1
            });
          }
        });
      } else if (
        selector.startsWith('custom-') ||
        (selector.includes('-') && !selector.startsWith(config.prefix))
      ) {
        // Check if a design system alternative exists
        const possibleMatch = config.knownSelectors.find(known =>
          known.includes(selector.replace('custom-', '').split('-')[0])
        );
        if (possibleMatch) {
          violations.push({
            type: 'duplicate-component',
            severity: 'info',
            message: `<${selector}> might duplicate <${possibleMatch}> from the design system.`,
            fix: `Consider using <${possibleMatch}> instead`,
            line: lineIndex,
            column: col,
            length: selector.length + 1
          });
        }
      }
    });
  });

  return violations;
}
