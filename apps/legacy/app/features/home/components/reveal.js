// Scroll-in reveal for the home sections. It fires once any part is on screen,
// and the offset stays small: a big one can push an element past a clipped
// section edge, where it never counts as in view and stays hidden.
export const reveal = ({ delay = 0, y = 16 } = {}) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

export const revealViewport = { once: true, amount: 0.1 };
