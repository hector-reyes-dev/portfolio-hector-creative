export function initSwitchToggle(): void {
  document.querySelectorAll<HTMLButtonElement>('.switch').forEach((sw) => {
    sw.addEventListener('click', () => {
      sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    });
  });
}
