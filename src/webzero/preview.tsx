import React, { useState, useEffect } from "react";

interface DynamicFileProps {
  id: string;
}

const DynamicFileRenderer: React.FC<DynamicFileProps> = ({ id }) => {
  const filepath = `../../generated/${id}.tsx`;
  const [DynamicComponent, setDynamicComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    const importComponent = async () => {
      try {
        const module = await import(filepath);
        setDynamicComponent(() => module.default);
      } catch (error) {
        console.error("Error loading component:", error);
        setDynamicComponent(() => () => <div>Failed to load component</div>);
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
