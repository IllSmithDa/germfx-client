export default function getTrackingPurposeLabel(value?: string | null) {
  switch (value) {
    case "active_use":
      return "Currently taking";
    case "inactive_history":
      return "Previously took";
    case "education":
      return "Learning / research";
    case "considering":
      return "Considering";
    case "other":
      return "Other";
    default:
      return null;
  }
}