import React, { useState, useEffect } from "react";

interface DynamicFileProps {
  id: string;
}

const DynamicFileRenderer: React.FC<DynamicFileProps> = ({ id }) => {
  const filepath = `@/components/generated/${id}.tsx`;
  const [DynamicComponent, setDynamicComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    const importComponent = async () => {
      try {
        const myModule = await import(filepath);
        setDynamicComponent(() => myModule.default);
      } catch (error) {
        console.error("Error loading component:", error);
        setDynamicComponent(() => {
          const FallbackComponent = () => <div>Failed to load component</div>;
          FallbackComponent.displayName = "FallbackComponent";
          return FallbackComponent;
        });
      }
    };

    importComponent();
  }, [filepath]);

  if (!DynamicComponent) {
    return <div>Loading...</div>;
  }
  return <DynamicComponent />;
};

export default DynamicFileRenderer;
