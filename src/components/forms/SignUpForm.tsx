/* eslint-disable @typescript-eslint/no-misused-promises */
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../utils/api";
import { LoginInput } from "../ui/LoginInput";

type SignUpFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const SignUpForm = () => {
  const { register, handleSubmit } = useForm<SignUpFormValues>();
  const router = useRouter();
  const signUpMutation = api.auth.signUp.useMutation();

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data, e) => {
    e?.preventDefault();

    try {
      const userRes = await signUpMutation.mutateAsync(data);

      // TODO: remove this
      if (!userRes) { throw new Error("Failed to create user..."); }

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
      console.log("err", e);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#C7B8EA] to-[#485696]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h1 className="mb-2 text-5xl font-extrabold text-center tracking-tight text-white/90 sm:text-[5rem]">
          SignUp
        </h1>
        <LoginInput id={"firstName"} type={"text"} autoComplete="given-name" placeholder={"First name"} {...register("firstName", { required: true })} />
        <LoginInput id={"lastName"} type={"text"} autoComplete="family-name" placeholder={"Last name"} {...register("lastName", { required: true })} />
        <LoginInput id={"username"} type={"text"} autoComplete="username" placeholder={"Username"} {...register("username", { required: true })} />
        <LoginInput id={"email"} type={"email"} autoComplete="email" placeholder={"Email"} {...register("email", { required: true })} />
        <LoginInput id={"password"} type={"password"} autoComplete="new-password" placeholder={"Password"} {...register("password", { required: true })} />
        <LoginInput id={"passwordConfirmation"} type={"password"} autoComplete="new-password" placeholder={"Confirm password"} {...register("passwordConfirmation", { required: true })} />
        <div className="text-center">
          <button
            type="submit"
            className="rounded-lg bg-white/10 px-6 py-2 font-semibold text-white/80 no-underline transition hover:bg-white/20 hover:text-white"
            >
              SignUp
          </button>
        </div>
      </form>
      <button
        className="block mx-auto mt-4 text-lg font-bold text-white/60 no-underline transition hover:text-white/90 hover:scale-105"
        onClick={() => router.push("/login")}
        >
        An existing user? Login →
      </button>
    </main>
  );
};

export default SignUpForm;
