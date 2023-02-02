import { type NextPage } from "next";


const VerifyEmail: NextPage = () => {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#C7B8EA] to-[#485696]"
      >
      <h1 className="text-5xl font-extrabold text-center tracking-tight text-white/90 sm:text-[5rem]">
        Verify Email
      </h1>
      <h3 className="text-2xl font-extrabold text-center tracking-tight text-white/90 sm:text-[2rem]">
        Check your email for a link to verify your account.
      </h3>
      <p className="text-2xl font-extrabold text-center tracking-tight text-white/90 sm:text-[2rem]">
        {"Didn't receive an email? Check your spam folder or "}
        <button onClick={() => console.log("sending email..")} className="text-sky-300 hover:text-sky-500/90">
          resend verification email
        </button>
      </p>
    </main>
  );
};

export default VerifyEmail;
