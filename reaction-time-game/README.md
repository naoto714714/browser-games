# 刹那の見切り - Reaction Time Game

A cute pixel art reaction time game featuring an adorable cat character and engaging gameplay mechanics.

## 🎮 Game Overview

Test your reflexes in this charming pixel art game! Wait for the signal, then react as quickly as possible. The game features:

- **Cute pixel art cat character** with dynamic expressions
- **Progressive difficulty** across 5 levels
- **Sound effects** using Web Audio API
- **Mobile-friendly** touch controls
- **Visual feedback** with sparkles and hearts
- **Performance tracking** with best time records

## 🕹️ How to Play

1. **Start the game** by clicking the "スタート" button
2. **Watch the cat** and traffic light carefully
3. **Wait for the green signal** - don't click too early!
4. **React quickly** when you see the green light and "GO!" text
5. **Earn points** based on your reaction time
6. **Progress through levels** to face greater challenges

## 🎯 Scoring System

- **Excellent** (< 200ms): 1000 points + "完璧！"
- **Good** (< 300ms): 500 points + "良い反応！"
- **Average** (< 500ms): 200 points + "普通だね"
- **Slow** (≥ 500ms): 50 points + "遅いよ〜"
- **False Start**: Penalty points and "フライング！"

## 🎨 Features

### Visual Elements
- Pixel art cat with 4 different expressions (normal, happy, surprised, focused)
- Animated traffic light system
- Particle effects (sparkles and hearts)
- Responsive pixel art that scales properly
- Cute pastel color palette

### Audio Effects
- Countdown beeps
- Success/error sounds
- Level progression audio
- All sounds generated using Web Audio API

### Difficulty Progression
- **Level 1**: 2-5 second delays, 500ms false start penalty
- **Level 2**: 1.5-4 second delays, 400ms penalty
- **Level 3**: 1-3.5 second delays, 300ms penalty
- **Level 4**: 0.8-3 second delays, 200ms penalty
- **Level 5**: 0.6-2.5 second delays, 100ms penalty

### Mobile Support
- Touch-friendly interface
- Responsive design for various screen sizes
- Optimized button sizes for mobile devices
- No-scroll touch handling

## 🔧 Technical Details

### Architecture
- **Zero-build**: Pure HTML5, CSS3, and vanilla JavaScript
- **Canvas-based**: HTML5 Canvas for pixel-perfect rendering
- **Modular design**: Separate modules for pixel art, game logic, and main controller
- **60 FPS target**: Optimized game loop with requestAnimationFrame

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Web Audio API for sound effects
- Touch events for mobile devices
- localStorage for persistent high scores

### Performance
- Efficient pixel art rendering system
- Minimal garbage collection through object pooling
- Optimized animation loops
- High DPI display support

## 🎲 Game States

1. **Waiting**: Game ready to start
2. **Countdown**: 3-2-1 countdown with audio cues
3. **Ready**: Yellow light, waiting for random delay
4. **Signal**: Green light appears - time to react!
5. **Result**: Shows reaction time and performance message

## 🏆 Achievements

- **New Record**: When you beat your personal best
- **Perfect Timing**: Reaction times under 200ms
- **Level Master**: Complete all rounds in a level
- **Consistency**: Multiple good reactions in a row

## 🐛 Debug Features

Open browser console and use:
- `debug()`: Toggle debug overlay showing FPS and game state
- `gameState()`: Display current game statistics

## 📱 Controls

- **Desktop**: Click with mouse or press Space/Enter
- **Mobile**: Tap anywhere on the game canvas
- **Keyboard shortcuts**:
  - `R`: Restart game
  - `N`: Next round
  - `Esc`: Pause game

## 🎨 Art Style

The game uses a carefully crafted pixel art style with:
- **8x8 pixel sprites** for the cat character
- **4x pixel scaling** for crisp display
- **Pastel color palette** for a cute aesthetic
- **Smooth animations** with particle effects
- **Retro gaming feel** with modern polish

## 🔊 Audio Design

All sounds are procedurally generated using Web Audio API:
- **Countdown**: A4 (440Hz) sine wave beeps
- **Go Signal**: A5 (880Hz) celebratory tone
- **Success**: Musical chord progression (C5-E5-G5)
- **Error**: A3 (220Hz) sawtooth wave

## 💾 Data Persistence

- **Best reaction time** saved to localStorage
- **Automatic saving** after each successful reaction
- **Cross-session persistence** maintains records between visits

---

Built with ❤️ using pure web technologies. No frameworks, no build process - just fun!
