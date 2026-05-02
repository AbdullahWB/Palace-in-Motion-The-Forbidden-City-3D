export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
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

export function downloadJsonFile(filename: string, value: unknown) {
  downloadTextFile(filename, JSON.stringify(value, null, 2));
}

export function createDatedFilename(prefix: string, extension: "txt" | "json") {
  const date = new Date().toISOString().slice(0, 10);

  return `${prefix}-${date}.${extension}`;
}
