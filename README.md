# DS Linter

**Real-time Angular Design System governance — VS Code extension + web dashboard.**

DS Linter solves a problem that every team maintaining a shared Angular component library faces: consuming teams misuse components, override internal styles with global CSS, and silently break the design system across applications. By the time someone notices, the damage is spread across dozens of files.

DS Linter catches these issues before the code is committed.

---

## The problem

When you build a shared Angular component library used by multiple teams:

- Developers use components without required inputs and only find out at runtime
- Deprecated components keep getting used because nobody checked the docs
- Global CSS overrides like `.core-button { color: red }` silently break all instances across every app
- `::ng-deep` pierces component encapsulation and breaks with every Angular upgrade
- Custom one-off components get built when a shared one already exists

None of these problems have real-time feedback in the editor. Storybook is static. Code reviews catch them too late. DS Linter catches them as you type.

---

## What it does

### VS Code Extension
- Reads your design system's component metadata from a `ds-linter.config.json` file
- Watches Angular HTML templates in real time as you type
- Shows inline red/yellow/blue squiggles with hover tooltips and quick fixes
- Detects:
  - Missing required inputs on design system components
  - Deprecated component usage
  - Custom components that duplicate existing design system components
  - Global CSS overrides targeting design system component classes
  - `::ng-deep` usage against design system components
- Populates the VS Code Problems panel with all violations

### Web Dashboard
- Takes a GitHub repository URL as input
- Scans the entire codebase using the same analysis engine
- Shows a visual report: adoption score, violations by file, deprecated usage heatmap
- Real-time progress via WebSockets
- Tracks adoption over time with charts

### CI/CD Integration
- Runs as a GitHub Actions step
- Fails the build on critical violations (missing required inputs, global overrides)
- Posts a violation summary as a PR comment

---

## Tech stack

| Layer | Technology |
|---|---|
| VS Code Extension | TypeScript, VS Code Extension API, Language Server Protocol |
| Analyzer Core | TypeScript, Angular compiler API, PostCSS |
| Web Dashboard | Next.js 15, React, Tailwind CSS, Recharts |
| Backend | Node.js, Express, WebSockets |
| Testing | Cypress (E2E), Jest (unit) |
| CI/CD | GitHub Actions |
| Deployment | Vercel (dashboard), VS Code Marketplace (extension) |
| Architecture | Module Federation, Docker |

---

## Project structure

```
ds-linter/
├── packages/
│   ├── vscode-extension/     # VS Code extension
│   ├── analyzer-core/        # Shared analysis engine
│   └── web-dashboard/        # Next.js web dashboard
├── .github/
│   └── workflows/            # CI/CD pipelines
└── ds-linter.config.json     # Example config
```

---

## Config file

Point DS Linter at your design system by adding a `ds-linter.config.json` to your project root:

```json
{
  "prefix": "core",
  "components": [
    {
      "selector": "core-button",
      "inputs": [
        { "name": "variant", "required": true, "values": ["primary", "secondary", "ghost"] },
        { "name": "disabled", "required": false }
      ],
      "deprecated": false
    },
    {
      "selector": "core-card-legacy",
      "deprecated": true,
      "replacement": "core-card"
    }
  ],
  "cssRules": {
    "blockGlobalOverrides": true,
    "blockNgDeep": true
  }
}
```

---

## Roadmap

- [x] Project scaffold and monorepo setup
- [ ] VS Code extension — template linting (missing inputs, deprecated, duplicates)
- [ ] VS Code extension — CSS/SCSS watcher (global overrides, ng-deep)
- [ ] Analyzer core — standalone engine
- [ ] Web dashboard — GitHub repo scanning
- [ ] Web dashboard — adoption charts and heatmap
- [ ] CI/CD — GitHub Actions integration
- [ ] Module Federation — micro-frontend split
- [ ] Docker — containerised backend
- [ ] Published to VS Code Marketplace

---

## Built by

Rishma Merkaje Nanaiah — Frontend Engineer, Angular & Enterprise UI Systems
[portfolio-eta-seven-83.vercel.app](https://portfolio-eta-seven-83.vercel.app)

Inspired by real-world experience maintaining a shared Angular design system used across multiple engineering teams.
