export interface ComponentInput {
  name: string;
  required: boolean;
  values?: string[];
}

export interface ComponentDefinition {
  selector: string;
  inputs?: ComponentInput[];
  deprecated: boolean;
  replacement?: string;
}

export interface CssRules {
  blockGlobalOverrides: boolean;
  blockNgDeep: boolean;
}

export interface DSLinterConfig {
  prefix: string;
  components: ComponentDefinition[];
  knownSelectors: string[];
  cssRules: CssRules;
}

export interface Violation {
  type: 'missing-input' | 'deprecated' | 'duplicate-component' | 'global-css-override' | 'ng-deep';
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
  line: number;
  column: number;
  length: number;
}
