import { notFound } from "next/navigation";
import DashboardPage from "../page";

export default async function FolderPage({ params }: { params: Promise<{ folder: string[] }> }) {
  const { folder } = await params;
  if (folder.length > 2) notFound();
  return <DashboardPage />;
}
