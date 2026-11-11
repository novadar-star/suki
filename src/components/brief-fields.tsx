"use client";

import { useState } from "react";
import clsx from "clsx";
import { OBJECTIVE_TYPES, objectiveTypeInfo, type ObjectiveType } from "@/lib/schemas";
import { inputClass } from "./button";

type Values = {
  name: string;
  objectiveType: ObjectiveType;
  objective: string;
  keyMessage: string;
  targetMarket: string;
  deadline: string;
};

// The campaign brief. Used on New campaign and on the Brief stage.
export function BriefFields({ initial }: { initial: Values }) {
  const [type, setType] = useState<ObjectiveType>(initial.objectiveType);
  return (
    <>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Campaign name</span>
        <input name="name" required maxLength={120} defaultValue={initial.name} className={inputClass} />
      </label>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium">What is this campaign for?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {OBJECTIVE_TYPES.map((t) => {
            const info = objectiveTypeInfo[t];
            const on = type === t;
            return (
              <label
                key={t}
                className={clsx("press cursor-pointer rounded-xl border bg-panel p-4", on ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/30")}
              >
                <input type="radio" name="objectiveType" value={t} checked={on} onChange={() => setType(t)} className="sr-only" />
                <span className="flex items-center justify-between font-semibold">
                  {info.label}
                  <span aria-hidden className={clsx("size-3.5 rounded-full border-2", on ? "border-ink bg-ink" : "border-line")} />
                </span>
                <span className="mt-1 block text-sm text-muted">{info.goal}</span>
                <ul className="mt-2 space-y-0.5 text-xs text-muted">
                  {info.rubric.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted">This changes how the AI writes and which rules the review applies.</p>
      </fieldset>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Brief</span>
        <textarea name="objective" required maxLength={500} rows={3} defaultValue={initial.objective} className={inputClass} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">
          Key message <span className="font-normal text-muted">(optional)</span>
        </span>
        <input name="keyMessage" maxLength={300} defaultValue={initial.keyMessage} className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Target audience</span>
          <input name="targetMarket" required maxLength={300} defaultValue={initial.targetMarket} className={inputClass} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Deadline</span>
          <input name="deadline" type="date" defaultValue={initial.deadline} className={inputClass} />
        </label>
      </div>
    </>
  );
}
