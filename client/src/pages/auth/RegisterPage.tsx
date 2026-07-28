import { useNavigate, Link } from "react-router";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Create your MarketVerse account</h1>
      <RegisterForm onSuccess={() => navigate("/", { replace: true })} />
      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-accent underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
