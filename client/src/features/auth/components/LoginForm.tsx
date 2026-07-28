import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { ApiError } from "@/services/apiClient";

/**
 * Zod schema, matching the backend's Zod-first validation philosophy
 * (docs/BACKEND_ARCHITECTURE.md §8) so client and server reject the same
 * shapes for the same reasons — not a coincidence, a deliberate mirror.
 */
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess,
      onError: (error) => {
        // Deliberately generic per docs/BACKEND_ARCHITECTURE.md §9 — the API
        // returns the same UNAUTHORIZED error whether the email or password
        // was wrong, so the form must not imply which one.
        if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
          setError("root", { message: "Invalid email or password" });
        } else {
          setError("root", { message: "Something went wrong. Please try again." });
        }
      },
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={login.isPending}>
        Log in
      </Button>
    </form>
  );
}
