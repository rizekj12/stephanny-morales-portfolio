import { useState, useEffect } from 'react'
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { db, auth } from './firebase'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import DeleteIcon from '@mui/icons-material/Delete'
import LogoutIcon from '@mui/icons-material/Logout'
import AddIcon from '@mui/icons-material/Add'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#C9A55A' },
    background: { default: '#0D0B09', paper: '#1C1915' },
    text:       { primary: '#F0E8D8', secondary: '#9A8A78' },
  },
  shape: { borderRadius: 12 },
})

function LoginForm({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
          Panel de Administración
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
          Stephanny Moralez — Acceso exclusivo
        </Typography>

        <TextField
          fullWidth label="Email" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{ mb: 2 }} required
        />
        <TextField
          fullWidth label="Contraseña" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 1 }} required
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}
        <Button
          fullWidth type="submit" variant="contained" disabled={loading}
          sx={{ mt: 2, py: 1.5, fontWeight: 700, letterSpacing: 1 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Iniciar sesión'}
        </Button>
      </Box>
    </Box>
  )
}

function Dashboard({ user }) {
  const [posts, setPosts]       = useState([])
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap =>
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return unsub
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'posts'), {
      title:     title.trim(),
      content:   content.trim(),
      imageUrl:  imageUrl.trim() || null,
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setContent('')
    setImageUrl('')
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta publicación?')) return
    await deleteDoc(doc(db, 'posts', id))
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    return ts.toDate().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Panel de Administración
        </Typography>
        <Button
          startIcon={<LogoutIcon />}
          onClick={() => signOut(auth)}
          size="small" variant="outlined" color="primary"
        >
          Salir
        </Button>
      </Box>

      {/* Create post form */}
      <Card sx={{ mb: 4, border: '1px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            Nueva publicación
          </Typography>
          <Box component="form" onSubmit={handleCreate}>
            <TextField
              fullWidth label="Título" value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: 2 }} required
            />
            <TextField
              fullWidth multiline rows={4} label="Contenido"
              value={content} onChange={e => setContent(e.target.value)}
              sx={{ mb: 2 }} required
            />
            <TextField
              fullWidth label="URL de imagen (opcional)"
              value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              sx={{ mb: 2 }} placeholder="https://..."
            />
            {success && (
              <Typography variant="body2" sx={{ color: '#C9A55A', mb: 1 }}>
                ✓ Publicación creada exitosamente
              </Typography>
            )}
            <Button
              type="submit" variant="contained" startIcon={<AddIcon />}
              disabled={saving} sx={{ fontWeight: 700 }}
            >
              {saving ? 'Guardando...' : 'Publicar'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Posts list */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
        Publicaciones ({posts.length})
      </Typography>

      {posts.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
          Aún no hay publicaciones.
        </Typography>
      )}

      {posts.map(post => (
        <Card key={post.id} sx={{ mb: 2, border: '1px solid rgba(201,165,90,0.2)' }}>
          <CardContent sx={{ pb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
              {formatDate(post.createdAt)}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
              {post.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {post.content.length > 150 ? post.content.slice(0, 150) + '…' : post.content}
            </Typography>
          </CardContent>
          <Divider sx={{ borderColor: 'rgba(201,165,90,0.15)' }} />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              size="small" onClick={() => handleDelete(post.id)}
              sx={{ color: '#c0392b', '&:hover': { backgroundColor: 'rgba(192,57,43,0.1)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  )
}

export default function AdminPage() {
  const [user, setUser]       = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  if (user === undefined) {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#C9A55A' }} />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {user ? <Dashboard user={user} /> : <LoginForm />}
    </ThemeProvider>
  )
}
