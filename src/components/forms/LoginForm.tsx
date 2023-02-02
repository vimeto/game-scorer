/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../utils/api";
import { LoginInput } from "../ui/LoginInput";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormValues> = async (data, e) => {
    e?.preventDefault();

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!res || res.status !== 200) {
        throw new Error("Failed to singin...");
      }

      const callbackUrl = router.query.callbackUrl ? String(router.query.callbackUrl) : "/";

      await router.replace(callbackUrl);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#C7B8EA] to-[#485696]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <h1 className="text-5xl font-extrabold text-center tracking-tight text-white/90 sm:text-[5rem]">
          Login
        </h1>
        <LoginInput id={"email"} type={"text"} autoComplete="email" placeholder={"Email or username"} {...register("email", { required: true })} />
        <LoginInput id={"password"} type={"password"} autoComplete="current-password" placeholder={"Password"} {...register("password", { required: true })} />
        <div className="text-center">
          <button
            type="submit"
            className="rounded-lg bg-white/10 px-6 py-2 font-semibold text-white/80 no-underline transition hover:bg-white/20 hover:text-white"
            >
              Login
          </button>
        </div>
      </form>
      <button
        className="block mx-auto mt-4 text-lg font-bold text-white/60 no-underline transition hover:text-white/90 hover:scale-105"
        onClick={() => router.push("/signup")}
        >
        Already a user? Sign up →
      </button>
    </main>
  );
};

export default LoginForm;
