const { analyzeTemplate } = require('./out/template-analyzer');
const { analyzeCss } = require('./out/css-analyzer');
const { loadConfig } = require('./out/config-loader');
const path = require('path');

// Load config from repo root
const config = loadConfig(path.join(__dirname, '../../'), 'ds-linter.config.json');

if (!config) {
  console.error('❌ Config not found. Make sure ds-linter.config.json exists in repo root.');
  process.exit(1);
}

console.log('✅ Config loaded — prefix:', config.prefix);
console.log('✅ Components:', config.components.map(c => c.selector).join(', '));
console.log('');

// --- Test 1: Template ---
const html = `
<core-button>Submit</core-button>
<core-card-legacy [title]="hello"></core-card-legacy>
<custom-spinner></custom-spinner>
<core-input label="Name"></core-input>
`;

console.log('📄 Template analysis:');
const templateViolations = analyzeTemplate(html, config);
if (templateViolations.length === 0) {
  console.log('  No violations found.');
} else {
  templateViolations.forEach(v => {
    const icon = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : '🔵';
    console.log(`  ${icon} Line ${v.line + 1}: ${v.message}`);
    if (v.fix) console.log(`     💡 Fix: ${v.fix}`);
  });
}

console.log('');

// --- Test 2: CSS ---
const scss = `
.core-button {
  color: red;
}

::ng-deep .core-card {
  padding: 0;
}
`;

console.log('🎨 CSS/SCSS analysis:');
const cssViolations = analyzeCss(scss, config);
if (cssViolations.length === 0) {
  console.log('  No violations found.');
} else {
  cssViolations.forEach(v => {
    const icon = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : '🔵';
    console.log(`  ${icon} Line ${v.line + 1}: ${v.message}`);
    if (v.fix) console.log(`     💡 Fix: ${v.fix}`);
  });
}

console.log('');
console.log(`📊 Total: ${templateViolations.length + cssViolations.length} violations found`);
