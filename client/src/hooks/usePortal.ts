import { useEffect, useRef } from "react";

const createRootElement = (id: string): HTMLDivElement => {
  const rootContainer: HTMLDivElement = document.createElement("div");
  rootContainer.setAttribute("id", id);
  return rootContainer;
};

const addRootElement = (element: HTMLDivElement): void => {
  document.body.insertBefore(
    element,
    document.body.lastElementChild &&
      document.body.lastElementChild.nextElementSibling
  );
};

/**
 * Hook to create a React Portal.
 * Automatically handles creating and tearing-down the root elements (no SRR
 * makes this trivial), so there is no need to ensure the parent target already
 * exists.

 * @param {String} id The id of the target container, e.g 'modal' or 'spotlight'
 * @returns {HTMLElement} The DOM node to use as the Portal target.
 */
export default function usePortal(id: string): HTMLElement {
  const rootEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existingParent: HTMLDivElement | null = document.querySelector(
      `#${id}`
    );
    const parentElem: HTMLDivElement = existingParent || createRootElement(id);

    if (!existingParent) {
      addRootElement(parentElem);
    }

    rootEl.current && parentElem.appendChild(rootEl.current);

    return () => {
      rootEl.current && rootEl.current.remove();
      if (!parentElem.childElementCount) {
        parentElem.remove();
      }
    };
  }, [id]);

  const getRootElem = (): HTMLDivElement => {
    if (!rootEl.current) {
      rootEl.current = document.createElement("div");
    }
    return rootEl.current;
  };

  return getRootElem();
}
