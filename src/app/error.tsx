"use client";
import { State } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <State
      code="500"
      title="The workspace could not load"
      body="Please retry. Your saved demo changes will remain available."
      action={
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      }
    />
  );
}
