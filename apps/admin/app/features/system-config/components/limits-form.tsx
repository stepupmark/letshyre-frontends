import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "~/components/ui/input-group";
import { useUpdateSystemConfig } from "../mutations/use-update-system-config";
import {
  limitsSchema,
  type LimitsInput,
  type SystemConfig,
} from "../schemas/system-config.schema";

const FIELDS: {
  name: keyof LimitsInput;
  label: string;
  description: string;
  unit: string;
}[] = [
  {
    name: "max_file_upload_size_mb",
    label: "Max file upload size",
    description: "Largest single file a user can upload.",
    unit: "MB",
  },
  {
    name: "api_rate_limit_per_min",
    label: "API rate limit",
    description: "Requests allowed per client each minute.",
    unit: "req/min",
  },
  {
    name: "default_video_retention_days",
    label: "Video retention",
    description: "Recorded videos are deleted after this period.",
    unit: "days",
  },
];

export function LimitsForm({ config }: { config: SystemConfig }) {
  const update = useUpdateSystemConfig();
  const form = useForm<LimitsInput>({
    resolver: zodResolver(limitsSchema),
    values: {
      max_file_upload_size_mb: config.max_file_upload_size_mb,
      api_rate_limit_per_min: config.api_rate_limit_per_min,
      default_video_retention_days: config.default_video_retention_days,
    },
  });

  const submit = form.handleSubmit((values) => {
    const dirty = Object.fromEntries(
      Object.entries(values).filter(
        ([key]) => form.formState.dirtyFields[key as keyof LimitsInput],
      ),
    );
    update.mutate(dirty);
  });

  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <CardHeader>
          <CardTitle>Resource limits</CardTitle>
          <CardDescription>
            Upload, rate and retention limits for the whole platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <FieldGroup className="grid gap-6 md:grid-cols-3">
            {FIELDS.map(({ name, label, description, unit }) => {
              const error = form.formState.errors[name];
              return (
                <Field key={name} data-invalid={Boolean(error)}>
                  <FieldLabel htmlFor={name}>{label}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={name}
                      type="number"
                      inputMode="numeric"
                      aria-invalid={Boolean(error)}
                      {...form.register(name, { valueAsNumber: true })}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{unit}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {error ? (
                    <FieldError errors={[error]} />
                  ) : (
                    <FieldDescription>{description}</FieldDescription>
                  )}
                </Field>
              );
            })}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={!form.formState.isDirty || update.isPending}
            onClick={() => form.reset()}
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isDirty || update.isPending}
          >
            {update.isPending && <LoaderCircle className="animate-spin" />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
