-- Tighten post_likes policies
DROP POLICY IF EXISTS "Anyone can like a post" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can unlike using their visitor id" ON public.post_likes;

CREATE POLICY "Anyone can like a post"
ON public.post_likes FOR INSERT
WITH CHECK (visitor_id IS NOT NULL AND length(visitor_id) BETWEEN 8 AND 128);

CREATE POLICY "Anyone can unlike a post"
ON public.post_likes FOR DELETE
USING (visitor_id IS NOT NULL AND length(visitor_id) BETWEEN 8 AND 128);

-- Tighten inquiries insert
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;

CREATE POLICY "Anyone can submit an inquiry"
ON public.inquiries FOR INSERT
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) BETWEEN 1 AND 5000
);