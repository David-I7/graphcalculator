import { CSS_VARIABLES } from "../data/css/variables";

export function AnimateSlideX(
  xStart: string = "0px",
  xEnd: string = "-100%"
): Keyframe[] {
  return [
    { offset: 0, transform: `translateX(${xStart})` },
    {
      offset: 1,
      transform: `translateX(${xEnd})`,
    },
  ];
}
export function AnimateSlideY(
  yStart: string = "0",
  yEnd: string = "100%"
): Keyframe[] {
  return [
    { offset: 0, transform: `translateY(${yStart})` },
    {
      offset: 1,
      transform: `translateY(${yEnd})`,
    },
  ];
}

export const AnimationOptions: KeyframeAnimationOptions = {
  fill: "forwards",
  duration: CSS_VARIABLES.animationSpeedDefault,
  easing: "ease-out",
};
