-- Allow service role to insert user roles (for admin setup)
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
USING (true)
WITH CHECK (true);