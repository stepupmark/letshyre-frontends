import { MotionConfig } from "framer-motion";
import { Hero } from "@/features/home/components/Hero";
import { Assistance } from "@/features/home/components/Assistance";
import { Candidate } from "@/features/home/components/Candidate";
import { VideoSection } from "@/features/home/components/VideoSection";
import { ScoreCard } from "@/features/home/components/ScoreCard";
import { QuestionArea } from "@/features/home/components/QuestionArea";
import { HireCard } from "@/features/home/components/HireCard";
import { ChatWidget } from "@/features/common/chatbot/ChatWidget";

export function Home() {
  return (
    // "user" follows the OS reduce-motion setting: movement is skipped, fades stay.
    <MotionConfig reducedMotion="user">
      <Hero />
      <Assistance />
      <Candidate />
      <VideoSection />
      <ScoreCard />
      <QuestionArea />
      <HireCard />
      <ChatWidget />
    </MotionConfig>
  );
}
