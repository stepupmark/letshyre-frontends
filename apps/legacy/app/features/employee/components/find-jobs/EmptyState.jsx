import { motion } from "framer-motion";
import { SearchX } from "lucide-react";


/**
 * EmptyState
 * Reusable empty/no-results placeholder.
 *
 * @param {{ icon?: React.ReactNode, title: string, subtitle?: string }} props
 */
export default function EmptyState({
  icon = <SearchX size={48} strokeWidth={1.5} />,
  title = "No results found",
  subtitle = "",
}) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-border bg-card px-6 py-15 text-center max-md:px-4 max-md:py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="mb-4 text-5xl opacity-40 max-md:text-4xl">{icon}</span>
      <h4 className="m-0 mb-2 text-lg font-bold text-neutral-700">{title}</h4>
      {subtitle && <p className="m-0 max-w-85 text-sm leading-relaxed text-neutral-400">{subtitle}</p>}
    </motion.div>
  );
}
