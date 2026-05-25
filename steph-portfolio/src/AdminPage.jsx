import { useState, useEffect } from 'react'
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { db, auth, storage } from './firebase'

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
import LinearProgress from '@mui/material/LinearProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import LogoutIcon from '@mui/icons-material/Logout'
import AddIcon from '@mui/icons-material/Add'
import UploadIcon from '@mui/icons-material/Upload'
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
  const [posts, setPosts]         = useState([])
  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [imageUrl, setImageUrl]   = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')

  const [editPost, setEditPost]           = useState(null)
  const [editTitle, setEditTitle]         = useState('')
  const [editContent, setEditContent]     = useState('')
  const [editImageUrl, setEditImageUrl]   = useState('')
  const [editMediaType, setEditMediaType] = useState('image')
  const [editSaving, setEditSaving]       = useState(false)
  const [editUploadProgress, setEditUploadProgress] = useState(null)
  const [editUploadedFileName, setEditUploadedFileName] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap =>
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return unsub
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    setMediaType(isVideo ? 'video' : 'image')
    setUploadedFileName(file.name)
    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`)
    const task = uploadBytesResumable(storageRef, file)
    setUploadProgress(0)
    task.on('state_changed',
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setUploadProgress(null); setUploadedFileName('') },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        setImageUrl(url)
        setUploadProgress(null)
      }
    )
  }

  const openEdit = (post) => {
    setEditPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditImageUrl(post.imageUrl || '')
    setEditMediaType(post.mediaType || 'image')
    setEditUploadedFileName('')
    setEditUploadProgress(null)
  }

  const handleFileUploadEdit = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    setEditMediaType(isVideo ? 'video' : 'image')
    setEditUploadedFileName(file.name)
    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`)
    const task = uploadBytesResumable(storageRef, file)
    setEditUploadProgress(0)
    task.on('state_changed',
      (snap) => setEditUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setEditUploadProgress(null); setEditUploadedFileName('') },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        setEditImageUrl(url)
        setEditUploadProgress(null)
      }
    )
  }

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) return
    setEditSaving(true)
    await updateDoc(doc(db, 'posts', editPost.id), {
      title:     editTitle.trim(),
      content:   editContent.trim(),
      imageUrl:  editImageUrl.trim() || null,
      mediaType: editImageUrl.trim() ? editMediaType : null,
    })
    setEditSaving(false)
    setEditPost(null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'posts'), {
      title:     title.trim(),
      content:   content.trim(),
      imageUrl:  imageUrl.trim() || null,
      mediaType: imageUrl.trim() ? mediaType : null,
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setContent('')
    setImageUrl('')
    setMediaType('image')
    setUploadedFileName('')
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'posts', deleteId))
    setDeleteId(null)
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
            <Box sx={{ mb: 2 }}>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="media-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                  disabled={uploadProgress !== null}
                >
                  {uploadProgress !== null ? `Subiendo… ${uploadProgress}%` : 'Subir foto o video'}
                </Button>
              </label>
              {uploadProgress !== null && (
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1, borderRadius: 4 }} />
              )}
              {uploadedFileName && uploadProgress === null && (
                <Typography variant="caption" sx={{ color: '#C9A55A', display: 'block', mb: 1 }}>
                  ✓ {uploadedFileName}
                </Typography>
              )}
              <TextField
                fullWidth label="O pega una URL de imagen/video (opcional)"
                value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                size="small"
              />
            </Box>
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
          {post.imageUrl && post.mediaType === 'video' && (
            <video
              src={post.imageUrl}
              controls
              playsInline
              style={{ width: '100%', maxHeight: 220, display: 'block', objectFit: 'cover' }}
            />
          )}
          {post.imageUrl && post.mediaType !== 'video' && (
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', maxHeight: 220, display: 'block', objectFit: 'cover' }}
            />
          )}
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
              size="small" onClick={() => openEdit(post)}
              sx={{ color: '#C9A55A', '&:hover': { backgroundColor: 'rgba(201,165,90,0.1)' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small" onClick={() => setDeleteId(post.id)}
              sx={{ color: '#c0392b', '&:hover': { backgroundColor: 'rgba(192,57,43,0.1)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1C1915', border: '1px solid rgba(201,165,90,0.3)' } }}
      >
        <DialogTitle sx={{ color: '#C9A55A', fontWeight: 700, pb: 1 }}>
          ¿Eliminar publicación?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete} variant="contained"
            sx={{ fontWeight: 700, backgroundColor: '#c0392b', '&:hover': { backgroundColor: '#a93226' } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editPost} onClose={() => setEditPost(null)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1C1915', border: '1px solid rgba(201,165,90,0.3)' } }}
      >
        <DialogTitle sx={{ color: '#C9A55A', fontWeight: 700 }}>
          Editar publicación
          <IconButton onClick={() => setEditPost(null)} sx={{ position: 'absolute', right: 12, top: 12, color: '#C9A55A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Título" value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }} required
          />
          <TextField
            fullWidth multiline rows={4} label="Contenido"
            value={editContent} onChange={e => setEditContent(e.target.value)}
            sx={{ mb: 2 }} required
          />
          <Box>
            <input
              id="edit-media-upload" type="file" accept="image/*,video/*"
              style={{ display: 'none' }} onChange={handleFileUploadEdit}
            />
            <label htmlFor="edit-media-upload">
              <Button
                component="span" variant="outlined" startIcon={<UploadIcon />}
                sx={{ mb: 1 }} disabled={editUploadProgress !== null}
              >
                {editUploadProgress !== null ? `Subiendo… ${editUploadProgress}%` : 'Cambiar foto o video'}
              </Button>
            </label>
            {editUploadProgress !== null && (
              <LinearProgress variant="determinate" value={editUploadProgress} sx={{ mb: 1, borderRadius: 4 }} />
            )}
            {editUploadedFileName && editUploadProgress === null && (
              <Typography variant="caption" sx={{ color: '#C9A55A', display: 'block', mb: 1 }}>
                ✓ {editUploadedFileName}
              </Typography>
            )}
            <TextField
              fullWidth label="O pega una URL de imagen/video"
              value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)}
              placeholder="https://..." size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setEditPost(null)} variant="outlined" color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate} variant="contained" disabled={editSaving}
            sx={{ fontWeight: 700 }}
          >
            {editSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>
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
