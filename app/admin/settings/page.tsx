import AdminNav from "@/components/admin-nav";
import SettingsForm from "./settings-form";
import { getShopInfo } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const info = await getShopInfo();

  return (
    <main className="container-page py-10">
      <AdminNav />
      <p className="eyebrow">ADMIN SETTINGS</p>
      <h1 className="serif mt-2 text-5xl">Дэлгүүрийн мэдээлэл</h1>
      <SettingsForm initial={info} />
    </main>
  );
}
