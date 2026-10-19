import { getProfile } from "@/lib/profile";
import ProfileForm from "@/components/admin/ProfileForm";

export const metadata = { title: "Profil" };

export default async function AdminProfile() {
  return <ProfileForm initial={await getProfile()} />;
}
