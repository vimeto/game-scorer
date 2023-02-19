import { type GetServerSideProps } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../server/db";

const isValid = (token: string, email: string, userId: string) => {
  try {
    const jwtResponse = jwt.verify(token, email + String(process.env.EMAIL_SECRET) || "");
    return ((jwtResponse as jwt.JwtPayload).id === userId);
  } catch (e) {
    return false;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: update this to a TRPC query, with error and success messages
  const emailToken = String(context.query.emailToken) || "invalid";

  let user = await prisma.user.findUnique({ where: { emailHash: emailToken } });

  if (user && isValid(emailToken, String(user.email) || "", String(user.id))) {
    console.log("user found and token valid");

    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    if (user) {
      return {
        // TODO: add a success message to login page
        redirect: {
          destination: "/login",
          permanent: true,
        }
      }
    }
  }

  return {
    props: { redirect: false }
  }
};

const VerifyEmail = () => {
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
