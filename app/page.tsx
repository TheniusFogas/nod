"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
// Deployment trigger: 2026-03-04
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Exhibition {
  _id: string;
  title: string;
  artist: string;
  type: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  slug: string;
}

interface NewsItem {
  _id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  source: string;
  link: string;
}

interface OpenCall {
  _id: string;
  title: string;
  deadline: string;
  slug: string;
  coverImage?: string;
  isActive?: boolean;
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const KAKI = "#7a7a5a";

interface HeroSlide {
  img: string; eyebrow: string; title: string; subtitle: string; link?: string;
}

interface SettingsData {
  heroSlides: HeroSlide[];
  homepageExtraTitle?: string;
  homepageExtraContent?: string;
  homepageExtraImage?: string;
  homepageExtra2Title?: string;
  homepageExtra2Content?: string;
  homepageExtra2Image?: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings).catch(() => { });
    fetch("/api/exhibitions").then((r) => r.json()).then(setExhibitions).catch(() => { });
    fetch("/api/news").then((r) => r.json()).then(setNews).catch(() => { });
    fetch("/api/open-calls").then((r) => r.json()).then(setOpenCalls).catch(() => { });
  }, []);

  useEffect(() => {
    if (!settings?.heroSlides?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % settings.heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [settings]);

  const current = exhibitions.filter((e) => e.type === "current").slice(0, 3);
  const upcoming = exhibitions.filter((e) => e.type === "upcoming").slice(0, 3);
  const activeCalls = openCalls.filter((c: any) => c.showOnHomepage);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubscribed(true);
  }

  const slides = settings?.heroSlides || [];
  const slide = slides[currentSlide];

  return (
    <>
      <Nav dark />

      {/* ── Hero ── */}
      <section className="hero">
        {slide && (
          <>
            <img
              key={currentSlide}
              src={slide.img}
              alt="Exhibition"
              className="hero__img"
              style={{ animation: "fadeUp 1.2s ease forwards" }}
            />
            <div className="hero__content">
              <div className="hero__eyebrow fade-up">{slide.eyebrow}</div>
              <h1 className="hero__title fade-up fade-up-delay-1">{slide.title}</h1>
              <p className="hero__subtitle fade-up fade-up-delay-2">{slide.subtitle}</p>
              <Link href={slide.link || "/exhibitions"} className="hero__cta fade-up fade-up-delay-3">
                View More <span>→</span>
              </Link>
            </div>
          </>
        )}
        <div className="hero__indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
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
              {current.map((ex) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />}
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
      {activeCalls.map((activeCall: any) => (
        <section key={activeCall._id} className="open-call-banner" style={{ background: activeCall.coverImage ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${activeCall.coverImage}) center/cover no-repeat` : KAKI }}>
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
              {upcoming.map((ex) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />}
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
              {news.slice(0, 3).map((item) => (
                <a key={item._id} href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="news-card">
                  {item.image && (
                    <div className="news-card__img-wrap">
                      <img src={item.image} alt={item.title} className="news-card__img" />
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

      {/* ── Archive (Past Exhibitions) ── */}
      {exhibitions.filter(e => e.type === "past").length > 0 && (
        <section className="section" style={{ borderTop: "1px solid var(--grey-100)" }}>
          <div className="container">
            <div className="section-head">
              <span className="section-head__title">Past Exhibitions</span>
              <Link href="/exhibitions?type=past" className="section-head__link">
                View Archive
              </Link>
            </div>
            <div className="exhibition-grid">
              {exhibitions.filter(e => e.type === "past").slice(0, 3).map((ex) => (
                <Link href={`/exhibitions/${ex.slug}`} key={ex._id} className="exhibition-card">
                  <div className="exhibition-card__img-wrap" style={{ background: KAKI }}>
                    {ex.coverImage && <img src={ex.coverImage} alt={ex.title} className="exhibition-card__img" />}
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

      {/* ── Homepage Extra Section ── */}
      {settings?.homepageExtraContent && settings.homepageExtraContent.trim() !== "" && (
        <section className="section" style={{ background: "var(--cream)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: settings.homepageExtraImage ? "1fr 1fr" : "1fr", gap: 64, alignItems: "center" }}>
              {settings.homepageExtraImage && (
                <div className="fade-up">
                  <img src={settings.homepageExtraImage} alt={settings.homepageExtraTitle} style={{ width: "100%", height: "auto" }} />
                </div>
              )}
              <div className="fade-up">
                {settings.homepageExtraTitle && <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, marginBottom: 32 }}>{settings.homepageExtraTitle}</h2>}
                <div
                  className="rich-text"
                  dangerouslySetInnerHTML={{ __html: settings.homepageExtraContent }}
                  style={{ lineHeight: 1.8, color: "var(--grey-600)" }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Homepage Extra Section 2 ── */}
      {settings?.homepageExtra2Content && settings.homepageExtra2Content.trim() !== "" && (
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: settings.homepageExtra2Image ? "1fr 1fr" : "1fr", gap: 64, alignItems: "center" }}>
              <div className="fade-up" style={{ order: settings.homepageExtra2Image ? 2 : 1 }}>
                {settings.homepageExtra2Title && <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 400, marginBottom: 32 }}>{settings.homepageExtra2Title}</h2>}
                <div
                  className="rich-text"
                  dangerouslySetInnerHTML={{ __html: settings.homepageExtra2Content }}
                  style={{ lineHeight: 1.8, color: "var(--grey-600)" }}
                />
              </div>
              {settings.homepageExtra2Image && (
                <div className="fade-up" style={{ order: 1 }}>
                  <img src={settings.homepageExtra2Image} alt={settings.homepageExtra2Title} style={{ width: "100%", height: "auto" }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section className="newsletter-strip">
        <div className="container">
          <div className="newsletter-strip__inner">
            <div className="newsletter-strip__text">
              <h2>Stay informed</h2>
              <p>Receive invitations to openings, news, and calls for artists.</p>
            </div>
            {subscribed ? (
              <p style={{ color: "var(--accent)", fontSize: "0.9rem", fontStyle: "italic" }}>
                Thank you for subscribing.
              </p>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="newsletter-email"
                />
                <button type="submit">Subscribe</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
