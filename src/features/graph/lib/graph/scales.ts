import { isTouchEnabled } from "../../../../helpers/dom";
import { ScaleEventData } from "../../interfaces";
import { Graph } from "./graph";

export class Scales {
  protected destroyController: AbortController = new AbortController();
  private ZOOM_IN_FACTOR = 1.05;
  private ZOOM_OUT_FACTOR = 0.95;
  private MAX_ZOOM = 1.8;
  private MIN_ZOOM = 0.8;
  private _scaler!: number;
  private _majorGridLine!: number;
  private _exponent!: number;
  private _coefficient!: number;
  protected _scaledStep: number;
  protected zoom: number;
  private scalesIndex: number;
  private scalesArray: string[] = [];
  constructor(private graph: Graph, private step: number, private n: number) {
    this.step = this.step * (window.devicePixelRatio || 1);
    this._scaledStep = this.step;
    this.zoom = 1;
    this.scalesIndex = this.n * 3;
    this.init();
  }

  get scaler() {
    return this._scaler;
  }

  get majorGridLine() {
    return this._majorGridLine;
  }

  get exponent() {
    return this._exponent;
  }
  get coefficient() {
    return this._coefficient;
  }

  getRawScaler(): string {
    return this.scalesArray[this.scalesIndex];
  }

  private updateScales() {
    this._scaler = parseFloat(this.scalesArray[this.scalesIndex]);
    this._majorGridLine = this.scalesArray[this.scalesIndex][0] === "5" ? 4 : 5;
    const rawScaler = this.getRawScaler().split("e");
    this._exponent = Number(rawScaler[1]);
    this._coefficient = Number(rawScaler[0]);
  }

  get scaledStep(): number {
    return this._scaledStep;
  }

  calculateGraphCoordinates(offsetX: number, offsetY: number) {
    const yTiles =
      (offsetY * this.graph.dpr -
        (this.graph.canvasCenterY + this.graph.offsetY)) /
      this.graph.scales.scaledStep;
    const graphY = yTiles * this.graph.scales.scaler;

    const xTiles =
      (offsetX * this.graph.dpr -
        (this.graph.canvasCenterX + this.graph.offsetX)) /
      this.graph.scales.scaledStep;
    const graphX = xTiles * this.graph.scales.scaler;

    return { graphX, graphY };
  }

  distanceFromOrigin(c: number) {
    // constant * normfactor = d from origin
    // c = graphX or graphY
    // normfactor = scaledStep / scaler
    const normFactor = this.scaledStep / this.scaler;
    return c * normFactor;
  }

  private init() {
    const scaleFactors = [1, 2, 5];
    for (let i = -this.n; i <= this.n; ++i) {
      let j = 0;

      while (j < scaleFactors.length) {
        this.scalesArray.push(`${scaleFactors[j]}e${i}`);
        j++;
      }
    }

    this.updateScales();

    this.graph.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        const zoomDirection = e.deltaY > 0 ? "OUT" : "IN";

        const dOriginX =
          e.offsetX * this.graph.dpr -
          (this.graph.canvasCenterX + this.graph.offsetX);
        const dOriginY =
          e.offsetY * this.graph.dpr -
          (this.graph.canvasCenterY + this.graph.offsetY);

        if (
          (dOriginY < -this.graph.MAX_TRANSLATE ||
            dOriginY > this.graph.MAX_TRANSLATE ||
            dOriginX < -this.graph.MAX_TRANSLATE ||
            dOriginX > this.graph.MAX_TRANSLATE) &&
          zoomDirection === "IN"
        )
          return;

        const graphX =
          (dOriginX / this.graph.scales.scaledStep) * this.graph.scales.scaler;
        const graphY =
          (dOriginY / this.graph.scales.scaledStep) * this.graph.scales.scaler;

        this.handleScale(zoomDirection);

        const newdOriginX = this.distanceFromOrigin(graphX);
        const newdOriginY = this.distanceFromOrigin(graphY);

        const scaleDx = newdOriginX - dOriginX;
        const scaleDy = newdOriginY - dOriginY;

        const event: ScaleEventData = {
          zoomDirection,
          graphX,
          graphY,
          prevdOriginX: dOriginX,
          prevdOriginY: dOriginY,
          scaleDx,
          scaleDy,
          preventDefault() {
            this.defaultPrevented = true;
          },
          defaultPrevented: false,
        };
        this.graph.dispatch("scale", event);
      },
      { passive: false, signal: this.destroyController.signal }
    );

    if (isTouchEnabled()) {
      this.graph.canvas.addEventListener(
        "touchstart",
        (e) => {
          console.log(
            e.targetTouches.length,
            e.changedTouches.length,
            e.targetTouches
          );

          if (e.targetTouches.length !== 2) return;

          this.graph.canvas.addEventListener("touchmove", (e) => {}, {
            signal: this.destroyController!.signal,
          });
        },
        { signal: this.destroyController.signal }
      );
    }
  }

  protected handleScale(zoomDirection: "OUT" | "IN") {
    const newZoom =
      this.zoom *
      (zoomDirection === "OUT" ? this.ZOOM_OUT_FACTOR : this.ZOOM_IN_FACTOR);
    if (
      this.scalesIndex === 0 &&
      newZoom > this.MAX_ZOOM &&
      zoomDirection === "IN"
    )
      return;
    if (
      this.scalesIndex === this.scalesArray.length - 1 &&
      newZoom < this.MIN_ZOOM &&
      zoomDirection === "OUT"
    )
      return;

    this.zoom = newZoom;
    this._scaledStep = this.step * this.zoom;

    // zoom out
    if (this.zoom > this.MAX_ZOOM) {
      this.zoom = this.MIN_ZOOM;
      this._scaledStep = this.step * this.MIN_ZOOM;
      this.scalesIndex -= 1;
      this.updateScales();
    }

    //zoom in

    if (this.zoom < this.MIN_ZOOM) {
      this.zoom = this.MAX_ZOOM;
      this._scaledStep = this.step * this.MAX_ZOOM;
      this.scalesIndex += 1;
      this.updateScales();
    }
  }

  destroy() {
    this.destroyController.abort();
  }
}
