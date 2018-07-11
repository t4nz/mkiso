import { Adapter } from "../adapter";

class Hdiutil implements Adapter {
  public args: string[] = ['makehybrid', '-iso', '-joliet'];
  public command = 'hdiutil';

  public label(name: string) {
    this.args.push('-default-volume-name', name);
  }

  public publisher(name: string) {
    this.args.push('-publisher', name);
  }

  public verbose() {
    this.args.push('-verbose');
  }

  public output(target: string) {
    this.args.push('-o', target);
  }
}

export default function hdiutil() {
  return new Hdiutil();
}
