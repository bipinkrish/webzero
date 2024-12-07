import { useState, useEffect } from "react";

export interface Session {
  id: string;
  name: string;
  messages: Message[];
}

export interface Message {
  id: string;
  from: "user" | "ai";
  content: string;
}

const SESSION_STORAGE_KEY = "webzero_sessions";
const CURRENT_SESSION_ID_KEY = "webzero_current_session_id";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessions = localStorage.getItem(SESSION_STORAGE_KEY);
    const storedCurrentSessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);

    let parsedSessions: Session[] = [];
    if (storedSessions) {
      parsedSessions = JSON.parse(storedSessions);
      setSessions(parsedSessions);
    }

    if (parsedSessions.length === 0) {
      const newSession = createNewSessionObject();
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    } else if (
      storedCurrentSessionId &&
      parsedSessions.some((s) => s.id === storedCurrentSessionId)
    ) {
      setCurrentSessionId(storedCurrentSessionId);
    } else {
      setCurrentSessionId(parsedSessions[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_ID_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  const createNewSessionObject = (): Session => ({
    id: Date.now().toString(),
    name: `Session ${sessions.length + 1}`,
    messages: [],
  });

  const createNewSession = () => {
    const newSession = createNewSessionObject();
    setSessions((prevSessions) => [...prevSessions, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, messages } : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prevSessions) => {
      const updatedSessions = prevSessions.filter(
        (session) => session.id !== sessionId
      );
      if (updatedSessions.length === 0) {
        const newSession = createNewSessionObject();
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(updatedSessions[0].id);
      }
      return updatedSessions;
    });
  };

  const renameSession = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  };

  return {
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    updateSessionMessages,
    deleteSession,
    renameSession,
  };
}
