import { getMessages } from "@/lib/queries";
import MessageList from "@/components/admin/MessageList";

export const metadata = { title: "Pesan" };

export default async function AdminMessages() {
  return <MessageList messages={await getMessages()} />;
}
