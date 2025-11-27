import type { FieldValues, Path } from "react-hook-form";

export type FormFieldConfig<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder: string;
  type: "number" | "text";
};
