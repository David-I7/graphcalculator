import { createNewGraph } from "../graph/controllers";
import { useAppDispatch } from "../hooks";

export interface ApplicationError {
  message: string;
  type: string;
  code: number;
}

// export function resetState(){
//   const dispatch = useAppDispatch()

//   dispatch(createNewGraph())
// }
