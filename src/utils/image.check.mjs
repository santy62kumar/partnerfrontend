/**
 * Self-check for the image compressor's sizing math and passthrough rules.
 *   node src/utils/image.check.mjs
 *
 * Canvas encoding needs a browser, so this stubs the DOM and asserts the parts
 * that can silently regress: the fit calculation, never upscaling, and that
 * non-images and failed decodes come back untouched.
 */

const ok = (cond, label) => {
  if (!cond) throw new Error(`FAIL: ${label}`);
};

// ── Minimal DOM/browser stubs ────────────────────────────────────────────────
let lastDraw = null;

globalThis.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      fillRect() {},
      drawImage(_source, _x, _y, width, height) {
        lastDraw = { width, height };
      },
    }),
    toBlob(callback) {
      // Pretend the encoder produces ~0.15 bytes per pixel.
      callback({ size: Math.round(lastDraw.width * lastDraw.height * 0.15) });
    },
  }),
};

globalThis.File = class File {
  constructor(parts, name, options) {
    this.size = parts[0]?.size ?? 0;
    this.name = name;
    this.type = options?.type;
  }
};

const { captureVideoFrame, compressImageFile, MAX_IMAGE_DIMENSION } = await import('./image.js');

// ── Capture: a 4K sensor frame must be scaled down, aspect ratio preserved ───
await captureVideoFrame({ videoWidth: 4032, videoHeight: 3024 });
ok(lastDraw.width === MAX_IMAGE_DIMENSION, `4032px wide -> ${lastDraw.width}, want ${MAX_IMAGE_DIMENSION}`);
ok(lastDraw.height === 960, `aspect ratio lost: got ${lastDraw.height}, want 960`);

// Portrait: the long edge is the one that gets capped.
await captureVideoFrame({ videoWidth: 1080, videoHeight: 1920 });
ok(lastDraw.height === MAX_IMAGE_DIMENSION, `portrait long edge -> ${lastDraw.height}`);
ok(lastDraw.width === 720, `portrait short edge -> ${lastDraw.width}, want 720`);

// Already small: must NOT upscale, that would make the file bigger.
await captureVideoFrame({ videoWidth: 640, videoHeight: 480 });
ok(lastDraw.width === 640 && lastDraw.height === 480, `upscaled a small frame to ${lastDraw.width}`);

// A video with no reported dimensions is not ready to capture yet.
ok(await captureVideoFrame({ videoWidth: 0, videoHeight: 0 }) === null, 'zero-dimension video should not capture');

// ── File compression ─────────────────────────────────────────────────────────
globalThis.createImageBitmap = async () => ({ width: 4032, height: 3024, close() {} });

const bigPhoto = { type: 'image/jpeg', name: 'site.jpeg', size: 9_000_000 };
const shrunk = await compressImageFile(bigPhoto);
ok(shrunk !== bigPhoto, 'large photo was not compressed');
ok(shrunk.size < bigPhoto.size, `compressed size ${shrunk.size} not below ${bigPhoto.size}`);
ok(shrunk.size < 5 * 1024 * 1024, `compressed ${shrunk.size} still over the 5MB backend limit`);
ok(shrunk.name === 'site.jpg', `expected .jpg rename, got ${shrunk.name}`);

// Non-images must pass through byte-identical — compressing a PDF would corrupt it.
const pdf = { type: 'application/pdf', name: 'report.pdf', size: 200_000 };
ok((await compressImageFile(pdf)) === pdf, 'PDF was not passed through');
ok((await compressImageFile(undefined)) === undefined, 'undefined input must pass through');

// An already-small image must not be replaced by a larger re-encode.
globalThis.createImageBitmap = async () => ({ width: 320, height: 240, close() {} });
const tiny = { type: 'image/png', name: 'icon.png', size: 900 };
ok((await compressImageFile(tiny)) === tiny, 'small image was replaced by a bigger re-encode');

// A decode failure must fall back to the original, never block the upload.
globalThis.createImageBitmap = async () => {
  throw new Error('corrupt');
};
const broken = { type: 'image/jpeg', name: 'broken.jpg', size: 1234 };
ok((await compressImageFile(broken)) === broken, 'decode failure did not fall back to the original');

console.log('image compression: all checks passed');
