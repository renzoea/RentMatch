/**
 * Componentes de formulario integrados con React Hook Form
 * Wrappers alrededor de los componentes UI existentes
 */

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { cn } from "@/lib/utils";

// ============================================================================
// FORM FIELD CONTEXT
// ============================================================================

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

// ============================================================================
// FORM FIELD
// ============================================================================

export const FormField = Controller;

// ============================================================================
// FORM ITEM
// ============================================================================

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  );
});
FormItem.displayName = "FormItem";

// ============================================================================
// FORM LABEL
// ============================================================================

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { formState } = useFormContext();
  const { name } = React.useContext(FormFieldContext);
  const error = formState.errors[name];

  return (
    <Label
      ref={ref}
      className={cn(error && "text-red-500", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// ============================================================================
// FORM CONTROL
// ============================================================================

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { name } = React.useContext(FormFieldContext);

  return (
    <FormFieldContext.Provider value={{ name }}>
      <div ref={ref} {...props} />
    </FormFieldContext.Provider>
  );
});
FormControl.displayName = "FormControl";

// ============================================================================
// FORM DESCRIPTION
// ============================================================================

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// ============================================================================
// FORM MESSAGE
// ============================================================================

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { formState } = useFormContext();
  const { name } = React.useContext(FormFieldContext);
  const error = formState.errors[name];
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-red-500", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// ============================================================================
// FORM INPUT (Wrapper para Input con React Hook Form)
// ============================================================================

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, description, className, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input
                {...field}
                {...props}
                ref={ref}
                className={cn(
                  fieldState.error && "border-red-500 focus:ring-red-500",
                  className
                )}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);
FormInput.displayName = "FormInput";

// ============================================================================
// FORM TEXTAREA (Wrapper para Textarea con React Hook Form)
// ============================================================================

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ name, label, description, className, ...props }, ref) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              {...field}
              {...props}
              ref={ref}
              className={cn(
                fieldState.error && "border-red-500 focus:ring-red-500",
                className
              )}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
FormTextarea.displayName = "FormTextarea";

export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
