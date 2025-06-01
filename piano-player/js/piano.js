class Piano {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.audio = new PianoAudio();
        this.keys = [];
        this.keyMap = {};
        
        this.keyboardMapping = {
            'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
            'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
            'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
            'p': 'D#5', ';': 'E5', "'": 'F5', ']': 'F#5',
            'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F3', 'b': 'G3',
            'n': 'A3', 'm': 'B3'
        };
        
        this.createKeyboard();
        this.setupEventListeners();
    }
    
    createKeyboard() {
        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackNotes = ['C#', 'D#', null, 'F#', 'G#', 'A#'];
        const octaves = [3, 4, 5];
        
        let whiteKeyIndex = 0;
        
        octaves.forEach(octave => {
            whiteNotes.forEach((note, index) => {
                const noteName = `${note}${octave}`;
                const key = this.createKey(noteName, 'white', whiteKeyIndex);
                this.container.appendChild(key);
                whiteKeyIndex++;
                
                if (blackNotes[index] && (octave < 5 || index < 2)) {
                    const blackNoteName = `${blackNotes[index]}${octave}`;
                    const blackKey = this.createKey(blackNoteName, 'black', whiteKeyIndex - 1);
                    this.container.appendChild(blackKey);
                }
            });
        });
    }
    
    createKey(note, type, position) {
        const key = document.createElement('div');
        key.className = `key ${type}`;
        key.dataset.note = note;
        
        if (type === 'black') {
            key.style.left = `${position * 50 - 15}px`;
        }
        
        const label = document.createElement('div');
        label.className = 'key-label';
        
        const keyboardKey = Object.keys(this.keyboardMapping).find(k => this.keyboardMapping[k] === note);
        if (keyboardKey) {
            label.textContent = keyboardKey.toUpperCase();
        }
        
        key.appendChild(label);
        
        this.keys.push(key);
        this.keyMap[note] = key;
        
        return key;
    }
    
    setupEventListeners() {
        this.keys.forEach(key => {
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playKey(key.dataset.note);
            });
            
            key.addEventListener('mouseup', () => {
                this.releaseKey(key.dataset.note);
            });
            
            key.addEventListener('mouseleave', () => {
                this.releaseKey(key.dataset.note);
            });
            
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playKey(key.dataset.note);
            });
            
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.releaseKey(key.dataset.note);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                this.playKey(note);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                this.releaseKey(note);
            }
        });
    }
    
    playKey(note) {
        const key = this.keyMap[note];
        if (key && !key.classList.contains('active')) {
            key.classList.add('active');
            this.audio.playNote(note);
        }
    }
    
    releaseKey(note) {
        const key = this.keyMap[note];
        if (key) {
            key.classList.remove('active');
            this.audio.stopNote(note);
        }
    }
}