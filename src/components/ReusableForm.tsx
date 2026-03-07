import {
  useForm,
  type FieldValues,
  type Resolver,
  type DefaultValues,
  type Path,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  placeholder?: string;
  type: "number" | "text";
  disabled?: boolean;
};

export type ReusableFormProps<T extends FieldValues> = {
  defaultValues: T;
  validationSchema: any;
  onSubmit: (values: T, resetForm: (values?: T) => void) => void;
  fields: FormFieldConfig<T>[];
  title: string;
  isAllDisabled?: boolean;
};

function ReusableForm<T extends FieldValues>({
  defaultValues,
  validationSchema,
  onSubmit,
  fields,
  title,
  isAllDisabled = false,
}: ReusableFormProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(validationSchema) as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  });

  return (
    <div className="w-full">
      <p className="font-black text-xl mb-4 text-slate-800 uppercase tracking-tight">
        {title}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => onSubmit(v, form.reset))}
          className="p-6 bg-white border border-slate-200 rounded-2xl shadow-md space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((fieldConfig) => (
              <FormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-500 text-xs uppercase">
                      {fieldConfig.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={fieldConfig.type}
                        className="h-11 font-semibold focus:ring-2 focus:ring-blue-500/20"
                        disabled={isAllDisabled || fieldConfig.disabled}
                        {...field}
                        onFocus={(e) =>
                          fieldConfig.type === "number" && e.target.select()
                        }
                        onChange={(e) => {
                          const val =
                            fieldConfig.type === "number"
                              ? parseFloat(e.target.value) || 0
                              : e.target.value;
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="submit"
            disabled={isAllDisabled}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-6 rounded-xl transition-all"
          >
            Zatwierdź Dane
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ReusableForm;
