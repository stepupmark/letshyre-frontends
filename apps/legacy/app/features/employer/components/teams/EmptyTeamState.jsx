import React from "react";
import { useTranslation } from "react-i18next";


export function EmptyTeamState() {
  const { t } = useTranslation("employer");
  return (
    <div className="mt-37.5 flex flex-col items-center justify-center rounded-lg bg-card px-6 py-16 text-center">
      <h3>{t("team.empty.title")}</h3>
      <p>{t("team.empty.body")}</p>
    </div>
  );
}
