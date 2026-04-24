
-- Add 'category' column to experience to separate work experience from leadership/activities
ALTER TABLE public.experience ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'experience';

-- Create logos table for the logo design portfolio section on the Projects page
CREATE TABLE IF NOT EXISTS public.logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  client text,
  year text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logos are publicly viewable"
  ON public.logos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage logos"
  ON public.logos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_logos_updated_at
  BEFORE UPDATE ON public.logos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create the 'logos' storage bucket for logo design uploads (public so the gallery can render images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Logo images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update logo images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete logo images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'logos' AND public.has_role(auth.uid(), 'admin'::app_role));
