-- Caso as políticas de RLS estejam ativadas e bloqueando o acesso, você pode desativá-las
-- ou criar uma política permitindo acesso.

-- Para desativar o RLS (mais fácil para testes):
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;

-- OU para permitir que usuários autenticados acessem seus próprios registros:
-- ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir leitura para o próprio usuário" ON registros FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Permitir inserção para o próprio usuário" ON registros FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Permitir atualização para o próprio usuário" ON registros FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Permitir deleção para o próprio usuário" ON registros FOR DELETE USING (auth.uid() = user_id);
