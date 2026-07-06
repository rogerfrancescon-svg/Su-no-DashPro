const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const regex = /<div className="space-y-2">\s*<label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">[\s\S]*?<\/div>/;
const match = code.match(regex);
if (match && match[0].includes('Volume Total Cargas')) {
  code = code.replace(match[0], '');
  fs.writeFileSync('src/components/VisitForm.tsx', code);
  console.log('Removed old Volume Total Cargas block');
} else {
  console.log('Block not found');
}
