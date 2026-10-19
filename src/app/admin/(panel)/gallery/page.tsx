import { getGallery } from "@/lib/queries";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = { title: "Galeri" };

export default async function AdminGallery() {
  return <GalleryManager items={await getGallery()} />;
}
