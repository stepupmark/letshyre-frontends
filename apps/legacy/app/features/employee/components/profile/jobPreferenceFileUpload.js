const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export function handleDocumentFile(e, type, { setValue, setError, clearErrors, t }) {
  const file = e.target.files?.[0];
  if (!file) return;

  clearErrors(type);

  const extension = file.name.split('.').pop().toLowerCase();

  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(extension)) {
    setError(type, { message: t("jobPreferences.documents.errors.invalidFormat") });
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError(type, { message: t("jobPreferences.documents.errors.maxSize") });
    e.target.value = "";
    return;
  }

  setValue(type, file);
  e.target.value = "";
}

export function handleViewDocumentFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  window.open(url, "_blank");
}
