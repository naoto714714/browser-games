class Piano extends Instrument {
    constructor(container, audio) {
        super(container, audio);
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
        this.setupKeyboardEvents();
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

    setupKeyboardEvents() {
        this.keys.forEach(key => {
            this.setupElementEvents(key, key.dataset.note);
        });

        this._keydownHandler = (e) => {
            if (e.repeat) return;

            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                this.playKey(note);
            }
        };

        this._keyupHandler = (e) => {
            const note = this.keyboardMapping[e.key.toLowerCase()];
            if (note) {
                e.preventDefault();
                this.releaseKey(note);
            }
        };

        document.addEventListener('keydown', this._keydownHandler);
        document.addEventListener('keyup', this._keyupHandler);
    }

    playKey(note) {
        const key = this.keyMap[note];
        if (key) {
            this.playNote(key, note);
        }
    }

    releaseKey(note) {
        const key = this.keyMap[note];
        if (key) {
            this.stopNote(key, note);
        }
    }

    destroy() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }
        if (this._keyupHandler) {
            document.removeEventListener('keyup', this._keyupHandler);
        }
        super.destroy();
    }
}
