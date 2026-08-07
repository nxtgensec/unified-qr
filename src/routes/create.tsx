import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FolderOpen, Info, QrCode } from "lucide-react";
import { toast } from "sonner";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { QrStudio, type StudioValue } from "@/components/qr/QrStudio";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useSignedIn } from "@/hooks/use-signed-in";
import { saveCode } from "@/lib/codes.functions";
import { KINDS } from "@/lib/qr/types";

export const Route = createFileRoute("/create")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create a QR code — Unified QR" },
      {
        name: "description",
        content:
          "Create and download QR codes free, without an account. All 32 types, full design control, no watermark and no expiry.",
      },
      { property: "og:title", content: "Create a QR code — Unified QR" },
      {
        property: "og:description",
        content: "Create and download QR codes free, without an account. No watermark, no expiry.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const signedIn = useSignedIn();
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
    <PublicLayout
      kicker="QR generator · Free, no account needed"
      title="Create a QR code"
      description="Paste a link or some text and download instantly. Sign in free to save to your library, customize the design and unlock all types."
    >
      {signedIn ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Chip>
            <QrCode className="size-icon-xs" /> Full studio
          </Chip>
          <p className="text-small text-muted-foreground">
            Saving to your library.{" "}
            <Link
              to="/codes"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Open my dashboard
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Chip>
            <Info className="size-icon-xs" /> No account needed
          </Chip>
          <p className="text-small text-muted-foreground">
            Website and text codes download free, right now. Sign in with Google to save codes,
            customize designs and unlock all {KINDS.length} types — no credit card, no trial timer.
          </p>
        </div>
      )}

      <div className="mt-8">
        <QrStudio
          mode={signedIn ? "full" : "free"}
          saving={signedIn ? mutation.isPending : undefined}
          onSave={signedIn ? (value) => mutation.mutate(value) : undefined}
          onLocked={() => void navigate({ to: "/auth" })}
        />
      </div>

      {signedIn && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/codes">
              <FolderOpen className="size-icon-sm" /> Back to my codes
            </Link>
          </Button>
        </div>
      )}
    </PublicLayout>
  );
}
