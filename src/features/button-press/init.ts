export function initButtonPress() {
  const buttons = document.querySelectorAll<HTMLElement>('.btn');

  buttons.forEach((button) => {
    const release = () => {
      button.classList.remove('is-pressing');
      button.classList.add('is-releasing');
      window.setTimeout(() => button.classList.remove('is-releasing'), 180);
    };

    button.addEventListener('pointerdown', () => button.classList.add('is-pressing'));
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', () => button.classList.remove('is-pressing'));
  });
}
