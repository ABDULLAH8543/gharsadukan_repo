import { redirect } from 'next/navigation';

export default function Home() {
  // Root domain should enter the dashboard flow.
  redirect('/dashboard');
}