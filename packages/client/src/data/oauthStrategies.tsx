import { ReactElement } from "react";
import { Google } from "../components/svgs";
import { Provider } from "@graphcalculator/types";

const strategies: Record<
  Exclude<Provider, Provider.graphCalulator>,
  [ReactElement, string]
> = { 1: [<Google />, "Google"] };

export default strategies;
