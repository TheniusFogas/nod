const crypto = require('crypto');

const stringToSign = "folder=nodflo/content&timestamp=1772759421";
const secret = "vM0ld1fAOudMmfs-BSlB6arekHk"; // The 27-char secret found

const signature = crypto.createHash('sha1').update(stringToSign + secret).digest('hex');

console.log('String to sign:', stringToSign);
console.log('Secret:', secret);
console.log('Resulting Signature:', signature);
console.log('Signature from Error (expected):', '1f560e6baf26490d3ff3e5e9ef2c59a0140005');

if (signature === '1f560e6baf26490d3ff3e5e9ef2c59a0140005') {
    console.log('\n[MATCH!] This secret is exactly what produced the error. Wait, if it matches, why is it invalid? Oh, maybe it matches the SERVER calculation but not CLOUDINARY?');
} else {
    console.log('\n[MISMATCH] The secret is STILL WRONG.');
}
