Discover Oman — Intelligent Tourism Planner
I built this project for a frontend coding competition to solve a common travel headache: planning a multi-day trip that actually makes sense geographically and budget-wise.
Most planners just give you a list of spots; this app uses a multi-objective scoring model and route optimization to build a full schedule. The best part? It’s 100% client-side. No servers, no APIs, just pure browser-based logic.
Project can be run from my GitHub
Tech & Tools:
I chose these tools to keep the app fast, type-safe, and easy to scale:
Core: React 18 + TypeScript
Build Tool: Vite 5 (insanely fast HMR)
Styling: Tailwind CSS + shadcn/ui (for that clean, accessible look)
Maps: Leaflet.js (lightweight and open-source)
Animation: Framer Motion
State: React Context + LocalStorage (zero-latency persistence)

Starting up the website:
If you want to run my project locally, you're going to need to have Node.js installed.
code
Bash

# Clone it

git clone <YOUR_GIT_URL>
cd discover-oman

# Install dependencies

npm install

# run the dev server

npm run dev

Itinerary Algorithm ("The Brain")
The core of the app is a two-phase optimization engine I wrote in planner.ts.
Phase A: Region Allocation
Instead of just picking random spots, the app first decides which regions (like Muscat, Dhofar, or Ad Dakhiliyah) deserve your time. It scores regions based on:
Season Fit: (e.g., Is it Khareef season in Salalah?)
User Interests: Does the region have the categories you actually picked?
Logarithmic Scaling: This prevents one huge region from hogging the whole trip.
Phase B: Daily Routing (The Math Part)
Once the days are assigned to regions, it picks the best stops using:
Multi-Objective Scoring: It ranks every spot based on your budget, crowd preferences, and the "detour penalty."
Nearest Neighbor Heuristic: A quick first pass to order the stops.
2-opt Local Search: A classic optimization algorithm that "untangles" the route to minimize driving distance.
Fatigue Management: It automatically inserts "rest gaps" (short stops) between long activities so the user doesn't burn out during their travel here in Oman.

Scoring & Weights:
I didn't want the results to be "random," so I created a weighted scoring formula:
Component Weight Why?
Interests 0.30 If you want "Nature," that should be the priority.
Season 0.20 Oman's weather varies wildly; this ensures you're in the right place at the right time.
Crowds/Cost 0.25 Penalizes overcrowded or over-budget spots.
Detour 0.15 Minimizes time spent in the car.
Diversity 0.10 Makes sure you don't just see 5 forts in one day.

State Management & Rendering
Since this is a specialized tool, I used React Context for global stuff (like the English/Arabic toggle) and LocalStorage for everything else. This means you can close your tab, come back a week later, and your trip is still there—no database required. (No redux!)
CSR (Client-Side Rendering)
I went with a Single Page Application (SPA) approach.
Why? The dataset (50 curated locations) is small enough to bundle as a static JSON.
Performance: The generation algorithm runs in < 5ms. Since the data is already in the browser, there are zero "loading" spinners when navigating.

Performance Optimizations
Memoization: I used useMemo for heavy calculations like filtering the 50-stop dataset so the UI stays buttery smooth.
Static Assets: All destination data is bundled at build time, so the app works instantly even on slow connections.
Static Assets: All destination data is bundled at build time, so the app works instantly even on slow connections.

To be transparent, these are some tradeoffs and limitations my project contains:
Haversine vs. Roads: I used the Haversine formula for distances. In the Omani mountains, the actual driving time might be 1.5x longer, but for accurate routing, the API would need a server.
Static Data: The list of spots is hardcoded in a JSON. In a "real" production app, I'd pull this from a CMS like Sanity or Strapi.
Browser Storage: If you clear your browser data, your saved trips are gone. (no login = better privacy)
One plan at a time: Generating a new plan overwrites the old one. There's no history or comparison feature.

Budget Logic
The app isn't just guessing. It calculates:
Fuel: Based on actual estimated distance and average OMR/L.
Hotel: Tiered (Budget/Mid/Luxury) based on your daily spending limit.
Food: A flat daily rate multiplied by the number of travelers.
