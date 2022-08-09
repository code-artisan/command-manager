import { Option, program } from 'commander';
import { pick, isString, forEach, isFunction } from 'lodash';
import { Command, Config } from './interface';

export { Command };

class CommandManager {
  public program = program;

  private config = {
    name: 'octopus',
    version: '0.0.1',
    description: '',
  };

  private commands: Command[] = [];

  constructor(config: Config = {}) {
    this.config = { ...this.config, ...config };
  }

  registry(command) {
    [].concat(command).forEach((item: Command) => {
      this.commands.push(
        pick(item, ['command', 'options', 'action', 'description', 'arguments'])
      );
    });
  }

  private parseCommandOption(option) {
    let string = '';

    if (isString(option.shortcut)) {
      string += `-${option.shortcut.replace(/^-/, '')}, `;
    }

    if (isString(option.name)) {
      string += `--${option.name.replace(/^--/, '')} `;
    }

    if (isString(option.type)) {
      string += option.type.includes('<') || option.type.includes('[') ? option.type : `<${option.type}>`;
    }

    return string.replace(/[,]?\s$/, '');
  }

  injectBaseConfig() {
    program.version(this.config.version || '');
    program.description(this.config.description);
  }

  createOption(params) {
    return new Option(this.parseCommandOption(params), params.description || '');
  }

  createCommandOption(params) {
    const option = this.createOption(params);

    if ('preset' in params) {
      option.preset(params.preset);
    }

    if ('env' in params) {
      option.env(params.env);
    }

    if ('choices' in params) {
      option.choices(params.choices);
    }

    if ('defaultValue' in params) {
      option.default(params.defaultValue);
    }

    if ('conflicts' in params) {
      option.conflicts(params.conflicts);
    }

    if (isFunction(params.parser)) {
      option.argParser(params.parser);
    }

    if (params.required === true) {
      option.makeOptionMandatory(true);
    }

    return option;
  }

  makeCommand(params: Command) {
    const command = this.program.createCommand(params.command);

    if (isString(params.description)) {
      command.description(params.description);
    }

    forEach(params.arguments, (argument) => {
      command.argument(argument.type, argument.description);
    });

    forEach(params.options, (item) => {
      command.addOption(this.createCommandOption(item));
    });

    return command.action((...args) => params.action(...args));
  }

  registryCommands() {
    this.commands.forEach((item: Command) => {
      this.program.addCommand(this.makeCommand(item));
    });
  }

  parse(args = process.argv) {
    this.injectBaseConfig();

    this.registryCommands();

    this.program.parse(args);
  }

  setCommandConfig(command, options) {
    this.commands = this.commands.map((item: Command) => {
      if (item.command === command) {
        return {
          command: item.command,
          action: options.action || item.action,
          arguments: options.arguments || item.arguments,
          options: options.options || item.options,
          description: options.description || item.description,
        };
      }

      return item;
    });
  }
}

export default CommandManager;
