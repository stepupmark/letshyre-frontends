import { motion } from "framer-motion";
import { Building2, Landmark, Hospital, Store } from "lucide-react";
import { BIcon } from "@/components/icons/BootstrapIcons";

// Not currently rendered — About.jsx doesn't include this section.
export function AboutTrust() {
  // building-check has no lucide equivalent, so it stays a BIcon (bi); the rest are lucide.
  const logos = [
    { id: 1, bi: "building-check", name: "Global HR" },
    { id: 2, Icon: Building2, name: "TechCorp" },
    { id: 3, Icon: Landmark, name: "FinancePro" },
    { id: 4, Icon: Hospital, name: "HealthStaff" },
    { id: 5, Icon: Store, name: "RetailConnect" },
  ];

  return (
    <motion.section
      className="flex flex-col items-center gap-6 border-y border-neutral-100 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
    >
      <p className="text-[0.85rem] font-bold tracking-[0.1em] text-neutral-400 uppercase">
        TRUSTED BY INNOVATIVE HR TEAMS GLOBALLY
      </p>
      <div className="flex flex-wrap justify-center gap-[60px] opacity-60 grayscale transition-opacity duration-300 hover:opacity-80">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex items-center gap-3 text-xl font-semibold text-neutral-500"
          >
            {logo.bi ? (
              <BIcon name={logo.bi} className="size-6" />
            ) : (
              <logo.Icon className="size-6" />
            )}
            <span>{logo.name}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
