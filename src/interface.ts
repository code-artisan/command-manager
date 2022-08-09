type Option = {
  name: string;
  type?: string;
  shortcut?: string;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  format?: any;
  choices?: readonly string[];
  preset?: unknown;
  conflicts?: string | string[];
  implies?: {
    [key: string]: any;
  };
  env?: string;
  parser?: (...args) => any;
  variadic?: boolean;
}

type Argument = {
  type: string;
  description: string;
}

export type Config = {
  name?: string;
  version?: string;
  description?: string;
}

export type Command = {
  command: string;
  options: Option[];
  arguments?: Argument[];
  description?: string;
  action: (...args: any[]) => void;
}
