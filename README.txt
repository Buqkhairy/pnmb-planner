PNMB Production Planner - team version (Netlify + GitHub)
=========================================================
public/index.html                  the planner page
netlify/functions/planner.mjs      saves and shares the team data (Netlify Blobs)
netlify/functions/seed.mjs         starting machine list with speeds and setup times
netlify.toml, package.json         Netlify settings

Put it on GitHub (no command line needed)
  1. Sign in at https://github.com, click + > New repository, name it  pnmb-planner, choose Private, click Create.
  2. On the new repository page click "uploading an existing file".
  3. Unzip this package, open the folder, select EVERYTHING inside it (public, netlify, package.json,
     netlify.toml, .gitignore, README.txt) and drag it into the GitHub page.
     (If .gitignore is hidden on your computer you can skip it.)
  4. Click "Commit changes".

Connect GitHub to your Netlify site so every change goes live by itself
  1. Netlify > your site (pnmbplanning) > Site configuration > Build & deploy > Continuous deployment > Link repository.
  2. Choose GitHub, allow access, pick pnmb-planner, branch main. Publish directory: public. Functions directory: netlify/functions.
  3. Site configuration > Environment variables > add TEAM_KEY = your team password (recommended).
  4. Deploys > Trigger deploy. Open https://pnmbplanning.netlify.app in two browsers to check
     both show "Live - shared with team".
