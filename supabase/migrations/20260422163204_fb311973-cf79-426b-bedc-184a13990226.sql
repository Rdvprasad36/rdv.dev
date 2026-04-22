
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

DELETE FROM public.user_roles WHERE user_id = '361acbe7-5630-48a5-bc15-e0eff9a7e25d';
INSERT INTO public.user_roles (user_id, role) VALUES ('f75344c6-c862-4ff0-9f05-525cd30cf1c9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles SET
  name = 'Durga Venkata Prasad Rapeti',
  tagline = 'AI & Data Science Undergraduate · Full-Stack Developer',
  bio = 'AI & Data Science undergraduate (CGPA 9.38/10) with hands-on experience in machine learning, full-stack development, and AI applications. Built multiple hackathon projects including assistive technologies and productivity platforms. Experienced with Python, Next.js, and NLP-based systems, and passionate about building scalable AI solutions and real-world applications.',
  email = 'rdvprasad36@gmail.com',
  location = 'Visakhapatnam, Andhra Pradesh, India',
  is_available = true,
  github_url = 'https://github.com/Rdvprasad36',
  linkedin_url = 'https://linkedin.com/in/durga-venkata-prasad-rapeti-b154022b7',
  github_username = 'Rdvprasad36',
  leetcode_username = 'Rdv36';

INSERT INTO public.profiles (
  name, tagline, bio, email, location, is_available,
  github_url, linkedin_url, github_username, leetcode_username
)
SELECT 'Durga Venkata Prasad Rapeti',
       'AI & Data Science Undergraduate · Full-Stack Developer',
       'AI & Data Science undergraduate (CGPA 9.38/10) with hands-on experience in machine learning, full-stack development, and AI applications. Built multiple hackathon projects including assistive technologies and productivity platforms. Experienced with Python, Next.js, and NLP-based systems, and passionate about building scalable AI solutions and real-world applications.',
       'rdvprasad36@gmail.com',
       'Visakhapatnam, Andhra Pradesh, India',
       true,
       'https://github.com/Rdvprasad36',
       'https://linkedin.com/in/durga-venkata-prasad-rapeti-b154022b7',
       'Rdvprasad36',
       'Rdv36'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles);

DELETE FROM public.education;
INSERT INTO public.education (institution, degree, field, duration, description, sort_order) VALUES
('Vignan''s Institute of Information Technology (VIIT), Duvvada', 'Bachelor of Technology', 'Artificial Intelligence and Data Science', 'Sep 2023 – Present', 'CGPA: 9.38/10.0. Coursework: Data Structures & Algorithms, Operating Systems & Networks, DBMS, Software Engineering, AI, Machine Learning, Data Science, Computer Networks.', 1);

DELETE FROM public.experience;
INSERT INTO public.experience (role, company, duration, description, tech, sort_order) VALUES
('Club Manager, Student Activity Council (SAC)', 'VIIT', 'Sep 2025 – Present', 'Lead planning and execution of flagship events such as "Yuvatarang 2K26", managing sports and co-curricular events end-to-end. Initiated community-focused green initiatives and sustainability drives.', '{Leadership,"Event Management"}', 1),
('AI/ML Intern', 'InternPro', 'Jul 2025 – Aug 2025', 'Built an NLP-based AI interview chatbot that simulated technical interviews and automated candidate screening. Implemented ML/NLP-driven simulation features for intelligent question generation and response analysis.', '{Python,NLP,"Machine Learning"}', 2),
('Web Development Intern', 'Vault of Codes (Remote)', 'Jun 2025 – Jul 2025', 'Completed a one-month front-end focused internship. Delivered 5 hands-on tasks translating designs into responsive, interactive UIs.', '{HTML,CSS,JavaScript}', 3),
('Machine Learning Intern', 'Google for Developers – EduSkills (Virtual)', 'Jan 2025 – Mar 2025', '10-week AI/ML virtual internship focused on core and applied machine learning, exploring AI integration with full-stack apps.', '{Python,"Machine Learning",AI}', 4);

DELETE FROM public.projects;
INSERT INTO public.projects (title, description, tech_stack, repo_url, live_url, timeline, featured, sort_order) VALUES
('StudyXpert', 'Full-stack learning assistant platform that helps students organize notes, track progress, and access resources from a unified dashboard. Built REST APIs and modular components, deployed on Vercel.', '{TypeScript,"Next.js","Node.js","REST API",Vercel}', 'https://github.com/Rdvprasad36', NULL, '2025', true, 1),
('BusBuddy', 'Bus-tracking and information platform helping students monitor routes, timings, and availability in real time. Clean component-based front-end architecture using TypeScript.', '{TypeScript,"Web App"}', 'https://github.com/Rdvprasad36', NULL, '2025', true, 2),
('BlindGo', 'Assistive system for the visually impaired using smart glasses with real-time audio navigation.', '{Python,AI,IoT}', 'https://github.com/Rdvprasad36', NULL, '2024', false, 3),
('AAA — Child-Friendly Learning', 'Gamified learning platform with AI-powered storytelling for children.', '{AI,"Web App",Gamification}', 'https://github.com/Rdvprasad36', NULL, '2024', false, 4),
('Verdex', 'Tool to understand the energy consumption and environmental impact of AI models.', '{Python,AI,Sustainability}', 'https://github.com/Rdvprasad36', NULL, '2024', false, 5);

DELETE FROM public.skills;
INSERT INTO public.skills (name, category, proficiency, sort_order) VALUES
('Python', 'Languages', 95, 1),
('JavaScript', 'Languages', 88, 2),
('TypeScript', 'Languages', 85, 3),
('C / C++', 'Languages', 85, 4),
('Java', 'Languages', 75, 5),
('Machine Learning', 'AI / ML', 90, 6),
('Deep Learning', 'AI / ML', 85, 7),
('NLP', 'AI / ML', 85, 8),
('TensorFlow', 'AI / ML', 80, 9),
('PyTorch', 'AI / ML', 80, 10),
('Scikit-learn', 'AI / ML', 85, 11),
('Pandas / NumPy', 'AI / ML', 90, 12),
('Next.js', 'Web', 88, 13),
('Node.js / Express', 'Web', 85, 14),
('REST APIs', 'Web', 88, 15),
('HTML / CSS', 'Web', 92, 16),
('Supabase', 'Cloud / DB', 85, 17),
('Google Cloud Platform', 'Cloud / DB', 75, 18),
('SQL / NoSQL', 'Cloud / DB', 82, 19),
('Git / GitHub', 'Tools', 90, 20),
('Docker', 'Tools', 75, 21),
('LangChain', 'AI Tools', 80, 22),
('n8n / AI Workflows', 'AI Tools', 78, 23),
('Vercel / Netlify', 'Deployment', 88, 24);

DELETE FROM public.achievements;
INSERT INTO public.achievements (title, description, date, sort_order) VALUES
('CodeChef Rating: 1200', 'Solved 250+ programming problems on CodeChef.', '2025', 1),
('30+ Competitive Programming Contests', 'Active participation across LeetCode and CodeChef.', '2025', 2),
('Top 3 — Quantum Valley Hackathon 2025', 'Internal round finalist.', '2025', 3),
('National Finalist — HackVyuha 2025', 'Selected as a national finalist.', '2025', 4),
('Top 10 — Smart Innovation Hackathon 2025', 'Top 10 finish.', '2025', 5),
('Top 4 — SusHacks ''25 VIIT', 'Top 4 placement.', '2025', 6),
('Winner — Smart India Hackathon 2024', 'Winner of the internal round.', '2024', 7);
