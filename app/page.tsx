import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import { Exhibition } from "@/models/Exhibition";
import { News } from "@/models/News";
import { OpenCall } from "@/models/OpenCall";
import { Settings } from "@/models/Settings";
import { HeroLoader } from "@/components/HeroLoader";
import { NewsletterStrip } from "@/components/NewsletterStrip";
import Image from "next/image";
import { PageContent } from "@/models/PageContent";
import type { Metadata } from "next";
import { cache } from "react";
import { formatDate } from "@/lib/utils";
import { getExhibitionStatus } from "@/lib/exhibitions";

const KAKI = "var(--cream)";

// Senior Architecture: Incremental Static Regeneration (ISR)
export const revalidate = 3600;

/**
 * Senior Architecture: Memoized Data Fetching
 * Consolidates homepage data into a single request lifecycle with projections.
 */
const getHomeData = cache(async () => {
  await dbConnect();

  const [settings, exhibitions, news, openCalls, cms] = await Promise.all([
    Settings.findOne({}).lean(),
    Exhibition.find({}).sort({ startDate: -1 }).lean(),
    News.find({}).sort({ date: -1 }).limit(3).lean(),
    OpenCall.find({ showOnHomepage: true }).lean(),
    PageContent.findOne({ slug: "home" }).lean()
  ]);

  return { settings, exhibitions, news, openCalls, cms };
});


export async function generateMetadata(): Promise<Metadata> {
  const { cms } = await getHomeData();
  const title = cms?.seoTitle || "NOD FLOW | Contemporary Art Gallery";
  const description = cms?.seoDescription || "NOD FLOW is a contemporary art gallery and creative hub.";
  const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] }
  };
}

