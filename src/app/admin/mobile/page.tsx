import { redirect } from 'next/navigation';

export default function MobileAdminRedirect() {
  redirect('/admin');
}
