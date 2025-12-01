import {
  useForm,
  type FieldValues,
  type Resolver,
  type DefaultValues,
  type Path,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";

export type FormFieldConfig<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder: string;
  type: "number" | "text";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
};

export type ReusableFormProps<T extends FieldValues> = {
  defaultValues: T;
  validationSchema: yup.ObjectSchema<T>;
  onSubmit: (values: T, resetForm: (values?: T) => void) => void;
  fields?: FormFieldConfig<T>[];
  title: string;
};

function ReusableForm<T extends FieldValues>({
  defaultValues,
  validationSchema,
  onSubmit,
  fields = [],
  title,
}: ReusableFormProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(validationSchema) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmitWithReset = form.handleSubmit((values) => {
    onSubmit(values, form.reset);
  });

  return (
    <>
      <p className="font-bold text-lg mb-4">{title}</p>
      <Form {...form}>
        <form
          onSubmit={handleSubmitWithReset}
          className="p-4 border rounded-lg shadow-md space-y-4"
        >
          {fields.map((fieldConfig) => (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldConfig.label}</FormLabel>
                  <FormControl>
                    <Input
                      type={fieldConfig.type}
                      placeholder={fieldConfig.placeholder}
                      {...field}
                      onChange={(e) => {
                        if (fieldConfig.type === "number") {
                          field.onChange(parseFloat(e.target.value) || 0);
                        } else {
                          field.onChange(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button
            variant="default"
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Zatwierdź
          </Button>
        </form>
      </Form>
    </>
  );
}

export default ReusableForm;
