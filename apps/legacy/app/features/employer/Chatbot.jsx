import { ChatbotScreen } from "@/features/common/chatbot/ChatbotScreen";
import { EMPLOYER_ACCENT } from "@/features/common/chatbot/accents";

export function Chatbot() {
  return <ChatbotScreen chat="employer" namespace="employer" accent={EMPLOYER_ACCENT} />;
}

export default Chatbot;
