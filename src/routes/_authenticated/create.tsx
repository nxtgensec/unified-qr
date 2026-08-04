import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QrStudio, type StudioValue } from "@/components/qr/QrStudio";
import { saveCode } from "@/lib/codes.functions";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Create a QR code — Unified QR" },
      {
        name: "description",
        content: "Build any kind of QR code with full styling, logos and dynamic links.",
      },
      { property: "og:title", content: "Create a QR code — Unified QR" },
      {
        property: "og:description",
        content: "Build any kind of QR code with full styling, logos and dynamic links.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const save = useServerFn(saveCode);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (value: StudioValue) => save({ data: value }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["codes"] });
      toast.success("Saved to your library");
      void navigate({ to: "/codes" });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save this code"),
  });

  return (
    <DashboardShell
      title="Create"
      description="Every content type, full design control, no watermark."
    >
      <QrStudio
        mode="full"
        saving={mutation.isPending}
        onSave={(value) => mutation.mutate(value)}
      />
    </DashboardShell>
  );
}
