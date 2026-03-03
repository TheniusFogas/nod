import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import SessionProvider from "@/components/SessionProvider";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();


    return (
        <SessionProvider>
            <div className="admin-layout">
                <AdminNav />
                <main className="admin-main">{children}</main>
            </div>
        </SessionProvider>
    );
}
