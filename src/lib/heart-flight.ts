// Tiny event bus for the "task → heart" flight animation on /care-journey.
type Origin = { x: number; y: number };
type FlyListener = (o: Origin) => void;
type TargetListener = (t: Origin | null) => void;

const flyListeners = new Set<FlyListener>();
const targetListeners = new Set<TargetListener>();
let currentTarget: Origin | null = null;

export function flyHeart(origin: Origin) {
  flyListeners.forEach((l) => l(origin));
}

export function onFly(l: FlyListener) {
  flyListeners.add(l);
  return () => {
    flyListeners.delete(l);
  };
}

export function setHeartTarget(t: Origin | null) {
  currentTarget = t;
  targetListeners.forEach((l) => l(t));
}

export function getHeartTarget() {
  return currentTarget;
}

export function onTarget(l: TargetListener) {
  targetListeners.add(l);
  return () => {
    targetListeners.delete(l);
  };
}
