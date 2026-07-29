
import { fetchUserSettings } from "@/lib/server/fetchUserSettings";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {

  const settings = await fetchUserSettings();

  return <SettingsClient initialSettings={settings} />;
}