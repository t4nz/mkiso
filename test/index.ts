import assert from 'assert';
import { unlinkSync } from 'fs';
import {} from 'mocha';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { default as mkiso } from '../src/index';

describe('Mkiso test', () => {
  before(function(done) {
    this.sourceDir = resolve('test/fake');
    this.outputIso = join(tmpdir(), 'image.iso');
    this.outputListenerIso = join(tmpdir(), 'imagelis.iso');
    done();
  });

  after(function(done) {
    unlinkSync(this.sourceDir.concat('.iso'));
    unlinkSync(this.outputIso);
    unlinkSync(this.outputListenerIso);
    done();
  });

  it('creates an iso image', async function() {
    this.timeout(15000);
    const res = await mkiso(this.sourceDir)
      .label('iso label')
      .publisher('Elen Gadreel')
      .exec();
    return assert.ok(res);
  });

  it('creates an iso image with destination name', async function() {
    const res = await mkiso(this.sourceDir)
      .label('electronics')
      .output(this.outputIso)
      .exec();
    return assert.ok(res);
  });

  it('listeners', async function() {
    this.timeout(15000);
    const res = await mkiso(this.sourceDir)
      .output(this.outputListenerIso)
      .verbose()
      .on('error', err => console.error('Error:', err))
      .on('progress', msg => console.log('onProgress:', msg))
      .on('close', (code, signal) => console.log('onClose:', code, signal))
      .exec();

    return assert.ok(res);
  });
});
