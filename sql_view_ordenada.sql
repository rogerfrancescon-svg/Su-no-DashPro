-- Este script cria uma VIEW (uma tabela virtual) no Supabase
-- que sempre exibirá os registros ordenados de forma idêntica à aba de Lançamentos do aplicativo.
-- Você pode executar este script na aba "SQL Editor" do Supabase.

CREATE OR REPLACE VIEW registros_ordenados AS
SELECT *
FROM registros
ORDER BY "Data" DESC, "Integrado" ASC;

-- Após rodar este script, você verá uma nova "tabela" chamada registros_ordenados
-- no menu do Supabase. Ela conterá os mesmos dados, mas sempre na ordem correta!
