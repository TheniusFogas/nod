import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata = {
    title: "Subscribe | NOD FLOW",
    description: "Join the NOD FLOW community to receive updates on exhibitions, open calls, and gallery news.",
};

export default function SubscribePage() {
    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)", minHeight: "80vh", display: "flex", alignItems: "center", background: "var(--cream)" }}>
                <section className="section" style={{ width: "100%" }}>
                    <div className="container" style={{ maxWidth: 600 }}>
                        <div style={{ textAlign: "center", marginBottom: 48 }}>
                            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", marginBottom: 16 }}>Stay Connected</h1>
                            <p style={{ color: "var(--grey-600)", lineHeight: 1.6 }}>
                                Subscribe to our newsletter to stay updated on upcoming exhibitions, artist news, and exclusive events.
                            </p>
                        </div>

                        <div style={{ padding: 40, background: "var(--white)" }}>
                            <NewsletterForm />
                        </div>

                        <div style={{ textAlign: "center", marginTop: 32 }}>
                            <p style={{ fontSize: "0.8rem", color: "var(--grey-400)" }}>
                                By subscribing, you agree to our privacy policy and to receive marketing communications.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
