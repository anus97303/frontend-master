import SignInForm from "@/components/auth/SignInForm";
import PageMeta from "@/components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | My School Management System"
        description="Access institutional portals for students, teachers, parents, and administrative staff."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
