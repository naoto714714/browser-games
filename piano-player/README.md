# Multi-Instrument Player

A realistic browser-based music player featuring multiple instruments with high-quality sound synthesis using Web Audio API.

## Features

- **5 Different Instruments**:
  - 🎹 **Piano**: 3 octaves (C3-E5) with realistic harmonics
  - 🎸 **Guitar**: 6 strings with 12 frets
  - 🎻 **Violin**: 4 strings with vibrato effect
  - 🎺 **Flute**: Pure tones with breath noise
  - 🥁 **Drums**: Full kit (kick, snare, hi-hat, toms)

- **Universal Features**:
  - Hamburger menu for instrument switching
  - Keyboard controls for each instrument
  - Mouse/touch support
  - Realistic animations and visual feedback
  - Professional-grade sound synthesis

## Controls

### Navigation
- Click hamburger menu (☰) to switch instruments
- Each instrument shows its keyboard mappings

### Instrument-Specific Controls

**Piano**: Keys A-Z for notes (mappings shown on keys)

**Guitar**: Click on string/fret intersections

**Violin**: Keys Q-G for various notes

**Flute**: Keys A-; for different holes

**Drums**: 
- Q: Hi-Hat
- W: Snare
- E: Tom 1
- Space: Kick
- A: Tom 2
- S: Tom 3

## Technical Details

- Pure Web Audio API synthesis - no external audio files
- Instrument-specific synthesis techniques:
  - Piano: Multiple harmonics with ADSR envelope
  - Guitar: Sawtooth waves with lowpass filtering
  - Violin: Vibrato with rich harmonics
  - Flute: Sine waves with filtered noise
  - Drums: Synthesized percussion sounds
- Convolution reverb for spatial depth
- Zero-build architecture