import { useState } from "react";
import { useForm, type FieldValues, type DefaultValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "number" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  full?: boolean;
};

export function AutoForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  submitLabel = "Submit",
  successTitle = "Thank you — we've received your details.",
  successBody = "A member of the SVRST Trust team will get back to you shortly.",
  note,
  submitTo,
  toPayload,
}: {
  schema: ZodType<T>;
  fields: FieldDef[];
  defaultValues: DefaultValues<T>;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  note?: string;
  submitTo?: string;
  toPayload?: (values: T) => unknown;
}) {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema as never),
    defaultValues,
  });

  if (done) {
    return (
      <div className="border-y border-primary/20 py-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl gradient-leaf text-leaf-foreground">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold">{successTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{successBody}</p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(
        async (values) => {
          setSubmitError(null);
          try {
            if (submitTo) {
              const response = await fetch(`${API_BASE_URL}${submitTo}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(toPayload ? toPayload(values) : values),
              });
              const result = (await response.json().catch(() => null)) as {
                message?: string;
              } | null;
              if (!response.ok) {
                throw new Error(
                  result?.message || "We could not submit your details. Please try again.",
                );
              }
            }
            setDone(true);
          } catch (error: unknown) {
            setSubmitError(
              error instanceof Error ? error.message : "Submission failed. Please try again.",
            );
          }
        },
        (validationErrors) => {
          setSubmitError(validationErrors.root?.message?.toString() || null);
        },
      )}
      className="border-y border-primary/20 py-8 sm:py-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name as Path<T>]?.message as string | undefined;
          const id = `field-${field.name}`;
          const invalid = Boolean(error);
          return (
            <div
              key={field.name}
              className={cn(
                "space-y-2",
                (field.full || field.type === "textarea") && "sm:col-span-2",
              )}
            >
              {field.type === "checkbox" ? (
                <div className="flex items-start gap-3 border-t border-primary/15 pt-4">
                  <Checkbox
                    id={id}
                    checked={Boolean(watch(field.name as Path<T>))}
                    onCheckedChange={(v) =>
                      setValue(field.name as Path<T>, Boolean(v) as never, { shouldValidate: true })
                    }
                    aria-invalid={invalid}
                  />
                  <Label
                    htmlFor={id}
                    className="text-sm font-normal leading-relaxed text-muted-foreground"
                  >
                    {field.label}
                  </Label>
                </div>
              ) : (
                <>
                  <Label htmlFor={id}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={id}
                      rows={5}
                      placeholder={field.placeholder}
                      aria-invalid={invalid}
                      {...register(field.name as Path<T>)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={id}
                      aria-invalid={invalid}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register(field.name as Path<T>)}
                    >
                      <option value="">Please select…</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={id}
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      aria-invalid={invalid}
                      {...register(field.name as Path<T>)}
                    />
                  )}
                </>
              )}
              {field.hint && !error && (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              )}
              {error && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {note && <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{note}</p>}
      {submitError && (
        <p role="alert" className="mt-5 text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        variant="donate"
        size="lg"
        className="mt-7 w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        {isSubmitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

export function FormLayout({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <Reveal>{children}</Reveal>
      {aside && <Reveal delay={120}>{aside}</Reveal>}
    </div>
  );
}
