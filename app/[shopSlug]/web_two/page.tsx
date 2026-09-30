import WebTwoClient from "./web-two-client";

interface WebTwoPageProps {
  userId: string;
}

export default function WebTwoPage({ userId }: WebTwoPageProps) {
  return <WebTwoClient userId={userId} />;
}
