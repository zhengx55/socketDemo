import React, { useState, useEffect, useRef } from "react";

const useAudio = (url: string | undefined) => {
  const audio = useRef<HTMLAudioElement>(new Audio(url));

  useEffect(() => {
    audio.current.muted = false;
    audio.current.addEventListener("ended", () => audio.current.pause());
    return () => {
      audio.current.removeEventListener("ended", () => audio.current.pause());
    };
  }, []);

  return [audio.current];
};

export default useAudio;
