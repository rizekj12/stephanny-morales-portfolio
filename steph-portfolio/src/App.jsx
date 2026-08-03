import { useState, useEffect, useRef, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import translations from "./translations.json";
import "./App.css";

const allGalleryImages = [
  "/images/dental/dental2.jpg",
  "/images/dental/IMG_0602.png",
  "/images/dental/IMG_1364.png",
  "/images/dental/IMG_9815.png",
  "/images/dental/IMG_9826.png",
  "/images/dental/pic1.jpg",
  "/images/medical/facial_treatment.jpg",
  "/images/medical/IMG_0060.jpg",
  "/images/medical/IMG_9268.jpg",
];

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">
        &#x2715;
      </button>
      <img
        src={src}
        alt="Vista ampliada"
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function GalleryCarousel({ images }) {
  const trackRef = useRef(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const touchStartX = useRef(0);
  const wasSwiping = useRef(false);

  if (images.length === 0) return null;

  const scrollByOne = (dir) => {
    if (!trackRef.current) return;
    const slide = trackRef.current.querySelector(".gallery-slide");
    const slideWidth = slide ? slide.offsetWidth + 10 : 220;
    trackRef.current.scrollBy({ left: dir * slideWidth, behavior: "smooth" });
  };

  return (
    <>
      <div className="gallery-carousel">
        <div ref={trackRef} className="gallery-track">
          {images.map((src, i) => (
            <div key={i} className="gallery-slide">
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="gallery-slide-img"
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                  wasSwiping.current = false;
                }}
                onTouchMove={(e) => {
                  if (Math.abs(e.touches[0].clientX - touchStartX.current) > 8)
                    wasSwiping.current = true;
                }}
                onClick={() => { if (!wasSwiping.current) setLightboxSrc(src); }}
              />
            </div>
          ))}
        </div>

        <div className="gallery-nav">
          <button className="post-arrow" onClick={() => scrollByOne(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="post-arrow" onClick={() => scrollByOne(1)} aria-label="Siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}

function PostCarousel({ posts, lang, emptyText }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const items = posts.slice(0, 10);
  const post = items[current];

  const goTo = (idx) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 180);
  };

  return (
    <section className="news-section">
      {items.length === 0 && (
        <div className="news-empty">
          <p>{emptyText}</p>
        </div>
      )}
      {items.length > 0 && (
        <>
          <article className={`post-card${fading ? " post-card--fading" : ""}`}>
            {post.imageUrl && post.mediaType === "video" && (
              <video
                src={post.imageUrl}
                className="news-img"
                controls
                playsInline
              />
            )}
            {post.imageUrl && post.mediaType !== "video" && (
              <img src={post.imageUrl} alt={post.title} className="news-img" />
            )}
            <div className="post-card-body">
              {post.createdAt && (
                <time className="news-date">
                  {post.createdAt
                    .toDate()
                    .toLocaleDateString(lang === "es" ? "es-CO" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </time>
              )}
              <h3 className="news-card-title">{post.title}</h3>
              <p className="news-content">{post.content}</p>
            </div>
          </article>

          {items.length > 1 && (
            <div className="post-nav">
              <button
                className="post-arrow"
                onClick={() =>
                  goTo((current - 1 + items.length) % items.length)
                }
                aria-label="Anterior"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div
                className="gallery-dots"
                style={{ position: "static", margin: "0 8px" }}
              >
                {items.map((_, i) => (
                  <button
                    key={i}
                    className={`gallery-dot${i === current ? " gallery-dot--active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Post ${i + 1}`}
                  />
                ))}
              </div>
              <button
                className="post-arrow"
                onClick={() => goTo((current + 1) % items.length)}
                aria-label="Siguiente"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <span className="post-counter">
                {current + 1} / {items.length}
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { paper: "#0D0B09" },
  },
});

function ServiceModal({ service, onClose }) {
  const [displayed, setDisplayed] = useState(null);
  useEffect(() => {
    if (service) setDisplayed(service);
  }, [service]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={!!service}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            px: 1,
            py: 0.5,
            backgroundColor: "#0D0B09",
            backgroundImage: "none",
            border: "1px solid #C9A55A",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "1.25rem",
            color: "#C9A55A",
            pr: 6,
            pb: 1,
          }}
        >
          {displayed?.title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "#C9A55A",
              "&:hover": { backgroundColor: "#2A2318", color: "#E0C880" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "#2A2318" }}>
          <List disablePadding>
            {displayed?.items?.map((item) => (
              <ListItem
                key={item}
                disableGutters
                sx={{
                  py: 1,
                  px: 0.5,
                  borderBottom: "1px solid rgba(201, 165, 90, 0.2)",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <FiberManualRecordIcon
                    sx={{ fontSize: 8, color: "#C9A55A" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    color: "#F0E8D8",
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ServicesSection({ t }) {
  const [dentalOpen, setDentalOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  return (
    <section className="svc-section">
      <p className="svc-tagline">{t.servicesTagline}</p>
      <div className="svc-grid">
        <div className="svc-col">
          <button
            className="svc-toggle-btn"
            onClick={() => setDentalOpen(!dentalOpen)}
            aria-expanded={dentalOpen}
          >
            <span className="svc-plus">{dentalOpen ? "×" : "+"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5.5c1.5-1.5 3-2 4.5-2 3.5 0 5 3 5 5.5 0 3-2 5-3 8.5-.5 1.5-1.5 2-2.5 2-1 0-2-.5-2.5-2-.5-1.5-.5-3-1.5-3s-1 1.5-1.5 3c-.5 1.5-1.5 2-2.5 2s-2-.5-2.5-2C5 13.5 3 11.5 3 8.5 3 6 4.5 3 8 3c1.5 0 3 .5 4.5 2z" />
            </svg>
            <span className="svc-label">{t.dental.title}</span>
          </button>
          <div className={`svc-list-wrap${dentalOpen ? " svc-list-wrap--open" : ""}`}>
            <ul className="svc-list">
              {t.dental.items.map((item) => (
                <li key={item.name}>
                  <strong className="svc-item-name">{item.name}</strong>
                  <span className="svc-item-desc">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="svc-col">
          <button
            className="svc-toggle-btn"
            onClick={() => setMedicalOpen(!medicalOpen)}
            aria-expanded={medicalOpen}
          >
            <span className="svc-plus">{medicalOpen ? "×" : "+"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m18 2 4 4" />
              <path d="m17 7 1-5" />
              <path d="M3 22 8.5 16.5" />
              <path d="m15 6-8.5 8.5-2.5 5 5-2.5L17.5 9" />
              <path d="m5 16 3 3" />
              <path d="m14 4 5 5" />
            </svg>
            <span className="svc-label">{t.medical.title}</span>
          </button>
          <div className={`svc-list-wrap${medicalOpen ? " svc-list-wrap--open" : ""}`}>
            <ul className="svc-list">
              {t.medical.items.map((item) => (
                <li key={item.name}>
                  <strong className="svc-item-name">{item.name}</strong>
                  <span className="svc-item-desc">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState("es");
  const [posts, setPosts] = useState(null);
  const [galleryImages, setGalleryImages] = useState(allGalleryImages);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setPosts([]),
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "gallery"),
      (snap) => {
        const items = snap.docs.map((d) => d.data());
        items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        const urls = items.map((d) => d.url);
        setGalleryImages(urls.length > 0 ? urls : allGalleryImages);
      },
      () => {},
    );
    return unsub;
  }, []);

  const t = translations[lang];
  const otherLang = lang === "es" ? "en" : "es";

  return (
    <>
      <nav className="top-nav">
        <div className="top-nav-logo">
          <img
            src="/images/logo_black.jpg"
            alt="Stephanny Morales Alvarez"
            className="nav-logo-img"
          />
        </div>
        <div className="top-nav-right">
          <a
            href="https://www.instagram.com/stephanny__morales?igsh=MTR1dTd0Y2N2Njk0Mw=="
            className="nav-icon-btn"
            aria-label={t.instagramLabel}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://wa.me/573507105388"
            className="nav-icon-btn"
            aria-label={t.whatsappLabel}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
          </a>
          <a
            href="mailto:Stephannymoralesalvarez@gmail.com"
            className="nav-icon-btn"
            aria-label="Email"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 7 10-7" />
            </svg>
          </a>
          <span className="nav-divider" aria-hidden="true" />
          <button
            className="lang-toggle"
            onClick={() => setLang(otherLang)}
            aria-label={`Switch to ${otherLang.toUpperCase()}`}
          >
            <span className={lang === "en" ? "lang-active" : ""}>EN</span>
            <span className="lang-divider">|</span>
            <span className={lang === "es" ? "lang-active" : ""}>ES</span>
          </button>
        </div>
      </nav>

      <header className="hero-section">
        <svg className="hero-arc" viewBox="0 0 866 577" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="heroWaveFade" x1="0%" y1="100%" x2="60%" y2="0%">
              <stop offset="0%" stopColor="#9A7420" stopOpacity="0"/>
              <stop offset="30%" stopColor="#9A7420" stopOpacity="1"/>
              <stop offset="44%" stopColor="#9A7420" stopOpacity="0.25"/>
              <stop offset="58%" stopColor="#9A7420" stopOpacity="1"/>
              <stop offset="100%" stopColor="#9A7420" stopOpacity="1"/>
            </linearGradient>
          </defs>
          <path d="M865.17 2.4537C200 110 72 224 392 340C823.98 452.65 659.218 531.434 0.170378 576.454" stroke="url(#heroWaveFade)" strokeWidth="3"/>
        </svg>

        <div className="hero-text">
          <h1 className="hero-headline">
            {t.heroTitle1}{" "}
            <span className="hero-gold-word">{t.heroGoldWord}</span>{" "}
            {t.heroTitle2}
          </h1>
          <p className="hero-bio">{t.heroBio}</p>
          <div className="hero-cta">
            <a
              href="https://wa.me/573507105388"
              className="btn-book"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.bookBtn}
            </a>
            <a href="#gallery" className="btn-gallery">
              {t.galleryBtn} →
            </a>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img
            src="/images/profilePic_transparent_bg.png"
            alt="Stephanny Morales Alvarez"
            className="hero-img"
          />
        </div>
      </header>

      <ServicesSection t={t} />

      <section className="gallery-section" id="gallery">
        <div className="gallery-header">
          <span className="gallery-eyebrow">{t.patientGalleryLabel}</span>
          <h2 className="gallery-heading">{t.patientGalleryTitle}</h2>
        </div>
        <GalleryCarousel images={galleryImages} />
      </section>

      <section className="news-section-full">
        <div className="news-header">
          <span className="news-eyebrow">{t.newsEyebrow}</span>
          <h2 className="news-heading">{t.newsHeading}</h2>
        </div>
        {posts === null && (
          <div className="news-spinner-wrap">
            <div className="news-spinner" />
          </div>
        )}
        {posts !== null && (
          <PostCarousel posts={posts} lang={lang} emptyText={t.newsEmpty} />
        )}
      </section>

      <div className="portfolio">
        <a
          href="https://wa.me/573507105388"
          className="appointment-btn"
          aria-label={t.appointmentBtn}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="whatsapp-icon"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          <span>{t.appointmentBtn}</span>
        </a>
      </div>

    </>
  );
}

export default App;
