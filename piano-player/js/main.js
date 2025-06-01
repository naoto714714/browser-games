document.addEventListener('DOMContentLoaded', () => {
    const piano = new Piano('piano');
    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
});