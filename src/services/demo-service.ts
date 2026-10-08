import { applyCommand } from "@/domain/commands";
import { seed } from "@/domain/seed";
import { WorkspaceError, type Command, type Snapshot } from "@/domain/types";
import type { WorkspaceService } from "./workspace-service";
const key = "nexalis.demo.workspace.v1";
export class DemoService implements WorkspaceService {
  readonly mode = "demo" as const;
  private listeners = new Set<(s: Snapshot) => void>();

  simulateFailure() {
    sessionStorage.setItem("nexalis.demo.fail-next", "1");
  }
  async load(): Promise<Snapshot> {
    return this.read();
  }
  private read(): Snapshot {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const s = seed();
        localStorage.setItem(key, JSON.stringify(s));
        return s;
      }
      const parsed = JSON.parse(raw) as Snapshot;
      if (
        parsed.schema !== 1 ||
        !Array.isArray(parsed.users) ||
        !Array.isArray(parsed.tasks)
      )
        throw Error("Invalid demo data");
      return parsed;
    } catch {
      throw new WorkspaceError(
        "network",
        "Local demo storage is unavailable or damaged. Enable browser storage or reset demo data.",
      );
    }
  }
  async execute(actorId: string, command: Command): Promise<Snapshot> {
    const run = async () => {
      await new Promise((r) => setTimeout(r, 120));
      if (sessionStorage.getItem("nexalis.demo.fail-next")) {
        sessionStorage.removeItem("nexalis.demo.fail-next");
        throw new WorkspaceError(
          "network",
          "Simulated request failure. No changes were saved. Retry your action.",
        );
      }
      const next = applyCommand(this.read(), actorId, command);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        throw new WorkspaceError(
          "network",
          "Could not save demo data. Check browser storage and retry.",
        );
      }
      this.listeners.forEach((l) => l(next));
      return next;
    };
    if (navigator.locks) return navigator.locks.request(key, run);
    throw new WorkspaceError(
      "configuration",
      "This browser lacks Web Locks required for safe demo editing. Use a current browser on localhost or HTTPS.",
    );
  }
  subscribe(
    onChange: (s: Snapshot) => void,
    onError: (e: Error) => void,
  ): () => void {
    this.listeners.add(onChange);
    const handle = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          onChange(this.read());
        } catch (e) {
          onError(e as Error);
        }
      }
    };
    window.addEventListener("storage", handle);
    return () => {
      this.listeners.delete(onChange);
      window.removeEventListener("storage", handle);
    };
  }
  clear() {
    this.listeners.clear();
  }
  async reset() {
    localStorage.removeItem(key);
    const s = this.read();
    this.listeners.forEach((l) => l(s));
    return s;
  }
}
