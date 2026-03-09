export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'enum' | 'port' | 'json';

export interface BaseFieldConfig {
  required?: boolean;
}

export interface StringFieldConfig extends BaseFieldConfig {
  type: 'string';
  default?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  default?: number;
}

export interface BooleanFieldConfig extends BaseFieldConfig {
  type: 'boolean';
  default?: boolean;
}

export interface UrlFieldConfig extends BaseFieldConfig {
  type: 'url';
  default?: string;
}

export interface EmailFieldConfig extends BaseFieldConfig {
  type: 'email';
  default?: string;
}

export interface EnumFieldConfig<V extends string = string> extends BaseFieldConfig {
  type: 'enum';
  values: readonly V[];
  default?: V;
}

export interface PortFieldConfig extends BaseFieldConfig {
  type: 'port';
  default?: number;
}

export interface JsonFieldConfig extends BaseFieldConfig {
  type: 'json';
  default?: unknown;
}

export type FieldConfig =
  | StringFieldConfig
  | NumberFieldConfig
  | BooleanFieldConfig
  | UrlFieldConfig
  | EmailFieldConfig
  | EnumFieldConfig<string>
  | PortFieldConfig
  | JsonFieldConfig;

export type Schema = Record<string, FieldConfig>;

type ResolveFieldType<F extends FieldConfig> =
  F extends NumberFieldConfig ? number :
  F extends BooleanFieldConfig ? boolean :
  F extends PortFieldConfig ? number :
  F extends JsonFieldConfig ? unknown :
  F extends EnumFieldConfig<infer V> ? V :
  string;

type IsRequired<F extends FieldConfig> =
  F extends { required: true } ? true :
  F extends { default: infer D } ? (D extends undefined ? false : true) :
  false;

export type InferEnv<S extends Schema> = {
  [K in keyof S as IsRequired<S[K]> extends true ? K : never]: ResolveFieldType<S[K]>;
} & {
  [K in keyof S as IsRequired<S[K]> extends true ? never : K]?: ResolveFieldType<S[K]>;
};
