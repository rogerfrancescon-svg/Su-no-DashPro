const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

// In saveVisits
code = code.replace(
  "    } catch (e: any) {\n      console.warn('saveVisits failed:', e);\n      throw e;\n    }",
  "    } catch (e: any) {\n      console.warn('saveVisits failed:', e);\n      // Do not throw to avoid unhandled rejections\n    }"
);

// In other places where supabase is awaited
code = code.replace(
  "const { data: { session } } = await supabase.auth.getSession();",
  "let session = null;\n    try {\n      const res = await supabase.auth.getSession();\n      session = res.data.session;\n    } catch (e) {}\n"
);

fs.writeFileSync('src/lib/storage.ts', code);
