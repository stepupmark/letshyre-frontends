const DEFAULT_INDUSTRIES = [
  "IT / Software Development",
  "IT / Hardware & Networking",
  "AI / Machine Learning",
  "Data Science / Analytics",
  "Cyber Security / InfoSec",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Sales",
  "Marketing",
];

export function getIndustryOptions(industryData) {
  let rawIndustries = [];
  if (Array.isArray(industryData)) {
    rawIndustries = industryData;
  } else if (industryData && Array.isArray(industryData.data)) {
    rawIndustries = industryData.data;
  }

  if (rawIndustries.length > 0) {
    return rawIndustries
      .map((item) => item?.label || item?.value || item)
      .filter(Boolean);
  }

  return DEFAULT_INDUSTRIES;
}
