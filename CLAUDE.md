# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based game collection featuring HTML5 games that run directly in web browsers without any build process. Games are deployed via GitHub Pages at https://naoto714714.github.io/browser-games/

## Architecture

- **Zero-build architecture**: Direct execution of HTML/CSS/JavaScript files
- **Modular game structure**: Each game is self-contained in its own directory
- **Pure web technologies**: No frameworks or build tools - vanilla JavaScript with ES6+ features
- **Canvas-based rendering**: Both games use HTML5 Canvas for graphics
- **Static deployment**: Designed for GitHub Pages (automatic deployment on push to main)

## Development Workflow

### Local Development
```bash
# No installation required! Use VS Code Live Server extension or any static file server
# Example with Python:
python -m http.server 8000
# Or with Node.js:
npx http-server
```

### Testing
- Open index.html directly in browser
- Test on multiple browsers (Chrome, Firefox, Safari)
- Verify mobile responsiveness
- Check 60 FPS performance target

### Deployment
```bash
# Simply push to main branch - GitHub Pages auto-deploys
git add .
git commit -m "Your commit message"
git push origin main
```

## Key Development Rules

1. **Entry Point**: Each game must have `index.html` as its entry point
2. **Independence**: Games must be completely independent (no shared global variables or naming conflicts)
3. **External Libraries**: Use CDN links only, no local dependencies
4. **Performance**: Target 60 FPS for smooth gameplay
5. **Mobile Support**: Games must be responsive and touch-enabled

## Game Architecture Patterns

### Super Mario Bros 1-1
- **Modular JavaScript**: Separate modules for player, enemies, physics, camera, etc.
- **Custom Physics Engine**: Implements gravity, friction, and collision detection
- **Procedural Sprites**: Pixel art generated programmatically in JavaScript
- **State Management**: Game states (running, paused, game over) managed centrally

### Neon Breaker
- **Power-up System**: Special blocks with unique effects
- **Particle Effects**: Visual feedback system for impacts and explosions
- **Boss Battles**: Level progression with boss fights every 5 levels
- **Multi-ball Physics**: Complex ball physics with collision handling

## Common Tasks

### Adding a New Game
1. Create new directory at root level
2. Add index.html, css/, and js/ subdirectories
3. Implement game following the modular pattern
4. Add README.md with game documentation
5. Update main README.md to include the new game

### Debugging Canvas Games
- Use browser DevTools for breakpoints
- Add visual debug overlays for collision boxes
- Monitor performance with Chrome Performance tab
- Check console for any errors during gameplay

## Important Technical Notes

- **Canvas Coordinates**: (0,0) is top-left corner
- **Animation Loop**: Use requestAnimationFrame for smooth 60 FPS
- **Asset Loading**: Ensure all assets are loaded before game starts
- **Mobile Controls**: Implement both keyboard and touch controls
- **Cross-browser**: Test audio compatibility across browsers