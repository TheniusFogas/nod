"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

interface HeroSlide {
  img: string; eyebrow: string; title: string; subtitle: string; link?: string;
}

interface SettingsData {
  heroSlides: HeroSlide[];
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
  const activeCall = openCalls.find((c: any) => c.isActive);

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
                  <div className="exhibition-card__img-wrap">
                    <img
                      src={ex.coverImage || PLACEHOLDER_IMG}
                      alt={ex.title}
                      className="exhibition-card__img"
                    />
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

      {/* ── Open Call Banner ── */}
      {activeCall && (
        <section className="open-call-banner">
          <div className="container">
            <div className="open-call-banner__inner">
              <div>
                <div className="open-call-banner__label">Open Call</div>
                <div className="open-call-banner__title">{activeCall.title}</div>
                {activeCall.deadline && (
                  <p style={{ marginTop: 8, fontSize: "0.8rem", opacity: 0.7 }}>
                    Deadline: {formatDate(activeCall.deadline)}
                  </p>
                )}
              </div>
              <Link href={`/open-calls/${activeCall.slug}`} className="btn btn--dark">
                Apply Now →
              </Link>
            </div>
          </div>
        </section>
      )}

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
                  <div className="exhibition-card__img-wrap">
                    <img
                      src={ex.coverImage || PLACEHOLDER_IMG}
                      alt={ex.title}
                      className="exhibition-card__img"
                    />
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
