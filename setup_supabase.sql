CREATE TABLE IF NOT EXISTS public.registros (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "Data" TEXT,
  "Integrado" TEXT,
  "Alojamento" TEXT,
  "Idade" NUMERIC,
  "Animais Alojados" NUMERIC,
  "Animais Mortos" NUMERIC,
  "Vol. Cargas (kg)" NUMERIC,
  "Recomendação" TEXT,
  "Consumo acumulado" NUMERIC,
  "Mortalidade" NUMERIC,
  "Comedouro" TEXT,
  "Colaborador" TEXT,
  "Meta Alojamento" NUMERIC,
  "Consumo Alojamento" NUMERIC,
  "Meta Crescimento 1" NUMERIC,
  "Consumo Crescimento 1" NUMERIC,
  "Meta Crescimento 2" NUMERIC,
  "Consumo Crescimento 2" NUMERIC,
  "Meta Crescimento 3" NUMERIC,
  "Consumo Crescimento 3" NUMERIC,
  "Meta Terminação 1" NUMERIC,
  "Consumo Terminação 1" NUMERIC,
  "Meta Terminação 2" NUMERIC,
  "Consumo Terminação 2" NUMERIC,
  "Consumo Acumulado Real" NUMERIC,
  "Meta Acumulada" NUMERIC,
  "Peso aloj" NUMERIC,
  "Pontuação Sanitária" NUMERIC,
  "user_id" UUID DEFAULT auth.uid()
);

ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas caso existam
DROP POLICY IF EXISTS "Acesso total para usuários logados" ON public.registros;
DROP POLICY IF EXISTS "Users can insert their own records" ON public.registros;
DROP POLICY IF EXISTS "Users can view their own records" ON public.registros;
DROP POLICY IF EXISTS "Users can update their own records" ON public.registros;
DROP POLICY IF EXISTS "Users can delete their own records" ON public.registros;

-- Política de RLS corrigida e segura (Apenas o dono pode ler/escrever seus próprios registros)
CREATE POLICY "Users can insert their own records" ON public.registros FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own records" ON public.registros FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own records" ON public.registros FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own records" ON public.registros FOR DELETE TO authenticated USING (auth.uid() = user_id);

