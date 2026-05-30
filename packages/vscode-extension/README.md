# DS Linter — VS Code Extension

Real-time Angular design system governance inside VS Code.

## Features
- Missing required inputs — red squiggle with quick fix
- Deprecated component detection — yellow squiggle with replacement suggestion
- Duplicate component warning — blue info when a design system component already exists
- Global CSS override detection — catches `.bricks-*` overrides in global stylesheets
- `::ng-deep` violation warnings

## Setup
1. Install the extension
2. Add a `ds-linter.config.json` to your project root
3. Start typing — violations appear inline immediately

## Config example
```json
{
  "prefix": "core",
  "components": [
    {
      "selector": "core-button",
      "inputs": [
        { "name": "variant", "required": true, "values": ["primary", "secondary", "ghost"] }
      ],
      "deprecated": false
    }
  ],
  "knownSelectors": ["core-button", "core-card", "core-spinner"],
  "cssRules": {
    "blockGlobalOverrides": true,
    "blockNgDeep": true
  }
}
```
