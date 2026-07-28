import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { ApiError } from "@/services/apiClient";

/** Mirrors server/src/modules/auth/auth.validation.ts exactly. */
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(24, "At most 24 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  password: z
    .string()
    .min(10, "At least 10 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a digit"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    registerAccount.mutate(values, {
      onSuccess,
      onError: (error) => {
        if (error instanceof ApiError && error.code === "CONFLICT") {
          setError("root", { message: error.message });
        } else {
          setError("root", { message: "Something went wrong. Please try again." });
        }
      },
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input label="Username" autoComplete="username" error={errors.username?.message} {...register("username")} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters, one uppercase letter, one digit"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={registerAccount.isPending}>
        Create account
      </Button>
    </form>
  );
}
