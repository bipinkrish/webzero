import React, { Suspense, useState, useEffect } from "react";

interface DynamicFileProps {
  id: string;
}

const DynamicFileRenderer: React.FC<DynamicFileProps> = ({ id }) => {
  const [DynamicComponent, setDynamicComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    let failed = false;
    const loadComponent = async (canSetError: boolean) => {
      try {
        const Component = await import(`@/components/generated/${id}`);
        setDynamicComponent(() => Component.default || Component);
      } catch (error) {
        failed = true;
        canSetError &&
          setDynamicComponent(() => () => <div>Error loading component</div>);
      }
    };
    loadComponent(false);

    setTimeout(() => {
      failed && loadComponent(true);
    }, 2000);
  }, [id]);

  if (!DynamicComponent) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicComponent />
    </Suspense>
  );
};

export default DynamicFileRenderer;
