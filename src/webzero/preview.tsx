import React, { Suspense, useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DynamicFileProps {
  id: string;
}

const DynamicFileRenderer: React.FC<DynamicFileProps> = ({ id }) => {
  const [DynamicComponent, setDynamicComponent] =
    useState<React.ComponentType | null>(null);
  const [error, setError] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");

  useEffect(() => {
    let failed = false;

    const loadComponent = async (canSetError: boolean) => {
      try {
        const Component = await import(`@/components/generated/${id}`);
        setDynamicComponent(() => Component.default || Component);
        setError(false);
      } catch (error) {
        failed = true;
        if (canSetError) {
          setDynamicComponent(() => null);
          setError(true);
        }
      }
    };

    loadComponent(false);

    setTimeout(() => {
      failed && loadComponent(true);
    }, 2000);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => (prev.endsWith("...") ? "Loading" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
        <div className="max-w-md rounded-lg border p-4 bg-card text-card-foreground border-border">
          <Alert variant="destructive">
            <AlertTitle className="text-destructive-foreground">
              Error Loading Component
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              We encountered an issue while loading the component. Please try
              the following steps:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Switch between the "Preview" and "Code" tabs.</li>
                <li>If the issue persists, refresh the page.</li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              style={{
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!DynamicComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        {loadingText}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
          {loadingText}
        </div>
      }
    >
      <DynamicComponent />
    </Suspense>
  );
};

export default DynamicFileRenderer;
