/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from "next/router";
import { useState } from "react";
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
  color: string;
};

const createRandomHex = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const SignUpForm = () => {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<SignUpFormValues>({
    defaultValues: {
      color: createRandomHex(),
    }
  });
  const router = useRouter();
  const signUpMutation = api.user.create.useMutation();

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data, e) => {
    e?.preventDefault();

    try {
      const signupResult = await signUpMutation.mutateAsync(data);

      // TODO: remove this
      if (!signupResult) { throw new Error("Failed to create user..."); }

      console.log("user created, please now login");
      // TODO: create a notice to user about this

      const callbackUrl = router.query.callbackUrl ? String(router.query.callbackUrl) : "/";
      await router.replace({
        pathname: "/login",
        query: { callbackUrl },
      });
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      }
      else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 items-center">
        <h1 className="mb-2 text-5xl font-extrabold text-center tracking-tight text-white/90 sm:text-[5rem]">
          SignUp
        </h1>
        {error && (
          <div className="bg-red-400/70 p-2 rounded outline-1 outline-red-400 outline w-60 text-center text-white">
            {error}
          </div>
        )}
        <LoginInput id={"firstName"} type={"text"} autoComplete="given-name" placeholder={"First name"} {...register("firstName", { required: true })} />
        <LoginInput id={"lastName"} type={"text"} autoComplete="family-name" placeholder={"Last name"} {...register("lastName", { required: true })} />
        <LoginInput id={"username"} type={"text"} autoComplete="username" placeholder={"Username"} {...register("username", { required: true })} />
        <LoginInput id={"email"} type={"email"} autoComplete="email" placeholder={"Email"} {...register("email", { required: true })} />
        <LoginInput id={"password"} type={"password"} autoComplete="new-password" placeholder={"Password"} {...register("password", { required: true })} />
        <LoginInput id={"passwordConfirmation"} type={"password"} autoComplete="new-password" placeholder={"Confirm password"} {...register("passwordConfirmation", { required: true })} />
        <div className="flex flex-row items-center gap-4 w-60 text-white">
          <input type="color" id="colorwheel" {...register("color")} />
          <label htmlFor="color">Choose a background-color</label>
        </div>
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
        className="block mx-auto mt-4 text-lg font-bold text-white/60 no-underline transition hover:text-white/90 hover:scale-x-[102.5%]"
        onClick={() => router.push("/login")}
        >
        An existing user? Login →
      </button>
    </main>
  );
};

export default SignUpForm;
