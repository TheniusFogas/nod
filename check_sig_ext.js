const crypto = require('crypto');

const timestamp = "1772759421";
const folder = "nodflo/content";
const secret = "vM0ld1fAOudMmfs-BSlB6arekHk";
const target = "1f560e6baf26490d3ff3e5e9ef2c59a0140005";

// Cloudinary signing logic:
// 1. Sort parameters alphabetically by key.
// 2. Join with & and =.
// 3. Append secret.
// 4. SHA1.

const tests = [
    { name: "Standard Alpha", str: `folder=${folder}&timestamp=${timestamp}` },
    { name: "Timestamp Only", str: `timestamp=${timestamp}` },
    { name: "Empty Folder", str: `folder=&timestamp=${timestamp}` },
    { name: "Encoded Slash", str: `folder=nodflo%2Fcontent&timestamp=${timestamp}` },
    { name: "Reverse Alpha", str: `timestamp=${timestamp}&folder=${folder}` },
    { name: "No Folder Param", str: `timestamp=${timestamp}` },
    { name: "With Public ID? (None sent)", str: `timestamp=${timestamp}` },
    { name: "Cloudinary SDK internal order?", str: `folder=nodflo/content&timestamp=1772759421` },
    { name: "With Secret prefix? (Unlikely)", str: secret + `folder=${folder}&timestamp=${timestamp}` },
    { name: "Double Ampersand quirk?", str: `folder=${folder}&&timestamp=${timestamp}` }
];

console.log(`Target: ${target}\n`);

tests.forEach(t => {
    const sig = crypto.createHash('sha1').update(t.str + secret).digest('hex');
    console.log(`${sig === target ? '[MATCH!] ' : '         '}${t.name.padEnd(25)}: ${sig} (using "${t.str}")`);
});

// Maybe the secret has a whitespace?
const withSpace = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}` + secret + " ").digest('hex');
console.log(`\nSecret with trailing space: ${withSpace}`);
