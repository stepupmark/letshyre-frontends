import { useTranslation } from "react-i18next";
import loginImage from "@/assets/employer-reg.webp";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export function EmployerSignIn() {
  const { t } = useTranslation("auth");
  return (
    <AuthLayout image={loginImage} roleLabel={t("roles.employer")} imageFit="cover">
      <LoginForm role="Employer" registerLink="/employer/register" />
    </AuthLayout>
  );
}
