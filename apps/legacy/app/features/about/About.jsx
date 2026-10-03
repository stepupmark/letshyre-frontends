import { AboutHero } from "@/features/about/components/AboutHero";
import { AboutMissionVision } from "@/features/about/components/AboutMissionVision";
import { AboutIntro } from "@/features/about/components/AboutIntro";
import { AboutWhatWeDo } from "@/features/about/components/AboutWhatWeDo";
import { AboutWhy } from "@/features/about/components/AboutWhy";
import { AboutProfileDuration } from "@/features/about/components/AboutProfileDuration";
import { AboutCommitment } from "@/features/about/components/AboutCommitment";

export function About() {
  return (
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-bg-card px-4 md:px-[5%] py-[clamp(60px,8vw,120px)] text-neutral-900">
      <div className="flex w-full max-w-wide flex-col gap-[clamp(30px,8vw,100px)]">
        <AboutHero />
        <AboutMissionVision />
        <AboutIntro />
        <AboutWhatWeDo />
        <AboutWhy />
        <AboutProfileDuration />
        <AboutCommitment />
      </div>
    </div>
  );
}
