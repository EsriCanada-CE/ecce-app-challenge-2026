"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { updateCurrentUserNameAction } from "@/app/actions/rides";
import type { SessionUser } from "@/lib/ride-persistence";

type NameEditorProps = {
  initialName: string;
  defaultName: string;
  compact?: boolean;
  refreshOnSuccess?: boolean;
  onSaved?: (user: SessionUser) => void;
};

export default function NameEditor({
  initialName,
  defaultName,
  compact = false,
  refreshOnSuccess = false,
  onSaved,
}: NameEditorProps) {
  const router = useRouter();
  const [draftName, setDraftName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraftName(initialName);
  }, [initialName]);

  const canSubmit = !isPending && (
    draftName.trim() !== initialName.trim() ||
    draftName.trim().length === 0
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const user = await updateCurrentUserNameAction(draftName);
        setDraftName(user.name);
        onSaved?.(user);

        if (refreshOnSuccess) {
          router.refresh();
        }

        toast.success("Name updated.", { id: "user-name-save" });
      } catch (error) {
        console.error("Failed to update the rider name.", error);
        toast.error("Could not update the rider name.", { id: "user-name-save" });
      }
    });
  };

  return (
    <div className={`name-editor${compact ? " name-editor--compact" : ""}`}>
      <form className="name-editor__form" onSubmit={handleSubmit}>
        <label className="name-editor__label" htmlFor={compact ? "name-editor-compact" : "name-editor"}>
          Rider name
        </label>
        <div className="name-editor__row">
          <input
            id={compact ? "name-editor-compact" : "name-editor"}
            className="name-editor__input"
            type="text"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={defaultName}
            maxLength={32}
          />
          <button
            className="name-editor__button"
            type="submit"
            disabled={!canSubmit}
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      <p className="name-editor__hint">
        Leave it blank to reset back to {defaultName}.
      </p>
    </div>
  );
}
