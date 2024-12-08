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
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedSessions = localStorage.getItem(SESSION_STORAGE_KEY);
      return storedSessions ? JSON.parse(storedSessions) : [];
    } catch (error) {
      console.error("Failed to parse sessions from localStorage:", error);
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      try {
        const storedId = localStorage.getItem(CURRENT_SESSION_ID_KEY);
        return storedId && sessions.some((s) => s.id === storedId)
          ? storedId
          : sessions[0]?.id || null;
      } catch (error) {
        console.error(
          "Failed to retrieve currentSessionId from localStorage:",
          error
        );
        return sessions[0]?.id || null;
      }
    }
  );

  useEffect(() => {
    if (sessions.length === 0) {
      const newSession = createNewSessionObject();
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save sessions to localStorage:", error);
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      try {
        localStorage.setItem(CURRENT_SESSION_ID_KEY, currentSessionId);
      } catch (error) {
        console.error(
          "Failed to save currentSessionId to localStorage:",
          error
        );
      }
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
