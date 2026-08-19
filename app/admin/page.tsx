import { Metadata } from "next";
import DashboardLoginPage from "@/app/dashboard/login/page";

export const metadata: Metadata = {
  title: "Acceso Administrador | DV Performing Arts",
  description: "Panel de control y administración para DV Performing Arts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <DashboardLoginPage />;
}
