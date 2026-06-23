import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#f97316,transparent)' }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold" style={{ fontSize: '8rem', lineHeight: 1 }}>
          <span className="text-gradient">404</span>
        </h1>
        <h2 className="font-display font-bold text-2xl mt-2 mb-3">Page Not Found</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Looks like this page wandered off into the void.
        </p>
        <Link to="/" className="btn-primary flex items-center gap-2 mx-auto w-fit">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}