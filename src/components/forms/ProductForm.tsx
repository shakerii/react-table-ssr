import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormGroup, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import { type DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
  defaultValues?: DefaultValues<FormSchema>;
  onSubmit: (values: FormSchema) => void;
};

export const ProductForm = ({ defaultValues, onSubmit }: Props) => {
  const t = useTranslations("components.forms.product");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  return (
    <Box
      component="form"
      display="flex"
      flexDirection="column"
      gap={2}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormGroup>
        <TextField
          label={t("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register("name")}
        />
      </FormGroup>
      <FormGroup>
        <TextField
          label={t("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
          {...register("description")}
        />
      </FormGroup>
      <FormGroup className="flex items-end">
        <Button
          className="w-fit"
          variant="outlined"
          color="primary"
          type="submit"
        >
          {t("save")}
        </Button>
      </FormGroup>
    </Box>
  );
};
