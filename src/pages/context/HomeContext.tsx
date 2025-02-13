import { createContext } from "react";

type HomeContextState = {};

const initContextState = {};

const HomeContext = createContext<HomeContextState>(initContextState);
