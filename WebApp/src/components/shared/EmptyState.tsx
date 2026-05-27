import { motion } from "framer-motion"

interface EmptyStateProps {
  icon: string
  title: string
  desc?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-white/30 gap-4"
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <i className={`fa-solid ${icon} text-2xl`} />
      </div>
      <p className="text-base font-medium">{title}</p>
      {desc && <p className="text-sm max-w-xs text-center text-white/20">{desc}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
