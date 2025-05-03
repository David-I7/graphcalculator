import { ExpressionType } from "@graphcalculator/types";
import z from "zod";

export class GraphSchemaDirector {
  private static cache: Map<string, any> = new Map();

  buildGraphSchema() {
    if (GraphSchemaDirector.cache.has("graph")) {
      return GraphSchemaDirector.cache.get("graph") as typeof schema;
    }

    const schema = this.buildMetadataSchema().merge(
      z.object({
        items: this.buildItemsSchema(),
      })
    );

    GraphSchemaDirector.cache.set("graph", schema);
    return schema;
  }

  private buildMetadataSchema(): typeof schema {
    const schema = z.object({
      name: z.string().max(50),
      id: z.string(),
      graph_snapshot: this.buildGraphSnapshotSchema(),
      modified_at: z.string().datetime(),
      image: z.string().max(80),
    });

    return schema;
  }

  private buildGraphSnapshotSchema() {
    return z.object({
      settings: z.object({
        offsetX: z.number(),
        offsetY: z.number(),
      }),
      scales: z.object({
        zoom: z.number(),
        scalesIndex: z.number(),
      }),
    });
  }

  private buildItemsSchema() {
    const schema = z.array(
      z.object({
        id: z.number(),
        type: z.enum(["note", "expression"]),
        data: z.union([
          this.buildNoteSchema(),
          this.buildExpressionSchema("function"),
          this.buildExpressionSchema("point"),
          this.buildExpressionSchema("variable"),
        ]),
      })
    );

    return schema;
  }

  private buildNoteSchema() {
    return z
      .object({
        content: z.string(),
      })
      .strict();
  }

  private buildExpressionSchema(type: ExpressionType) {
    switch (type) {
      case "variable": {
        const schema = z
          .object({
            type: z.literal(type),
            content: z.string(),
          })
          .strict();

        return schema;
      }
      case "point": {
        const schema = z
          .object({
            type: z.literal(type),
            content: z.string(),
            settings: this.buildBaseSettingsSchema().merge(
              z.object({
                pointType: z.enum([
                  "circle",
                  "circleStroke",
                  "diamond",
                  "star",
                  "x",
                  "+",
                ]),
              })
            ),
          })
          .strict();
        return schema;
      }
      case "function": {
        const schema = z
          .object({
            type: z.literal(type),
            content: z.string(),
            settings: this.buildBaseSettingsSchema().merge(
              z.object({
                lineType: z.enum(["dotted", "dashed", "linear"]),
              })
            ),
          })
          .strict();
        return schema;
      }
      default:
        return z.never();
    }
  }

  private buildBaseSettingsSchema() {
    return z.object({
      color: z.string(),
      hidden: z.boolean(),
      strokeSize: z.number(),
      opacity: z.number(),
    });
  }
}
