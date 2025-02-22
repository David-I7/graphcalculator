import { ScaleEventData } from "../../interfaces";
import { Graph } from "./graph";

export class Scales {
  private ZOOM_IN_FACTOR = 1.05;
  private ZOOM_OUT_FACTOR = 0.95;
  private MAX_ZOOM = 1.8;
  private MIN_ZOOM = 0.8;
  private _scaler!: number;
  private _majorGridLine!: number;
  protected _scaledStep: number;
  protected zoom: number;
  private scalesIndex: number;
  private scalesArray: string[] = [];
  constructor(private graph: Graph, private step: number, private n: number) {
    this.step = this.step * this.graph.dpr;
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

  getRawScaler(): string {
    return this.scalesArray[this.scalesIndex];
  }

  private updateScales() {
    this._scaler = parseFloat(this.scalesArray[this.scalesIndex]);
    this._majorGridLine = this.scalesArray[this.scalesIndex][0] === "5" ? 4 : 5;
  }

  get scaledStep(): number {
    return this._scaledStep;
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

    this._scaler = parseFloat(this.scalesArray[this.scalesIndex]);
    this._majorGridLine = this.scalesArray[this.scalesIndex][0] === "5" ? 4 : 5;
    this.graph.on("scale", this.handleScale.bind(this));
  }

  protected handleScale(e: ScaleEventData) {
    const newZoom =
      this.zoom *
      (e.zoomDirection === "OUT" ? this.ZOOM_OUT_FACTOR : this.ZOOM_IN_FACTOR);
    if (
      this.scalesIndex === 0 &&
      newZoom > this.MAX_ZOOM &&
      e.zoomDirection === "IN"
    )
      return;
    if (
      this.scalesIndex === this.scalesArray.length - 1 &&
      newZoom < this.MIN_ZOOM &&
      e.zoomDirection === "OUT"
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
}
