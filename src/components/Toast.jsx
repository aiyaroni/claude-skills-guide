import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store.jsx'

export default function Toast() {
  const { toastMsg } = useApp()

  return (
    <AnimatePresence>
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--lime)', color: '#080c12',
            padding: '8px 20px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {toastMsg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
