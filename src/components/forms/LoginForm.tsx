/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { LoginInput } from "../ui/LoginInput";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const router = useRouter();

  const setErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }

  const onSubmit: SubmitHandler<LoginFormValues> = async (data, e) => {
    e?.preventDefault();

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!res || res.status !== 200) {
        const error = res?.error || "";
        throw new Error(error);
      }

      const callbackUrl = router.query.callbackUrl ? String(router.query.callbackUrl) : "/";

      await router.replace(callbackUrl);
    } catch (e) {
      if (typeof e === "string") {
        setErrorMessage(e);
      }
      else if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 items-center">
        <h1 className="text-5xl font-extrabold text-center tracking-tight text-white/90 sm:text-[5rem]">
          Login
        </h1>
        {error && (
          <div className="bg-red-400/70 p-2 rounded outline-1 outline-red-400 outline w-60 text-center text-white">
            {error}
          </div>
        )}
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
        className="block mx-auto mt-4 text-lg font-bold text-white/60 no-underline transition hover:text-white/90 hover:scale-x-[102.5%]"
        onClick={() => router.push("/signup")}
        >
        Already a user? Sign up →
      </button>
    </main>
  );
};

export default LoginForm;
