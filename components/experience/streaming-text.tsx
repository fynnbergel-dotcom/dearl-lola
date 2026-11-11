"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, memo } from "react";

/** Renders text word by word; each new word softly fades/unblurs in. */
export const StreamingText = memo(function StreamingText({
  text,
  streaming,
}: {
  text: string;
  streaming: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduce) return <span className={streaming ? "caret" : undefined}>{words.join(" ")}</span>;

  return (
    <span className={streaming ? "caret" : undefined}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span
            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
});
