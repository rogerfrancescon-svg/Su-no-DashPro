DROP TABLE IF EXISTS registros;

CREATE TABLE registros (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  data TEXT,
  integrado TEXT,
  alojamento TEXT,
  idade NUMERIC,
  recomendacao TEXT,
  consumo_acumulado NUMERIC,
  mortalidade NUMERIC,
  comedouro TEXT,
  colaborador TEXT,
  consumos_racao_meta TEXT,
  peso_aloj NUMERIC,
  pontuacao_sanitaria NUMERIC,
  user_id UUID DEFAULT auth.uid()
);

ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total para usuários logados" 
ON registros 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
