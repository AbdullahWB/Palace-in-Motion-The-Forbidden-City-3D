export type DownloadFileExtension = "txt" | "json";

export function createFilenameSlug(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "download"
  );
}

function getDateStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function createDatedFilename(
  prefix: string,
  extension: DownloadFileExtension,
  date = new Date()
) {
  return `${createFilenameSlug(prefix)}-${getDateStamp(date)}.${extension}`;
}

export function createDatedFilenameFromParts(
  parts: Array<string | null | undefined>,
  extension: DownloadFileExtension,
  date = new Date()
) {
  return createDatedFilename(parts.filter(Boolean).join("-"), extension, date);
}

export function downloadFile(
  filename: string,
  content: string,
  mimeType: string
) {
  const blob = new Blob([content], {
    type: mimeType,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadTextFile(filename: string, content: string) {
  downloadFile(filename, content, "text/plain;charset=utf-8");
}

export function downloadJsonFile(filename: string, value: unknown) {
  downloadFile(
    filename,
    JSON.stringify(value, null, 2),
    "application/json;charset=utf-8"
  );
}
