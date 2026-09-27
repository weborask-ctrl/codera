// Compare encoded H.264 payloads, independent of MP4 container metadata.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

function payloads(bytes) {
  const result = [];
  for (let offset = 0; offset < bytes.length;) {
    let size = bytes.readUInt32BE(offset), header = 8;
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (size === 1) { size = Number(bytes.readBigUInt64BE(offset + 8)); header = 16; }
    if (size === 0) size = bytes.length - offset;
    assert(size >= header && offset + size <= bytes.length, 'Invalid MP4 box');
    if (type === 'mdat') result.push(bytes.subarray(offset + header, offset + size));
    offset += size;
  }
  return result;
}
const hash = arrays => { const digest = createHash('sha256'); for (const bytes of arrays) digest.update(bytes); return digest.digest('hex'); };
const root = 'public/motion/metal/';
const original = hash(payloads(await readFile(`${root}journey-scroll-1080.mp4`)));
const fragments = [];
for (let i = 1; i <= 220; i++) fragments.push(...payloads(await readFile(`${root}stream-v1/segment-${String(i).padStart(3, '0')}.m4s`)));
assert.equal(hash(fragments), original, 'Streaming must preserve every original encoded video byte');
console.log(`PASS all 220 fragments preserve encoded H.264 payload ${original}`);
