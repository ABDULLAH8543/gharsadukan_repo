import WebThreeClient from "./web-three-client";

interface WebThreePageProps {
  userId: string;
}

export default function WebThreePage({ userId }: WebThreePageProps) {
  return <WebThreeClient userId={userId} />;
}

