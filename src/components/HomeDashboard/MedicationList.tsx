import Link from "next/link";
import { CLIENT_PATHS } from "@/config/paths";
import { UserMedication } from "@/types/userMedication";


/*
type PatientMedication = {
  id: number | string;
  name: string;
  // drug_detail_id: number | string;
};
*/
type Props = {
  medications: UserMedication[];
};

export default function MedicationList({ medications }: Props) {
  if (!medications.length) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        No medications added yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {medications.map((m) => (
        <li key={m.id}>
          <Link
            href={CLIENT_PATHS.drugInfoPath(m.id ?? '', m.name)}
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            {m.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
