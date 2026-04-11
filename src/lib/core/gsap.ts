import gsap from 'gsap';

let isInitialized = false;

export const initGsap = () => {
  if (isInitialized || typeof window === 'undefined') {
    return gsap;
  }

  gsap.config({
    nullTargetWarn: false
  });

  isInitialized = true;
  return gsap;
};

export { gsap };
