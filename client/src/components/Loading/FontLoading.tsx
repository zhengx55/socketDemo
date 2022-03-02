import React, { CSSProperties } from "react";
import "./loading.css";

type LoadingProp = {
  loadingText: string;
};

interface TextLoadingCss extends CSSProperties {
  "--i": number;
}

function FontLoading({ loadingText }: LoadingProp) {
  return (
    <section className="text_loading">
      {Array.from(loadingText).map((item, index: number) => {
        return (
          <span key={index} style={{ "--i": index + 1 } as TextLoadingCss}>
            {item}
          </span>
        );
      })}
    </section>
  );
}

export default React.memo(FontLoading);
