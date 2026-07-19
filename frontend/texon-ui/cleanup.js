const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'app');

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Replace mx-auto space-y-6 with space-y-8
  content = content.replace(/mx-auto space-y-6/g, 'mx-auto space-y-8');

  // Replace CardHeader pb-[number]
  content = content.replace(/(<CardHeader[^>]*className="[^"]*)\bpb-[0-9]\b([^"]*")/g, (match, p1, p2) => {
    let newClass = (p1 + p2).replace(/className="\s+/g, 'className="').replace(/\s+"/g, '"').replace(/\s{2,}/g, ' ');
    if (newClass.includes('className=""')) {
      newClass = newClass.replace(/\s*className=""/, '');
    }
    return newClass;
  });

  // Second pass for CardHeader pb-[number] (in case of multiple or if the regex missed it due to group overlaps, though unlikely)
  content = content.replace(/(<CardHeader[^>]*className="[^"]*)\bpb-[0-9]\b([^"]*")/g, (match, p1, p2) => {
    let newClass = (p1 + p2).replace(/className="\s+/g, 'className="').replace(/\s+"/g, '"').replace(/\s{2,}/g, ' ');
    if (newClass.includes('className=""')) {
      newClass = newClass.replace(/\s*className=""/, '');
    }
    return newClass;
  });

  // Replace CardContent p-[number] EXCEPT p-0
  content = content.replace(/(<CardContent[^>]*className="[^"]*)\bp-[1-9]\b([^"]*")/g, (match, p1, p2) => {
    let newClass = (p1 + p2).replace(/className="\s+/g, 'className="').replace(/\s+"/g, '"').replace(/\s{2,}/g, ' ');
    if (newClass.includes('className=""')) {
      newClass = newClass.replace(/\s*className=""/, '');
    }
    return newClass;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', filePath);
  }
});
