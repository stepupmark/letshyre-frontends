import { ChatbotScreen } from "@/features/common/chatbot/ChatbotScreen";
import { EMPLOYEE_ACCENT } from "@/features/common/chatbot/accents";

export function Chatbot() {
  return (
    <ChatbotScreen
      chat="employee"
      namespace="employee"
      accent={EMPLOYEE_ACCENT}
      className="lg:p-5"
    />
  );
}

export default Chatbot;
