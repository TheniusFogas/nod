const http = require('http');

http.get('http://localhost:3001/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        let match = data.match(/\\"message\\":\\"(.*?)\\"/);
        if (match) {
            console.log("HIDDEN ERROR MESSAGE:", match[1]);
            let stack = data.match(/\\"stack\\":\\"(.*?)\\"/);
            if (stack) {
                console.log("HIDDEN STACK:", stack[1].replace(/\\\\n/g, '\n').substring(0, 500));
            }
        } else if (data.includes("Something went wrong")) {
            console.log("ERROR BOUNDARY TRIGGERED ON HOMEPAGE");
        } else {
            console.log("OK, Homepage loaded. Length:", data.length);
        }
    });
});
