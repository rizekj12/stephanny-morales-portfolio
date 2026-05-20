import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CloseIcon from '@mui/icons-material/Close'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import translations from './translations.json'
import './App.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { paper: '#0D0B09' },
  },
})

function ServiceModal({ service, onClose }) {
  return (
    <ThemeProvider theme={darkTheme}>
    <Dialog
      open={!!service}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          px: 1,
          py: 0.5,
          backgroundColor: '#0D0B09',
          backgroundImage: 'none',
          border: '1px solid #C9A55A',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: '1.25rem',
          color: '#C9A55A',
          pr: 6,
          pb: 1,
        }}
      >
        {service?.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: '#C9A55A',
            '&:hover': { backgroundColor: '#2A2318', color: '#E0C880' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#2A2318' }}>
        <Typography
          variant="body2"
          sx={{
            color: '#F0E8D8',
            lineHeight: 1.8,
            mb: 2.5,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        >
          {service?.description}
        </Typography>

        <List disablePadding>
          {service?.items.map((item) => (
            <ListItem
              key={item}
              disableGutters
              sx={{
                py: 0.75,
                px: 1.5,
                mb: 0.75,
                borderRadius: 2,
                backgroundColor: '#1C1915',
                borderLeft: '3px solid #C9A55A',
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: '#C9A55A' }} />
              </ListItemIcon>
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  color: '#F0E8D8',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
    </ThemeProvider>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.81a8.18 8.18 0 0 0 4.78 1.52V6.89a4.85 4.85 0 0 1-1.01-.2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

function App() {
  const [lang, setLang] = useState('es')
  const [activeModal, setActiveModal] = useState(null)

  const t = translations[lang]
  const otherLang = lang === 'es' ? 'en' : 'es'

  return (
    <>
      <button
        className="lang-toggle"
        onClick={() => setActiveModal(null) || setLang(otherLang)}
        aria-label={`Switch to ${otherLang.toUpperCase()}`}
      >
        <span className={lang === 'es' ? 'lang-active' : ''}>ES</span>
        <span className="lang-divider">|</span>
        <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
      </button>

      <div className="portfolio">
        <header className="hero-section">
          <div className="logo-wrapper">
            <img src="/images/logo_black.jpg" alt="Stephanny Moralez Alvarez" className="logo-img" />
          </div>

          <div className="profile-pic-wrapper">
            <img src="/images/profilePic.jpg" alt="Dr. Stephanny Moralez Alvarez" className="profile-pic" />
          </div>

          <p className="specialty">{t.specialty}</p>

          <p className="bio">{t.bio}</p>

          <div className="social-row">
            <a href="#" className="social-btn" aria-label={t.instagramLabel}>
              <InstagramIcon />
            </a>
            <a href="#" className="social-btn" aria-label={t.tiktokLabel}>
              <TikTokIcon />
            </a>
            <a href="#" className="social-btn" aria-label={t.whatsappLabel}>
              <WhatsAppIcon />
            </a>
          </div>
        </header>

        <section className="services-section">
          <button className="service-card" onClick={() => setActiveModal(t.dental)}>
            <img src="/images/pic1.jpg" alt={t.dentalCardLabel} />
            <div className="service-card-label">
              <span>{t.dentalCardLabel}</span>
            </div>
          </button>

          <button className="service-card" onClick={() => setActiveModal(t.medical)}>
            <img src="/images/pic2.jpg" alt={t.medicalCardLabel} />
            <div className="service-card-label">
              <span>{t.medicalCardLabel}</span>
            </div>
          </button>
        </section>
      </div>

      <ServiceModal service={activeModal} onClose={() => setActiveModal(null)} />
    </>
  )
}

export default App
