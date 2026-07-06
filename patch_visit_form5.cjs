const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
  /<span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">\{formData\.mortalidade\}%<\/span>/,
  '<span className="flex items-center gap-2"><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0)} vivos</span><span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">{formData.mortalidade}%</span></span>'
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
