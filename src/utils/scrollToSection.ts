// Scrolls to a section by id, offsetting for the sticky header's actual current
// height (it shrinks on scroll and has a variable-height top bar), so the top of
// the section — badges included — isn't hidden underneath it.
export function scrollToSection(id: string, extraOffset = 16) {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector('header');
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;

  window.scrollTo({ top: y, behavior: 'smooth' });
}
