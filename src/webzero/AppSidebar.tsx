"use client";
import * as React from "react";
import { Plus, Trash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSessionContext } from "@/context/SessionContext";

export function AppSidebar() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    deleteSession,
    renameSession,
  } = useSessionContext();

  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(
    null
  );
  const [newSessionName, setNewSessionName] = React.useState("");

  const handleRename = (sessionId: string) => {
    if (newSessionName.trim()) {
      renameSession(sessionId, newSessionName.trim());
      setEditingSessionId(null);
      setNewSessionName("");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Button onClick={createNewSession} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> New Session
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sessions.map((session) => (
            <SidebarMenuItem key={session.id}>
              {editingSessionId === session.id ? (
                <div className="flex items-center p-2">
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    onBlur={() => handleRename(session.id)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleRename(session.id)
                    }
                    className="mr-2"
                  />
                  <Button size="sm" onClick={() => handleRename(session.id)}>
                    Save
                  </Button>
                </div>
              ) : (
                <SidebarMenuButton
                  onClick={() => switchSession(session.id)}
                  isActive={session.id === currentSessionId}
                >
                  <span className="flex-1 truncate">{session.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(session.id);
                      setNewSessionName(session.name);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
