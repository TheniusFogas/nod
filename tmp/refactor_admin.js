const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/nodflo/app/admin');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('/api/upload/blob')) {
        const regex = /const\s+(\w+)\s*=\s*await\s*fetch\(`\/api\/upload\/blob(?:[^`]+)?`,\s*\{\s*method:\s*"POST",\s*body:\s*([^}]+)\s*\}\);/g;

        const newContent = content.replace(regex, (match, resVar, fileVar) => {
            return `const __fd = new FormData(); __fd.append("file", ${fileVar.trim()}); __fd.append("folder", "nodflo/content"); const ${resVar} = await fetch("/api/upload", { method: "POST", body: __fd });`;
        });

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Updated:', file);
            changedFiles++;
        } else {
            console.log('File matched but regex failed to replace:', file);
        }
    }
});
console.log(`Refactored ${changedFiles} files.`);
