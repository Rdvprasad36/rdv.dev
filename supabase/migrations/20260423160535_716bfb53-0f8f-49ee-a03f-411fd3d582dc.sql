-- Add deployed status to projects
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS is_deployed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deploy_url text;

-- Add post_date override (admin-editable date) to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS post_date timestamp with time zone;

-- Add phone to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- Dynamic Overview sections (admin can add unlimited cards)
CREATE TABLE IF NOT EXISTS public.overview_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.overview_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Overview sections are publicly viewable"
  ON public.overview_sections FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage overview sections"
  ON public.overview_sections FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_overview_sections_updated_at
  BEFORE UPDATE ON public.overview_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed phone + initial overview sections
UPDATE public.profiles SET phone = '7382612327' WHERE phone IS NULL;

INSERT INTO public.overview_sections (title, description, icon, sort_order) VALUES
  ('FullStack Development', 'Strong foundation in web development, creating user-friendly and scalable web applications.', 'Layers', 1),
  ('Design Thinking', 'Incorporating design principles and user-centric methodologies to create innovative solutions.', 'Palette', 2),
  ('UI/UX', 'Crafting intuitive and visually appealing interfaces, focusing on usability and responsive design.', 'Monitor', 3),
  ('Exploring Open Source', 'Rebuilding open-source projects and exploring new technologies to enhance development skills.', 'Github', 4);
