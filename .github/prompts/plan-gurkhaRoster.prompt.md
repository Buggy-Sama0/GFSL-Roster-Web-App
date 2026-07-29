## Plan: Gurkha_Roster UI Mockup

Build a polished, desktop-first roster dashboard mockup with a fixed sidebar, a dense weekly scheduling grid, and polished state styling. The implementation should replace the starter Vite screen with a realistic roster mockup, add Tailwind CSS to support the requested utility-first styling, and structure the page so the roster screen and sidebar destinations can be rendered as separate panels later without adding business logic.

**Steps**
1. Add Tailwind CSS to the Vite app and wire it into the global styles so the UI can be built with actual utility classes rather than ad hoc CSS. This includes the project config and the base stylesheet layer.
2. Replace the starter screen in [src/App.jsx](c:/Users/user/Desktop/security-roster-app/src/App.jsx) with a static dashboard shell for Gurkha_Roster. The layout should include the fixed sidebar, top header, and the roster workspace.
3. Model the roster as local mock data inside the component layer so the screen can show at least five employees and mixed cell states without adding app logic.
4. Build the sidebar and header as presentational sections only. The sidebar should show the ShieldRoster logo, the requested navigation items with Active Roster selected, and a bottom Log Out button. The header should include the title/date range, warning banner, site selector, week navigator, and Add Shift button.
5. Render the roster grid as a polished table-like layout with seven day columns and employee rows containing generated avatar circles, names, roles, first-aid badges, and the four requested cell states.
6. Add the styling system in [src/App.css](c:/Users/user/Desktop/security-roster-app/src/App.css) and [src/index.css](c:/Users/user/Desktop/security-roster-app/src/index.css) to deliver the light-mode palette, deep slate blue brand tone, disabled state treatments, leave stripes, warning outlines, and spacing hierarchy.
7. Add lightweight placeholder panels for the other sidebar destinations so the shell feels complete even though no routing or behavior is being implemented yet.
8. Remove the starter demo look and any leftover placeholder content so the final screen reads as a single cohesive product mockup.

**Relevant files**
- [src/App.jsx](c:/Users/user/Desktop/security-roster-app/src/App.jsx) — replace the starter component with the roster dashboard markup and mock data rendering.
- [src/App.css](c:/Users/user/Desktop/security-roster-app/src/App.css) — define the dashboard, sidebar, grid, badge, and cell state styling.
- [src/index.css](c:/Users/user/Desktop/security-roster-app/src/index.css) — set global page defaults, background, typography, and base theme behavior.
- [package.json](c:/Users/user/Desktop/security-roster-app/package.json) — add Tailwind-related dependencies and scripts if needed.
- [vite.config.js](c:/Users/user/Desktop/security-roster-app/vite.config.js) — add any Vite-side Tailwind integration required by the chosen setup.

**Verification**
1. Run npm run lint to confirm the React markup and helper data structures are valid.
2. Run npm run build to confirm the Tailwind setup and UI compile cleanly.
3. Open the app and visually verify the fixed sidebar, header controls, warning banner, and weekly roster grid layout.
4. Confirm the four roster states are visible in the mockup: scheduled shifts, empty cells, approved leave, and expired-license warnings.

**Decisions**
- Tailwind CSS will be added properly rather than faked, since the repo does not currently include it and the request explicitly asked for Tailwind styling.
- The UI will stay static and logic-free, with no data fetching or roster management behavior.
- Employee photos will be represented with generated initials avatar circles so the mockup stays self-contained.
- Placeholder panels will exist for the other sidebar items, but no navigation logic or routing will be implemented.

I’ve saved this plan to /memories/session/plan.md. If you want, I can now switch from planning to implementation and build the UI exactly against this scope.