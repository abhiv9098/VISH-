const fs = require('fs');

['src/app/admin/prices/page.tsx', 'src/app/admin/orders/page.tsx'].forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<div className="flex items-center gap-2 flex-wrap">[\s\S]*?<\/div>/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
});

let adminMain = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
adminMain = adminMain.replace(/<button[\s\S]*?\+ Test Local Order[\s\S]*?<\/button>/g, '');
fs.writeFileSync('src/app/admin/page.tsx', adminMain, 'utf8');

console.log('Successfully removed buttons');
