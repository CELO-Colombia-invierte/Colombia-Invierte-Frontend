import { createAnimation, Animation } from '@ionic/react';

type AnimationOpts = {
  enteringEl?: HTMLElement;
  leavingEl?: HTMLElement;
  direction?: string;
  [key: string]: unknown;
};

export const pageTransitionAnimation = (
  _baseEl: HTMLElement,
  opts?: AnimationOpts
): Animation => {
  const enteringEl = opts?.enteringEl;
  const leavingEl = opts?.leavingEl;
  const isForward = opts?.direction !== 'back';

  const root = createAnimation();

  if (enteringEl) {
    const enterFrom = isForward ? '16px' : '-16px';
    root.addAnimation(
      createAnimation()
        .addElement(enteringEl)
        .duration(270)
        .easing('cubic-bezier(0.25, 0.46, 0.45, 0.94)')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', `translateY(${enterFrom})`, 'translateY(0px)')
    );
  }

  if (leavingEl) {
    const leaveTo = isForward ? '-12px' : '12px';
    root.addAnimation(
      createAnimation()
        .addElement(leavingEl)
        .duration(220)
        .easing('cubic-bezier(0.55, 0, 1, 0.45)')
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0px)', `translateY(${leaveTo})`)
    );
  }

  return root;
};
