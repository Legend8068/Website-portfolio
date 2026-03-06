# Ayush Singh Portfolio - Project Documentation

## Project Overview

A modern, interactive portfolio website for Ayush Singh, an aspiring software engineer. The portfolio features a unique 3D Rubik's cube loading/landing experience built with Three.js, followed by a full-featured portfolio with smooth animations and a circuit board-inspired background.

---

## Current Architecture

### Tech Stack
- **React** - Component-based UI framework
- **Three.js** - 3D graphics for Rubik's cube animation
- **Lucide React** - Icon library
- **CSS-in-JS** - Inline styles with responsive `clamp()` functions

### File Structure
```
/src
  ├── Ayush_portfolio.jsx   # Main component (single-file architecture)
  ├── App.jsx               # App wrapper
  ├── App.css               # Global styles (reset constraints)
  ├── index.css             # Base styles (overflow settings)
  └── main.jsx              # Entry point
```

### Color Palette
| Variable | Value | Usage |
|----------|-------|-------|
| `ACCENT` | `#f0c040` | Gold - primary accent, buttons, highlights |
| `BG_DARK` | `#0a1628` | Navy - main background |
| `BG_CARD` | `rgba(12, 26, 48, 0.85)` | Semi-transparent card backgrounds |

*Color scheme derived from user's keyboard image (navy/gold aesthetic)*

---

## Component Architecture

### Page States
1. **Loading** (`isLoading: true`) - Wireframe → Solid transformation with progress bar
2. **Landing** (`currentPage: 'landing'`) - Interactive 3D cube with "SOLVE" button
3. **Main** (`currentPage: 'main'`) - Full portfolio with sections

### Animation Phases (Three.js)
```
wireframe → transforming → solid → idle → lifting → solving → zooming → complete
```

| Phase | Duration | Description |
|-------|----------|-------------|
| Wireframe | 1400ms | Wireframe objects fade in with scale animation |
| Transforming | 1000ms | Wireframe fades, solid objects appear |
| Solid/Idle | User-controlled | Cube rotates, responds to mouse |
| Lifting | 400ms | Cube rises when clicked |
| Solving | ~1200ms | Cube solves itself (6 moves) |
| Zooming | 600ms | Camera zooms in, transition overlay |

### Main Sections
1. **Home** - Hero with title, subtitle, CTA buttons
2. **About** - Bio + Technical skills with progress bars
3. **Experience** - Timeline with 3 entries
4. **Projects** - Grid of 3 project cards
5. **Contact** - Resume download + contact links

---

## Custom SVG Icons

| Component | Location | Source |
|-----------|----------|--------|
| `ResumeSVG` | Landing header | Custom |
| `HeadphoneSVG` | Landing subtitle | Custom |
| `CloudCodeSVG` | Home section | Streamline |
| `InfoCircleSVG` | About section | Streamline Solar |
| `ExperienceSVG` | Experience section | Noun Project |
| `ProjectsSVG` | Projects section | Noun Project |
| `LinkSVG` | Contact section | Streamline Solar |

---

## Key Design Decisions

### 1. Layout System
- **Max-width**: 1200px centered container
- **Responsive padding**: `clamp()` functions for fluid spacing
- **Section height**: `minHeight: 100vh` with flex centering

### 2. Typography Scale
```javascript
// Responsive font sizes using clamp(min, preferred, max)
Hero title:     clamp(44px, 7vw, 100px)
Section titles: clamp(36px, 5vw, 72px)
Body text:      clamp(16px, 1.3vw, 22px)
Subheadings:    clamp(13px, 1vw, 18px)
```

### 3. SOLVE Button Design
- Positioned top-right of cube on hover
- Angled line with dots connecting to pill-shaped button
- Gradient background: gold to darker gold
- Matches user-provided reference image

### 4. Circuit Board Background
- Canvas-based animated background on main page
- Nodes with random activation
- Signal pulses traveling along connections
- Cursor interaction creates additional signals

---

## Remaining Tasks

### Design Changes (Not Finalized)
- [ ] Review overall spacing and proportions
- [ ] Adjust font sizes if needed
- [ ] Refine SOLVE button positioning/styling
- [ ] Consider adding hover effects to cards
- [ ] Review mobile responsiveness
- [ ] Adjust circuit board animation intensity
- [ ] Consider dark/light mode toggle
- [ ] Review navigation bar design
- [ ] Adjust color contrast for accessibility

### Content Changes (Not Finalized)
- [ ] Update personal bio text
- [ ] Add real project descriptions and links
- [ ] Update experience entries with actual data
- [ ] Add real contact information (email, GitHub, LinkedIn)
- [ ] Upload actual resume PDF
- [ ] Add project images/screenshots
- [ ] Update skill percentages to reflect actual skills
- [ ] Add more projects if needed
- [ ] Consider adding testimonials section
- [ ] Add blog/articles section (optional)

### Technical Improvements (Optional)
- [ ] Split into multiple component files
- [ ] Add loading states for images
- [ ] Implement actual navigation links for projects
- [ ] Add form validation for contact form (if added)
- [ ] SEO optimization (meta tags, etc.)
- [ ] Performance optimization (lazy loading)
- [ ] Add analytics tracking
- [ ] Implement actual resume download
- [ ] Add social media links functionality

### Accessibility (To Review)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] Alt text for images
- [ ] ARIA labels where needed

---

## File Dependencies

### External Libraries (via npm)
```json
{
  "react": "^18.x",
  "three": "^0.160.x",
  "lucide-react": "^0.300.x"
}
```

### CSS Files Required
- `App.css` - Must have `#root { width: 100%; }` (no max-width constraint)
- `index.css` - Must have `overflow-x: hidden; overflow-y: auto;`

---

## Development Notes

### Known Considerations
1. Three.js canvas must be fixed position for proper rendering
2. Circuit board animation runs on separate canvas
3. Scroll behavior managed by `mainContentRef` with `overflowY: auto`
4. All styles are inline for single-file portability

### Browser Support
- Modern browsers with WebGL support required
- CSS `clamp()` requires modern browser versions
- Backdrop blur may not work in all browsers

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic Three.js cube, loading animation |
| 2.0 | - | Added portfolio sections, navigation |
| 3.0 | - | Circuit board background, color scheme update |
| 4.0 | - | Responsive fixes, CSS constraint removal |
| 5.0 | - | SVG icons, centered layout, new SOLVE button |

---

## Contact

**Developer**: Ayush Singh  
**Project Type**: Personal Portfolio  
**Status**: In Development

---

*Last updated: February 2026*
