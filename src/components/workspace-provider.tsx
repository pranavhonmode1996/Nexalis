"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DemoService } from "@/services/demo-service";
import {
  WorkspaceError,
  type Command,
  type Snapshot,
  type User,
} from "@/domain/types";
const sessionKey = "nexalis.demo.session.v1";
type Session = { userId: string; expiresAt: number };
interface Context {
  data: Snapshot | null;
  user: User | null;
  ready: boolean;
  error: string;
  notice: string;
  pending: boolean;
  mode: string;
  login: (id: string) => Promise<boolean>;
  logout: () => void;
  expire: () => void;
  reload: () => Promise<void>;
  execute: (c: Command) => Promise<boolean>;
  notify: (s: string) => void;
  failNext: () => void;
  reset: () => Promise<void>;
}
const WorkspaceContext = createContext<Context | null>(null);
export function WorkspaceProvider({
  children,
  mode,
}: {
  children: ReactNode;
  mode: string;
}) {
  // Prevent late requests from repopulating a signed-out or switched session.
  const generation = useRef(0);
  const [service] = useState(() => new DemoService());
  const [data, setData] = useState<Snapshot | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const logout = useCallback(() => {
    generation.current++;
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem("nexalis.demo.fail-next");
    setSession(null);
    setData(null);
    setNotice("");
    setError("");
    service.clear();
  }, [service]);
  const expire = useCallback(() => {
    logout();
    setError("Your demo session expired. Sign in again to continue.");
  }, [logout]);
  const reload = useCallback(async () => {
    const started = generation.current;
    try {
      const snapshot = await service.load();
      if (started !== generation.current) return;
      setData(snapshot);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [service]);
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(async () => {
        if (mode !== "demo")
          throw new WorkspaceError(
            "configuration",
            "Live mode is not configured. Connect an authenticated backend adapter before using live mode. Demo data will not be loaded.",
          );
        const raw = sessionStorage.getItem(sessionKey);
        const saved = raw ? (JSON.parse(raw) as Session) : null;
        if (saved && saved.expiresAt > Date.now()) {
          const loaded = await service.load();
          if (active) {
            setData(loaded);
            setSession(saved);
          }
        } else if (saved) {
          sessionStorage.removeItem(sessionKey);
          if (active) setError("Your demo session expired. Sign in again.");
        }
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [mode, service]);
  useEffect(() => {
    if (!session) return;
    const unsubscribe = service.subscribe(setData, (e) => setError(e.message));
    const timer = setInterval(() => {
      if (session.expiresAt <= Date.now()) expire();
    }, 1000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [session, service, expire]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  const user =
    data?.users.find((u) => u.id === session?.userId && u.active) ?? null;
  useEffect(() => {
    if (!session || !data || user) return;
    const started = generation.current;
    Promise.resolve().then(() => {
      if (started !== generation.current) return;
      logout();
      setError(
        "Your account access was revoked. Contact your workspace Administrator.",
      );
    });
  }, [session, data, user, logout]);
  const login = async (id: string) => {
    if (mode !== "demo") return false;
    setPending(true);
    try {
      const fresh = await service.load();
      if (!fresh.users.some((u) => u.id === id && u.active))
        throw new WorkspaceError("session", "This demo account is inactive.");
      const next = { userId: id, expiresAt: Date.now() + 12 * 60 * 60 * 1000 };
      generation.current++;
      setData(null);
      setSession(null);
      service.clear();
      sessionStorage.setItem(sessionKey, JSON.stringify(next));
      setData(fresh);
      setSession(next);
      setError("");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  };
  const execute = async (command: Command) => {
    if (pending) return false;
    if (!user || !session || session.expiresAt <= Date.now()) {
      expire();
      return false;
    }
    setPending(true);
    const started = generation.current;
    try {
      const next = await service.execute(user.id, command);
      if (started !== generation.current) return false;
      setData(next);
      setError("");
      setNotice("Changes saved to this local demo.");
      return true;
    } catch (e) {
      if (started === generation.current) setError((e as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  };
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        user,
        ready,
        error,
        notice,
        pending,
        mode,
        login,
        logout,
        expire,
        reload,
        execute,
        notify: setNotice,
        failNext: () => {
          service.simulateFailure();
          setNotice(
            "The next mutation will fail. Existing data will stay unchanged.",
          );
        },
        reset: async () => {
          try {
            setData(await service.reset());
            setError("");
            setNotice("Demo data reset.");
          } catch (e) {
            setError((e as Error).message);
          }
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw Error("Missing WorkspaceProvider");
  return value;
}
