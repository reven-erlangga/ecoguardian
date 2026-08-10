// Self-check untuk logic murni Twitter Service (tanpa infra).
// Jalankan: node test/check.js
import { validateTweet, generateReplyMessage, detectLocation } from '../src/ingest.js';

let pass = 0, fail = 0;
function assert(name, cond) {
  if (cond) { pass++; console.log(`✓ ${name}`); }
  else { fail++; console.error(`✗ ${name}`); }
}

// validateTweet
assert('media kosong → butuh media', JSON.stringify(validateTweet([], false)) === JSON.stringify(['media', 'location']));
assert('ada media + lokasi → ok', validateTweet(['x'], true).length === 0);
assert('media ada, lokasi tidak', JSON.stringify(validateTweet(['x'], false)) === JSON.stringify(['location']));

// generateReplyMessage
assert('reply media', generateReplyMessage(['media']).toLowerCase().includes('gambar'));
assert('reply lokasi', generateReplyMessage(['location']).toLowerCase().includes('lokasi'));
assert('reply gabungan', generateReplyMessage(['media', 'location']).split(' ').length > 2);

// detectLocation
assert('deteksi "di Bandung"', detectLocation('ada banjir di Bandung') === true);
assert('deteksi "jalan Sudirman"', detectLocation('jl. Sudirman kebanjiran') === true);
assert('tanpa lokasi', detectLocation('lapor ya, terima kasih') === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
