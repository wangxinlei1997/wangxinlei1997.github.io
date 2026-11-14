// Icarus's clickable code captions also need keyboard activation and state.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('figure.highlight.foldable').forEach(block => {
    const toggle = block.querySelector('figcaption .level-left');
    toggle.setAttribute('role', 'button');
    toggle.tabIndex = 0;
    toggle.setAttribute('aria-label', '展开或收起代码');
    const update = () => toggle.setAttribute('aria-expanded', String(!block.classList.contains('folded')));
    toggle.addEventListener('click', update);
    toggle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });
    update();
  });
});
