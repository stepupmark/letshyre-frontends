import { ContactInfo } from "@/features/contact/components/ContactInfo";
import { ContactForm } from "@/features/contact/components/ContactForm";

// The five top-padding steps are intentional: the header overlaps differently at each width.
export function Contact() {
  return (
    <div className="flex grow items-start justify-center bg-bg-card px-[5%] pt-[100px] pb-[60px] lg:pt-[160px] xl:pt-[100px] 2xl:pt-[120px] 3xl:pt-[180px]">
      <div className="grid w-full max-w-content grid-cols-[1fr_1.3fr] gap-20 max-lg:grid-cols-1 max-lg:gap-8">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}
