const crypto = require('crypto');

const stringToSign = "folder=nodflo/content&timestamp=1772758093";
const secret = "vM0ld1fAOudMmfs-BSlB6arekHk";

const signature = crypto.createHash('sha1').update(stringToSign + secret).digest('hex');

console.log('String to sign:', stringToSign);
console.log('Secret:', secret);
console.log('Resulting Signature:', signature);
console.log('Signature from Error (expected):', 'a3d08757f68116b02cae6e0805843f38ae568985');

if (signature === 'a3d08757f68116b02cae6e0805843f38ae568985') {
    console.log('\n[MATCH!] The secret "vM0ld1fAOudMmfs-BSlB6arekHk" is CORRECT for this signature.');
} else {
    console.log('\n[MISMATCH] The secret is INCORRECT.');
}
