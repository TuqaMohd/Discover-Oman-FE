<h1 align="center">🇴🇲 Discover Oman — Intelligent Tourism Planner</h1>

<p align="center">
<img src="https://img.shields.io/badge/React_18-007ACC?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

 Project Overview

Discover Oman is a completely front-end only website made specifically for tourists who want to visit Oman, but struggle making plans or finding attractions online.

Most planners only illustrate a list of spots. However, this project uses a multi-objective scoring model and route optimization to build a full schedule. The best part? It’s 100% client-side. No servers, no APIs, just pure browser-based logic.

 1. Tech & Tools

I chose those tools to keep the app fast, type-safe, and easy to scale:

Category	Tools
Core	React 18 + TypeScript
Build Tool	Vite 5 (insanely fast HMR)
Styling	Tailwind CSS + shadcn/ui (clean, accessible look)
Maps	Leaflet.js (lightweight and open-source)
Animation	Framer Motion
State	React Context + LocalStorage (zero-latency persistence)
 2. Starting up the website

If you want to run my project locally, you're going to need to have Node.js installed.

code
Bash
download
content_copy
expand_less
# Clone it
git clone <https://github.com/TuqaMohd/Discover-Oman-FE>
cd discover-oman-fe

# Install dependencies
npm install

# Run the dev server
npm run dev

Otherwise, you can easily access it via GitHub: https://github.com/TuqaMohd/Discover-Oman-FE

 3. Itinerary Algorithm ("The Brain")

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

 4. Scoring & Weights

I didn't want the results to be "random," so I created a weighted scoring formula:

Component	Weight	Why?
Interests	0.30	If you want "Nature," that should be the priority.
Season	0.20	Oman's weather varies wildly; ensures you're in the right place.
Crowds/Cost	0.25	Penalizes overcrowded or over-budget spots.
Detour	0.15	Minimizes time spent in the car.
Diversity	0.10	Makes sure you don't just see 5 forts in one day.
 5. State Management & Rendering

Since this is a specialized tool, I used React Context for global stuff (like the English/Arabic toggle) and LocalStorage for everything else. This means you can close your tab, come back a week later, and your trip is still there—no database required.

No Redux! I chose a Single Page Application (SPA) approach for better performance.

CSR (Client-Side Rendering): The dataset (50 curated locations) is small enough to bundle as a static JSON.

Performance: The generation algorithm runs in < 5ms. Since the data is already in the browser, there are zero "loading" spinners when navigating.

 6. Performance Optimizations

Memoization: I used useMemo for heavy calculations like filtering the 50-stop dataset so the UI stays buttery smooth.

Static Assets: All destination data is bundled at build time, so the app works instantly even on slow connections.

 7. Limitations & Tradeoffs

To be transparent, these are some tradeoffs and limitations my project contains:

Haversine vs. Roads: I used the Haversine formula for distances. In the Omani mountains, the actual driving time might be 1.5x longer.

Static Data: The list of spots is hardcoded in a JSON. In a "real" production app, I'd pull this from a CMS like Sanity or Strapi.

Browser Storage: If you clear your browser data, your saved trips are gone. (no login = better privacy)

One plan at a time: Generating a new plan overwrites the old one. There's no history or comparison feature.

 8. Budget Logic

The app isn't just guessing. It calculates:

Fuel: Based on actual estimated distance and average OMR/L.

Hotel: Tiered (Budget/Mid/Luxury) based on your daily spending limit.

Food: A flat daily rate multiplied by the number of travelers.

 Future Enhancements
Here are some additional features I aim to implenet in my project:
A. Instead of using Haversine, replace it with Mapbox Optimization API or OSRM for better mountain road accuracy.
B. Allow multiple users to be able to access the website and fully plan their trips at the same time.
C. Once the trip is fully planned in my website, the users will be able to export it onto their calendars (google calendar or built-in ones)
