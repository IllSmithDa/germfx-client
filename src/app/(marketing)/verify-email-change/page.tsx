import VerifyEmailChangeClient from "./VerifyEmailChangeCilent";


type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata = {
  title: "Verify Email Change – SideFX.ai",
  description: "Confirm your SideFX account email change.",
};

export default async function VerifyEmailChangePage({ searchParams }: Props) {
  const params = await searchParams;

  return <VerifyEmailChangeClient token={params.token ?? ""} />;
}