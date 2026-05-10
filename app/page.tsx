import { cookies } from "next/headers";
import ClientHomepage from "./client-homepage";

export default async function Home() {

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  const loggedIn = !!sessionCookie;

  return <div>
    <ClientHomepage loggedIn={loggedIn}></ClientHomepage>
  </div>
}