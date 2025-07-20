class InstrumentManager {
  constructor() {
    this.currentInstrument = null;
    this.instruments = {};
    this.container = document.getElementById('instrument');
    this.audio = new PianoAudio();
  }

  registerInstrument(name, instrumentClass) {
    this.instruments[name] = instrumentClass;
  }

  switchToInstrument(name) {
    if (this.currentInstrument) {
      this.currentInstrument.destroy();
    }

    this.container.innerHTML = '';
    this.container.className = 'instrument';

    const InstrumentClass = this.instruments[name];
    if (InstrumentClass) {
      this.currentInstrument = new InstrumentClass(this.container, this.audio);
      document.getElementById('instrumentName').textContent = this.getInstrumentDisplayName(name);
    }
  }

  getInstrumentDisplayName(name) {
    const names = {
      piano: 'ピアノ',
      guitar: 'ギター',
      violin: 'バイオリン',
      flute: 'フルート',
      drums: 'ドラム',
    };
    return names[name] || name;
  }
}

class Instrument {
  constructor(container, audio) {
    this.container = container;
    this.audio = audio;
    this.elements = [];
    this.activeElements = new Set();
  }

  destroy() {
    this.elements.forEach((element) => {
      element.removeEventListener('mousedown', element._mousedownHandler);
      element.removeEventListener('mouseup', element._mouseupHandler);
      element.removeEventListener('mouseleave', element._mouseleaveHandler);
      element.removeEventListener('touchstart', element._touchstartHandler);
      element.removeEventListener('touchend', element._touchendHandler);
    });

    this.activeElements.forEach((note) => {
      this.audio.stopNote(note);
    });

    this.activeElements.clear();
    this.elements = [];
  }

  setupElementEvents(element, note) {
    element._mousedownHandler = (e) => {
      e.preventDefault();
      this.playNote(element, note);
    };

    element._mouseupHandler = () => {
      this.stopNote(element, note);
    };

    element._mouseleaveHandler = () => {
      this.stopNote(element, note);
    };

    element._touchstartHandler = (e) => {
      e.preventDefault();
      this.playNote(element, note);
    };

    element._touchendHandler = (e) => {
      e.preventDefault();
      this.stopNote(element, note);
    };

    element.addEventListener('mousedown', element._mousedownHandler);
    element.addEventListener('mouseup', element._mouseupHandler);
    element.addEventListener('mouseleave', element._mouseleaveHandler);
    element.addEventListener('touchstart', element._touchstartHandler);
    element.addEventListener('touchend', element._touchendHandler);

    this.elements.push(element);
  }

  playNote(element, note) {
    if (!element.classList.contains('active')) {
      element.classList.add('active');
      this.activeElements.add(note);
      this.audio.playNote(note);
    }
  }

  stopNote(element, note) {
    if (element.classList.contains('active')) {
      element.classList.remove('active');
      this.activeElements.delete(note);
      this.audio.stopNote(note);
    }
  }
}
