import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import teamDefault from "@/assets/team-img01.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function TeamCard({ member, index, onEdit, onDelete, onToggleStatus }) {
  const { t } = useTranslation("employer");
  const menuItemClass =
    "justify-center text-sm font-medium text-neutral-500 px-3 py-2 focus:bg-neutral-100 focus:text-text-body";

  return (
    <motion.div
      className="relative flex h-90 min-w-62.5 shrink-0 snap-center flex-col items-center justify-end rounded-lg border-2 border-bg-card bg-linear-to-b from-white/95 from-30% to-brand-400 p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 max-md:h-95 max-md:min-w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 || 0, ease: "easeOut" }}
    >
      <div className="absolute top-4 end-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-8 items-center justify-center rounded-full text-xl font-bold text-brand-400 transition-colors outline-none hover:bg-white/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label={t("team.optionsAria")}
          >
            ⋮
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-30">
            <DropdownMenuItem
              className={menuItemClass}
              onSelect={() => onEdit(member)}
            >
              {t("team.card.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onSelect={() => onDelete(member)}
            >
              {t("team.card.remove")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={menuItemClass}
              onSelect={() => onToggleStatus(member)}
            >
              {member.status === "Active" ? t("team.card.hold") : t("team.card.activate")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <img
        src={teamDefault}
        alt={member.full_name}
        className="pointer-events-none absolute bottom-20 z-5 h-55 w-45 object-contain max-md:bottom-22.5 max-md:h-62.5 max-md:w-50"
      loading="lazy" decoding="async" />
      <h3 className="z-10 mt-0 mb-1 text-center text-xl font-bold text-text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.1)]">{member.full_name}</h3>
      <p className="z-10 m-0 text-center text-sm font-medium text-text-white opacity-95">{member.title}</p>
    </motion.div>
  );
}
