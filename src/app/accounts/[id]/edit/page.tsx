import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getAccounts } from "@/lib/repo";
import { AccountForm } from "../../account-form";

export const dynamic = "force-dynamic";

export default async function EditAccount({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = (await getAccounts()).find((a) => a.id === id);
  if (!account) notFound();
  return (
    <>
      <PageHeader title={`Edit ${account.name}`} intro="Changes apply to playbooks and concepts made from now on. Work already drafted stays as it is." />
      <AccountForm account={account} />
    </>
  );
}
