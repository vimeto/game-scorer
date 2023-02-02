import { type GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { getSession, signIn, signOut } from "next-auth/react";
import jwt from "jsonwebtoken";
import { prisma } from "../../server/db";
import { useEffect } from "react";

const isValid = (token: string, email: string, userId: string) => {
  try {
    const jwtResponse = jwt.verify(token, email + String(process.env.EMAIL_SECRET) || "");
    return ((jwtResponse as jwt.JwtPayload).id === userId);
  } catch (e) {
    return false;
  }
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { req } = context;
//   const token = await getToken({ req, secret: process.env.SECRET });
//   const userId = token?.id;

//   if (!userId) { return { redirect: { destination: "/account/login", permanent: true } }; }

//   const emailToken = String(context.query.emailToken) || "";

//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user) { return { redirect: { destination: "/account/login", permanent: true } }; }

//   console.log("user", user);

//   if (isValid(emailToken, String(user.email) || "", userId)) {
//     // update token to be verified
//     await prisma.user.update({
//       where: { id: userId },
//       data: { emailVerified: new Date() },
//     });

//     const res = await signIn("refresh-user", {
//       redirect: false,
//     })

//     console.log("ress", res);

//     return {
//       redirect: {
//         destination: "/ass",
//         permanent: true,
//       },
//     }
//   }

//   return {
//     redirect: {
//       destination: "/verify_email",
//       permanent: true,
//     },
//   };
// };

const VerifyEmail = () => {
  useEffect(() => {
    (async () => {
      const res = await signIn("refresh-user", {
        redirect: false,
      });

      console.log("ress", res);
    })().catch(e => console.log("err", e));
  }, []);


  const logout = () => {
    signOut().catch(e => console.log("err", e));
  };

  return (
    <div>
      <h1 onClick={() => logout()}>Verify Email</h1>
    </div>
  );
};

export default VerifyEmail;