export default async function HomePage() {
  const { settings, exhibitions, news, openCalls } = await getHomeData();

  const current = exhibitions.filter((e: any) => getExhibitionStatus(e.startDate, e.endDate) === "current").slice(0, 3);
  const upcoming = exhibitions.filter((e: any) => getExhibitionStatus(e.startDate, e.endDate) === "upcoming").slice(0, 3);
  const past = exhibitions.filter((e: any) => getExhibitionStatus(e.startDate, e.endDate) === "past").slice(0, 3);

  const slides = settings?.heroSlides || [];

  return (
    <>
      <Nav dark />

      {/* ── Hero ── */}
      <section className="hero">
        {slides.length > 0 && <HeroLoader slides={slides} />}
      </section>

      {/* ── Current Exhibitions ── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-head__title">Currently on View</span>
            <Link href="/exhibitions?type=current" className="section-head__link">
              View All
            </Link>
          </div>
          {current.length === 0 ? (
            <p className="text-muted" style={{ fontStyle: "italic" }}>
              No exhibitions currently on view. Check back soon.
            </p>
          ) : (
            <div className="exhibition-grid">
              {current.map((ex: any) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id.toString()} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && (
                      <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />
                    )}
                  </div>
                  <div className="exhibition-card__tag">On View</div>
                  <div className="exhibition-card__title">{ex.title}</div>
                  <div className="exhibition-card__artist">{ex.artist}</div>
                  <div className="exhibition-card__dates">
                    {formatDate(ex.startDate)} — {formatDate(ex.endDate)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Open Call Banners ── */}
      {openCalls.map((activeCall: any) => (
        <section key={activeCall._id.toString()} className="open-call-banner" style={{ background: activeCall.coverImage ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${activeCall.coverImage}) center/cover no-repeat` : KAKI }}>
          <div className="container">
            <div className="open-call-banner__inner">
              <div style={{ color: "white" }}>
                <div className="open-call-banner__label" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}>Open Call</div>
                <div className="open-call-banner__title" style={{ color: "white" }}>{activeCall.title}</div>
                {activeCall.deadline && (
                  <p style={{ marginTop: 8, fontSize: "0.8rem", opacity: 0.8, color: "white" }}>
                    Deadline: {formatDate(activeCall.deadline)}
                  </p>
                )}
              </div>
              <Link href={`/open-calls/${activeCall.slug}`} className="btn btn--dark" style={{ background: "white", color: "#222", border: "none", flexShrink: 0 }}>
                Apply Now →
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ── Upcoming Exhibitions ── */}
      {upcoming.length > 0 && (
        <section className="section" style={{ background: "var(--cream)" }}>
          <div className="container">
            <div className="section-head">
              <span className="section-head__title">Coming Soon</span>
              <Link href="/exhibitions?type=upcoming" className="section-head__link">
                View All
              </Link>
            </div>
            <div className="exhibition-grid">
              {upcoming.map((ex: any) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id.toString()} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && (
                      <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />
                    )}
                  </div>
                  <div className="exhibition-card__tag" style={{ color: "#004085" }}>
                    Upcoming
                  </div>
                  <div className="exhibition-card__title">{ex.title}</div>
                  <div className="exhibition-card__artist">{ex.artist}</div>
                  <div className="exhibition-card__dates">
                    Opening {formatDate(ex.startDate)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest News ── */}
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="section-head__title">Latest News</span>
              <Link href="/news" className="section-head__link">
                All News
              </Link>
            </div>
            <div className="news-grid">
              {news.map((item: any) => (
                <a key={item._id.toString()} href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="news-card">
                  {item.image && (
                    <div className="news-card__img-wrap" style={{ position: 'relative' }}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="news-card__source">{item.source}</div>
                  <div className="news-card__title">{item.title}</div>
                  <div className="news-card__date">{formatDate(item.date)}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Archive ── */}
      {past.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid var(--grey-100)" }}>
          <div className="container">
            <div className="section-head">
              <span className="section-head__title">Past Exhibitions</span>
              <Link href="/exhibitions?type=past" className="section-head__link">
                View Archive
              </Link>
            </div>
            <div className="exhibition-grid">
              {past.map((ex: any) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id.toString()} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && (
                      <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />
                    )}
                  </div>
                  <div className="exhibition-card__tag" style={{ color: "var(--grey-500)" }}>Archive</div>
                  <div className="exhibition-card__title">{ex.title}</div>
                  <div className="exhibition-card__artist">{ex.artist}</div>
                  <div className="exhibition-card__dates">
                    {formatDate(ex.startDate)} — {formatDate(ex.endDate)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Homepage Extras ── */}
      {settings?.homepageExtraContent && (
        <section className="section" style={{ background: "var(--cream)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: settings.homepageExtraImage ? "1fr 1fr" : "1fr", gap: 64, alignItems: "center" }}>
              {settings.homepageExtraImage && (
                <div className="fade-up" style={{ position: 'relative', minHeight: 400 }}>
                  <Image
                    src={settings.homepageExtraImage}
                    alt={settings.homepageExtraTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className="fade-up">
                {settings.homepageExtraTitle && <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, marginBottom: 32 }}>{settings.homepageExtraTitle}</h2>}
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: settings.homepageExtraContent }} style={{ lineHeight: 1.8, color: "var(--grey-600)" }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {settings?.homepageExtra2Content && (
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: settings.homepageExtra2Image ? "1fr 1fr" : "1fr", gap: 64, alignItems: "center" }}>
              <div className="fade-up" style={{ order: settings.homepageExtra2Image ? 2 : 1 }}>
                {settings.homepageExtra2Title && <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, marginBottom: 32 }}>{settings.homepageExtra2Title}</h2>}
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: settings.homepageExtra2Content }} style={{ lineHeight: 1.8, color: "var(--grey-600)" }} />
              </div>
              {settings.homepageExtra2Image && (
                <div className="fade-up" style={{ order: 1, position: 'relative', minHeight: 400 }}>
                  <Image
                    src={settings.homepageExtra2Image}
                    alt={settings.homepageExtra2Title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <NewsletterStrip />
      <Footer />
    </>
  );
}
