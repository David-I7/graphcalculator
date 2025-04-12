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
}
