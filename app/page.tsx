import { cookies } from "next/headers";
import ClientHomepage from "./client-homepage";
import { Toaster } from "sonner";

export default async function Home() {

  // Proxy page to get cookie information for the client-side page
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  const loggedIn = !!sessionCookie;

  return <div>
    <ClientHomepage loggedIn={loggedIn}></ClientHomepage>
    <Toaster />
  </div>
}