// Shared by VideoSection and Candidate, which render the same heading block.
export const VS_HEADING_OUTER = "bg-bg-page";

export const VS_HEADING = [
  "flex flex-col items-center justify-center bg-bg-page text-center",
  "animate-appear-heading [animation-range:entry_0%_cover_40%] [animation-timeline:view()]",
  "[&>h2]:text-fluid-2xl [&>h2]:font-medium",
].join(" ");

export const VS_HEADING_INNER =
  "mt-2.5 w-[45%] max-lg:mt-[2%] max-lg:w-[85%] [&>p]:mb-0 [&>p]:font-medium [&>p]:text-text-faint max-md:[&>p]:text-[0.8rem]";
