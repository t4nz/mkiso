import { Adapter } from "../adapter";

class Mkisofs implements Adapter {
  public args: string[] = ['-l', '-J', '-R'];
  public command = 'mkisofs';

  public label(name: string) {
    this.args.push('-V', name);
  }

  public publisher(name: string) {
    this.args.push('-P', name);
  }

  public verbose() {
    this.args.push('-v');
  }

  public output(target: string) {
    this.args.push('-o', target);
  }
}

export default function mkisofs() {
  return new Mkisofs();
}
