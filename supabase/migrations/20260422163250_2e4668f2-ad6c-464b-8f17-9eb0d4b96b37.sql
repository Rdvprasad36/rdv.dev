
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS codechef_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

UPDATE public.profiles SET
  codechef_url = 'https://www.codechef.com/users/rdvprasad36',
  portfolio_url = 'https://portifolio94.vercel.app/';
