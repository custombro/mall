import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";

import { KeyringProductionRulesCard } from "@/components/workbench/keyring-production-rules-card";
import { KeyringPreviewDock } from "@/components/workbench/keyring-preview-dock";
export default function Page() {
  return <>
      <KeyringProductionRulesCard />
      <KeyringPreviewDock />
      <KeyringWorkbenchClient />
    </>;
}
