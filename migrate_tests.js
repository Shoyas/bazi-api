const fs = require('fs');
const path = require('path');

const files = [
  'src/app/modules/user/user.service.test.ts',
  'src/app/modules/bazi/bazi.service.test.ts',
  'src/app/modules/bazi/bazi.integration.test.ts',
  'src/app/modules/apiKey/apiKey.service.test.ts'
];

files.forEach(file => {
  const parts = file.split('/');
  const moduleName = parts[3];
  const fileName = parts[4];
  
  const targetDir = path.join('test', 'modules', moduleName);
  fs.mkdirSync(targetDir, { recursive: true });
  
  const targetPath = path.join(targetDir, fileName);
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace ../../../ with ../../../src/
  content = content.replace(/\.\.\/\.\.\/\.\.\//g, '../../../src/');
  
  // Replace relative imports (e.g., ./user.service) with absolute-like relative path
  content = content.replace(/'\.\/([^']+)'/g, `'../../../src/app/modules/${moduleName}/$1'`);
  
  fs.writeFileSync(targetPath, content);
  fs.unlinkSync(file);
});

console.log('Migration complete!');
