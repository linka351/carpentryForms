import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  formatFormsValidation,
  type FormValues,
} from "@/validations/formatFormsValidation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function FormatForms() {
  const form = useForm<FormValues>({
    resolver: yupResolver(formatFormsValidation),
    defaultValues: {
      length: 0,
      width: 0,
      margin: 0,
      kerf: 0,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(
      `Długość: ${values.length}, Szerokość: ${values.width}, Margines: ${values.margin}, Kerf: ${values.kerf}`
    );
  }

  return (
    <>
      <p className="font-bold text-lg mb-4">Parametry Płyty</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 border rounded-lg shadow-md space-y-4"
        >
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Długość (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Wprowadź długość"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Szerokość (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Wprowadź szerokość"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="margin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margines (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Wprowadź margines"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kerf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kerf (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Wprowadź Kerf"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="default"
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Oblicz i Zatwierdź
          </Button>
        </form>
      </Form>
    </>
  );
}

export default FormatForms;
