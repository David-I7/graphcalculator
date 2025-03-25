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

export function AnimateScale(
  start: number = 1,
  end: number = 0,
  transformOrigin: string = "center"
): Keyframe[] {
  return [
    {
      offset: 0,
      transform: `scale(${start})`,
      transformOrigin,
    },
    {
      offset: 1,
      transform: `scale(${end})`,
      transformOrigin,
    },
  ];
}

export class KeyframeAnimationOptionsBuilder {
  private AnimationOptions: KeyframeAnimationOptions;
  constructor() {
    this.AnimationOptions = AnimationOptionsDefaults;
  }
  add<K extends keyof KeyframeAnimationOptions>(
    key: K,
    value: KeyframeAnimationOptions[K]
  ) {
    this.AnimationOptions[key] = value;
    return this;
  }
  build() {
    return this.AnimationOptions;
  }
}

const AnimationOptionsDefaults: KeyframeAnimationOptions = {
  fill: "forwards",
  duration: CSS_VARIABLES.animationSpeedDefault,
  easing: "ease-out",
};
