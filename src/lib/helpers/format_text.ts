export function formatDrugName(value: string) {
  if (!value) return value;

  let decoded = value;

  // Safely decode URI components
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  // Normalize spacing
  decoded = decoded.replace(/\s+/g, " ").trim();

  // Convert to Title Case
  return decoded
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // Preserve acronyms like XR, ER, HCL if needed
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}