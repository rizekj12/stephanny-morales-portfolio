import { useState, useEffect } from "react";
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

function GalleryCarousel() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const goTo = (idx) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 200);
  };

  const prev = (e) => {
    e.stopPropagation();
    goTo((current - 1 + allGalleryImages.length) % allGalleryImages.length);
  };
  const next = (e) => {
    e.stopPropagation();
    goTo((current + 1) % allGalleryImages.length);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % allGalleryImages.length);
        setFading(false);
      }, 200);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="gallery-carousel">
        <img
          src={allGalleryImages[current]}
          alt={`Foto ${current + 1}`}
          className={`gallery-img${fading ? " gallery-img--fading" : ""}`}
          onClick={() => setLightboxSrc(allGalleryImages[current])}
        />

        <button
          className="gallery-arrow gallery-arrow--left"
          onClick={prev}
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
        <button
          className="gallery-arrow gallery-arrow--right"
          onClick={next}
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

        <div className="gallery-dots">
          {allGalleryImages.map((_, i) => (
            <button
              key={i}
              className={`gallery-dot${i === current ? " gallery-dot--active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}

function PostCarousel({ posts, lang, emptyText, title }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const items = posts.slice(0, 10);
  const post = items[current];

  const goTo = (idx) => {
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 180);
  };

  return (
    <section className="news-section">
      <h2 className="news-title">{title}</h2>
      {items.length === 0 && (
        <div className="news-empty"><p>{emptyText}</p></div>
      )}
      {items.length > 0 && (
        <>
          <article className={`post-card${fading ? " post-card--fading" : ""}`}>
            {post.imageUrl && post.mediaType === "video" && (
              <video src={post.imageUrl} className="news-img" controls playsInline />
            )}
            {post.imageUrl && post.mediaType !== "video" && (
              <img src={post.imageUrl} alt={post.title} className="news-img" />
            )}
            <div className="post-card-body">
              {post.createdAt && (
                <time className="news-date">
                  {post.createdAt.toDate().toLocaleDateString(
                    lang === "es" ? "es-CO" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </time>
              )}
              <h3 className="news-card-title">{post.title}</h3>
              <p className="news-content">{post.content}</p>
            </div>
          </article>

          {items.length > 1 && (
            <div className="post-nav">
              <button className="post-arrow" onClick={() => goTo((current - 1 + items.length) % items.length)} aria-label="Anterior">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="gallery-dots" style={{ position: 'static', margin: '0 8px' }}>
                {items.map((_, i) => (
                  <button key={i} className={`gallery-dot${i === current ? " gallery-dot--active" : ""}`} onClick={() => goTo(i)} aria-label={`Post ${i + 1}`} />
                ))}
              </div>
              <button className="post-arrow" onClick={() => goTo((current + 1) % items.length)} aria-label="Siguiente">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <span className="post-counter">{current + 1} / {items.length}</span>
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

function App() {
  const [lang, setLang] = useState("es");
  const [activeModal, setActiveModal] = useState(null);
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setPosts([]),
    );
    return unsub;
  }, []);

  const t = translations[lang];
  const otherLang = lang === "es" ? "en" : "es";

  return (
    <>
      <button
        className="lang-toggle"
        onClick={() => setActiveModal(null) || setLang(otherLang)}
        aria-label={`Switch to ${otherLang.toUpperCase()}`}
      >
        <span className={lang === "es" ? "lang-active" : ""}>ES</span>
        <span className="lang-divider">|</span>
        <span className={lang === "en" ? "lang-active" : ""}>EN</span>
      </button>

      <div className="portfolio">
        <header className="hero-section">
          <div className="logo-wrapper">
            <img
              src="/images/logo_black.jpg"
              alt="Stephanny Moralez Alvarez"
              className="logo-img"
            />
          </div>

          <div className="profile-pic-wrapper">
            <img
              src="/images/profilePic.jpg"
              alt="Dr. Stephanny Moralez Alvarez"
              className="profile-pic"
            />
          </div>

          <p className="specialty">{t.specialty}</p>

          <div className="social-row">
            <a
              href="https://www.instagram.com/stephanny__morales?igsh=MTR1dTd0Y2N2Njk0Mw=="
              className="social-btn"
              aria-label={t.instagramLabel}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
              <span>@stephanny__morales</span>
            </a>
            <a
              href="https://wa.me/573507105288"
              className="social-btn"
              aria-label={t.whatsappLabel}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              <span>+57 350 710 5288</span>
            </a>
            <a
              href="mailto:Stephannymoralesalvarez@gmail.com"
              className="social-btn"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
              <span>Stephannymoralesalvarez@gmail.com</span>
            </a>
          </div>

          <p className="location">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {t.location}
          </p>

          <p className="bio">{t.bio}</p>
        </header>

        <section className="services-section">
          <button
            className="service-btn"
            onClick={() => setActiveModal(t.dental)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5.5c1.5-1.5 3-2 4.5-2 3.5 0 5 3 5 5.5 0 3-2 5-3 8.5-.5 1.5-1.5 2-2.5 2-1 0-2-.5-2.5-2-.5-1.5-.5-3-1.5-3s-1 1.5-1.5 3c-.5 1.5-1.5 2-2.5 2s-2-.5-2.5-2C5 13.5 3 11.5 3 8.5 3 6 4.5 3 8 3c1.5 0 3 .5 4.5 2z" />
            </svg>
            {t.dentalCardLabel}
          </button>

          <button
            className="service-btn"
            onClick={() => setActiveModal(t.medical)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 2 4 4" />
              <path d="m17 7 1-5" />
              <path d="M3 22 8.5 16.5" />
              <path d="m15 6-8.5 8.5-2.5 5 5-2.5L17.5 9" />
              <path d="m5 16 3 3" />
              <path d="m14 5 5 5" />
            </svg>
            {t.medicalCardLabel}
          </button>
        </section>

        <GalleryCarousel />

        {posts === null && (
          <section className="news-section">
            <h2 className="news-title">{t.newsTitle}</h2>
            <div className="news-empty"><div className="news-spinner" /></div>
          </section>
        )}
        {posts !== null && (
          <PostCarousel
            posts={posts}
            lang={lang}
            title={t.newsTitle}
            emptyText={t.newsEmpty}
          />
        )}

        <a
          href="https://wa.me/573507105288"
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

      <ServiceModal
        service={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}

export default App;
