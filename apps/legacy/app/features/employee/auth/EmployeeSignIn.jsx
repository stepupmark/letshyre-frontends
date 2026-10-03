import { useTranslation } from "react-i18next";
import loginImage from "@/assets/employee-reg.webp";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export function EmployeeSignIn() {
  const { t } = useTranslation("auth");
  return (
    <AuthLayout image={loginImage} roleLabel={t("roles.employee")} imageFit="cover">
      <LoginForm role="Candidate" registerLink="/employee/register" />
    </AuthLayout>
  );
}
