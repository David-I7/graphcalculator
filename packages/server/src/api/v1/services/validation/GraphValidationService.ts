import { GraphData } from "@graphcalculator/types";
import z from "zod";

export class GraphValidationService {
  validateGetSavedGraphs(
    page: unknown,
    limit: unknown
  ): { page: number; limit: number } | undefined {
    const schema = z.object({
      page: z.number({ coerce: true }).optional().default(1),
      limit: z.number({ coerce: true }).optional().default(25),
    });

    const { data } = schema.safeParse({ page, limit });
    return data;
  }

  validateFullGraph(graph: GraphData) {
    const graphSchema = z.object({
      name: z.string(),
      id: z.string(),
      graphSnapshot: z.object({
        settings: z.object({
          offsetX: z.number(),
          offsetY: z.number(),
        }),
        scales: z.object({
          zoom: z.number(),
          scalesIndex: z.number(),
        }),
        image: z.string(),
      }),
      modifiedAt: z.string().datetime(),
      items: z.array(
        z.object({
          id: z.number(),
          type: z.string(),
          data: z.union([
            z.object({
              expression: z.object({}),
            }),
            z.object({
              note: z.object({
                content: z.string(),
              }),
            }),
          ]),
        })
      ),
    });
  }
}
