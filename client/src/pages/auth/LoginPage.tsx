import { useLocation, useNavigate, Link } from "react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Log in to MarketVerse</h1>
      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      <p className="text-center text-sm text-text-muted">
        No account?{" "}
        <Link to="/register" className="text-accent underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
