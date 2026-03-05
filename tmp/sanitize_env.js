const fs = require('fs');

function replaceEnvKeys(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Remove ANY existing cloudname, key, secret
    content = content.replace(/^.*CLOUDINARY_CLOUD_NAME.*$/gm, '');
    content = content.replace(/^.*NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.*$/gm, '');
    content = content.replace(/^.*CLOUDINARY_API_KEY.*$/gm, '');
    content = content.replace(/^.*CLOUDINARY_API_SECRET.*$/gm, '');

    // Append the correct ones
    content += `\nNEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dsy11x1je"`;
    content += `\nCLOUDINARY_API_KEY="257811981813534"`;
    content += `\nCLOUDINARY_API_SECRET="vM0ld1fAOudMmfs-BSlB6arekHk"\n`;

    // Clean up multiple empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    fs.writeFileSync(file, content.trim() + '\n');
    console.log(`Sanitized ${file}`);
}

replaceEnvKeys('.env.local');
replaceEnvKeys('.env.production.local');
