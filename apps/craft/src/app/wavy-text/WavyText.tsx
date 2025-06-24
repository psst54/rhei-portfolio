"use client";

import React, { ReactElement, ReactNode, useEffect, useRef } from "react";

const TIME = 400;
const HEIGHT = 5; // -{HEIGHT}px ~ {HEIGHT}px
const PHASE_DELAY = 100; // 각 글자 간 지연 시간 (ms)

function WavyItem({ item, index = 0 }: { item: string; index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const phaseOffset = index * PHASE_DELAY;
    let start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const y = Math.sin((elapsed + phaseOffset) / TIME) * HEIGHT;

      if (ref.current) {
        ref.current.style.transform = `translateY(${y}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="inline-block"
      data-test={index}
    >
      {item}
    </span>
  );
}

function constructWavyTree({
  node,
  charIndex = 0,
}: {
  node: ReactNode;
  charIndex?: number;
}): { retNode: ReactNode; textLength: number } {
  if (typeof node === "string" || typeof node === "number") {
    let currentCharIndex = 0;
    return {
      retNode: (
        <span
          key={charIndex}
          aria-label={node.toString()}
          className="inline-block break-keep whitespace-pre-wrap"
        >
          {[...node.toString()].map((char, index) => (
            <WavyItem
              key={index}
              item={char}
              index={charIndex + currentCharIndex++}
            />
          ))}
        </span>
      ),
      textLength: node.toString().length,
    };
  }

  if (React.isValidElement(node)) {
    const element = node as ReactElement<any>;
    const { type, props } = element;
    const { retNode, textLength } = constructWavyTree({
      node: props.children,
      charIndex,
    });

    return {
      retNode: React.createElement(type, { ...props }, retNode),
      textLength: textLength,
    };
  }

  if (Array.isArray(node)) {
    let currentTextLength = 0;

    return {
      retNode: (
        <>
          {node?.map((child) => {
            const { retNode, textLength } = constructWavyTree({
              node: child,
              charIndex: charIndex + currentTextLength,
            });
            currentTextLength += textLength;
            return (
              <React.Fragment key={charIndex + currentTextLength}>
                {retNode}
              </React.Fragment>
            );
          })}
        </>
      ),
      textLength: currentTextLength,
    };
  }

  throw new Error();
}

export default function WavyText({ children }: { children: ReactNode }) {
  const { retNode } = constructWavyTree({ node: children });

  if (!retNode) {
    return null;
  }

  return <>{retNode}</>;
}
