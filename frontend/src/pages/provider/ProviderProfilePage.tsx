import ProviderLayout from "@/layout/ProviderLayout";
import { ProviderProfileTabbedView } from "@/components/profile/ProviderProfileTabbedView";

export default function ProviderProfilePage() {
  return (
    <ProviderLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <ProviderProfileTabbedView />
      </div>
    </ProviderLayout>
  );
}
