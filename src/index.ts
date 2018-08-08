import { EventEmitter } from 'events';
import * as execa from 'execa';
import { access } from 'fs';
import { platform } from 'os';
import { basename, extname, resolve, sep } from 'path';
import * as which from 'which';

import { AdapterInstance } from './adapter';

/**
 * Utility for creating ISO 9660 images.
 *
 * @class Mkiso
 */
class Mkiso extends EventEmitter {
  protected readonly defaultAdapters: { [os: string]: string } = {
    darwin: 'hdiutil',
    linux: 'mkisofs',
  };

  private readonly _platform: NodeJS.Platform = platform();
  private _adapter: AdapterInstance | null = null;
  private _source: string;
  private _output: string;

  private _label: string = '';
  private _publisher: string = '';
  private _verbose: boolean = false;

  /**
   * Creates an instance of Mkiso.
   *
   * @param {string} sourceDir
   * @memberof Mkiso
   */
  constructor(sourceDir: string) {
    super();
    if (!sourceDir || sourceDir.length === 0) {
      throw new Error('Missing required parameter sourceDir');
    }

    this._source = sourceDir;
    this._output = (sourceDir.endsWith(sep) ? sourceDir.slice(0, -1) : sourceDir).concat('.iso');
  }

  /**
   * Set the volume name.
   *
   * @param {string} name
   * @returns
   * @memberof Mkiso
   */
  public label(name: string) {
    if (typeof name === 'string' && name.length > 0) {
      this._label = name;
    }
    return this;
  }

  /**
   * Set the publisher name.
   *
   * @param {string} name
   * @returns
   * @memberof Mkiso
   */
  public publisher(name: string) {
    if (typeof name === 'string' && name.length > 0) {
      this._publisher = name;
    }
    return this;
  }

  /**
   * Enable the verbose mode.
   *
   * @returns
   * @memberof Mkiso
   */
  public verbose() {
    this._verbose = true;
    return this;
  }

  /**
   * Set the iso output file path.
   *
   * @param {string} target
   * @returns
   * @memberof Mkiso
   */
  public output(target: string) {
    if (typeof target === 'string' && target.length > 0) {
      this._output = extname(target) === '.iso' ? target : target.concat('.iso');
    }
    return this;
  }

  /**
   * Override the default adapter with a custom one.
   * You can use an MkisoAdapter adapter instance
   * or the name of an adapter into the adapters folder or link an external one.
   *
   * @param {(string | Adapter)} adapter
   * @memberof Mkiso
   */
  public async adapter(adapter: string | AdapterInstance) {
    try {
      if (typeof adapter !== 'string') {
        this._adapter = adapter;
      } else {
        const isPath = adapter !== basename(adapter);
        const m = await import(isPath ? adapter : resolve(__dirname, 'adapters', adapter));
        this._adapter = m.default || m;
      }
      return this;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Starts the burning process.
   *
   * @param {ReadonlyArray<string>} [args=[]]
   * @returns
   * @memberof Mkiso
   */
  public async exec(args: ReadonlyArray<string> = [], options?: execa.Options) {
    try {
      const exists = await this.pathExists(this._source);
      if (!exists) throw new Error(`${this._source} does not exists`);

      const { command, args: defaults } = await this.loadAdapter();
      const exec = execa(command, [...defaults, ...args, this._source], options);

      // Add event listeners
      this.eventNames().forEach(evt => {
        switch (evt) {
          case 'progress':
            exec.stdout.on('data', data => this.emit('progress', data));
            break;
          case 'stderr':
            exec.stderr.on('data', data => this.emit('stderr', data));
            break;
          default:
            exec.on(evt as string, (...eargs) => this.emit(evt, ...eargs));
            break;
        }
      });

      return exec;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Load the configured adapter.
   *
   * @private
   * @returns
   * @memberof Mkiso
   */
  private async loadAdapter() {
    try {
      if (!this._adapter) await this.defaultAdapter();
      if (typeof this._adapter !== 'function') {
        throw new Error('The adapter is not valid');
      }

      const adapter = this._adapter();
      if (adapter.command === undefined || adapter.args === undefined) {
        throw new Error('The adapter is malformed');
      }
      // Check if the command exists
      which.sync(adapter.command);

      if (this._label.length > 0) adapter.label(this._label);
      if (this._publisher.length > 0) adapter.publisher(this._publisher);
      if (this._verbose) adapter.verbose();
      adapter.output(this._output);

      return adapter;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Set the default adapter based on OS platform.
   *
   * @private
   * @memberof Mkiso
   */
  private async defaultAdapter() {
    const adapter = this.defaultAdapters[this._platform];
    if (adapter === undefined) {
      throw new Error(`Failed to find a valid adapter for this platform "${this._platform}"`);
    }
    await this.adapter(adapter);
  }

  /**
   * Promisify access function.
   *
   * @private
   * @param {string} sourcePath
   * @returns
   * @memberof Mkiso
   */
  private async pathExists(sourcePath: string) {
    return new Promise<boolean>(res => {
      access(sourcePath, err => res(!err));
    });
  }
}

export default function mkiso(sourceDir: string) {
  return new Mkiso(sourceDir);
}
