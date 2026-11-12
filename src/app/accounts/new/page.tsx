import { PageHeader } from "@/components/ui";
import { AccountForm } from "../account-form";

export default function NewAccount() {
  return (
    <>
      <PageHeader title="Add an account" intro="Describe who this account talks to and how it sounds. Suki writes a separate playbook and concepts for each account from this." />
      <AccountForm />
    </>
  );
}
