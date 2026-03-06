const crypto = require('crypto');

const timestamp = "1772759421";
const folder = "nodflo/content";
const secret = "vM0ld1fAOudMmfs-BSlB6arekHk";
const expected = "1f560e6baf26490d3ff3e5e9ef2c59a0140005";

const variations = [
    `folder=${folder}&timestamp=${timestamp}`,
    `timestamp=${timestamp}&folder=${folder}`,
    `timestamp=${timestamp}`,
    `folder=${folder}`,
    `folder=${encodeURIComponent(folder)}&timestamp=${timestamp}`,
    `timestamp=${timestamp}&folder=${encodeURIComponent(folder)}`,
];

console.log('Target Signature:', expected);
console.log('--- Testing Variations ---');

variations.forEach(v => {
    const sig = crypto.createHash('sha1').update(v + secret).digest('hex');
    console.log(`String: "${v}" -> Sig: ${sig} ${sig === expected ? '[MATCH!]' : ''}`);
});
