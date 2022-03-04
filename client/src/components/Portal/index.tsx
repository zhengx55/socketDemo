import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import usePortal from "../../hooks/usePortal";

type PortalProps = {
  id: string;
  children: ReactNode;
};

function Portal({ id, children }: PortalProps) {
  const target = usePortal(id);
  return createPortal(children, target);
}

export default Portal;
