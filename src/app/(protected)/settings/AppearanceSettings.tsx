
import type { ThemeValue } from "@/lib/client/userSettingsApi";
import { SectionCard, SettingRow } from "./SettingsUI";
import SortSelect, { SortSelectOption } from "@/components/SortSelector/SortSelect";

const THEME_OPTIONS: readonly SortSelectOption<ThemeValue>[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function AppearanceSettings({
  theme,
  savingKey,
  onThemeChange,
}: {
  theme: ThemeValue;
  savingKey: string | null;
  onThemeChange: (value: ThemeValue) => void;
}) {
  return (
    <SectionCard title="Appearance" description="Control how the app looks.">
      <SettingRow
        label="Theme"
        description="Choose the appearance mode for the application."
        control={
          <SortSelect<ThemeValue>
            value={theme}
            options={THEME_OPTIONS}
            ariaLabel="Select application theme"
            label="Theme"
            name="theme"
            icon="none"
            variant="field"
            disabled={savingKey === "theme"}
            className="w-full sm:w-56"
            onValueChange={onThemeChange}
          />
        }
      />
    </SectionCard>
  );
}