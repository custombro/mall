import KeyringWorkbenchClient from "./_components/KeyringWorkbenchClient";

import { KeyringProductionRulesCard } from "@/components/workbench/keyring-production-rules-card";
export default function Page() {
  return <>
      <KeyringProductionRulesCard />
      <KeyringWorkbenchClient />
    </>;
}