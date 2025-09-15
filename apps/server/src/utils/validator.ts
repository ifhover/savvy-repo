import { z } from "zod";
import { BusinessError } from "./exception";

export function validate<T>(data: any, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BusinessError(
      result.error.issues[0].path.join(".") +
        " " +
        result.error.issues[0].message
    );
  }
  return result.data;
}
