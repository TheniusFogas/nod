const fs = require('fs');
const html = fs.readFileSync('err.html', 'utf8');
const match = html.match(/"message":"(.*?)"/);
if (match) console.log("Message:", match[1]);
const match2 = html.match(/"stack":"(.*?)"/);
if (match2) console.log("Stack:", match2[1].replace(/\\n/g, '\n'));
