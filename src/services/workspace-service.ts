import type { Command, Snapshot } from "@/domain/types";
/** Live implementations must call authenticated backend operations, never protected Firestore writes. */
export interface WorkspaceService {
  readonly mode: "demo" | "live";
  load(): Promise<Snapshot>;
  execute(actorId: string, command: Command): Promise<Snapshot>;
  subscribe(
    onChange: (snapshot: Snapshot) => void,
    onError: (error: Error) => void,
  ): () => void;
  clear(): void;
}
