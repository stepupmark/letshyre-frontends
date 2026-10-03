// "Business plan" / "Top-up", and "100 credits", kept apart so the count can
// render quieter than the name.
export const purchaseLabel = (t, invoice) => ({
  name: invoice.planName ? t("invoice.plan", { name: invoice.planName }) : t("invoice.topUp"),
  credits: t("invoice.credits", { count: invoice.credits }),
});
