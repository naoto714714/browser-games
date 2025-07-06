document.addEventListener('DOMContentLoaded', () => {
  const instrumentManager = new InstrumentManager();

  instrumentManager.registerInstrument('piano', Piano);
  instrumentManager.registerInstrument('guitar', Guitar);
  instrumentManager.registerInstrument('violin', Violin);
  instrumentManager.registerInstrument('flute', Flute);
  instrumentManager.registerInstrument('drums', Drums);

  instrumentManager.switchToInstrument('piano');

  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const sidebar = document.getElementById('sidebar');
  const instrumentButtons = document.querySelectorAll('.instrument-btn');

  hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    sidebar.classList.toggle('active');
  });

  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      hamburgerMenu.classList.remove('active');
      sidebar.classList.remove('active');
    }
  });

  instrumentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const instrument = btn.dataset.instrument;

      instrumentButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      instrumentManager.switchToInstrument(instrument);

      hamburgerMenu.classList.remove('active');
      sidebar.classList.remove('active');
    });
  });

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  });
});
