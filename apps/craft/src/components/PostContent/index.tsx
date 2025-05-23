/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

"use client";

import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";

import parse from "@/app/[subBlogId]/[postId]/parse";

function getId(child) {
  return solve(child)
    .replace(/\s+/g, "-")
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣-]/g, "")
    .toLowerCase();
}

function solve(child) {
  if (!child) return "";

  if (typeof child === "string") {
    return child;
  }

  return child
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return solve(item.props?.children);
    })
    .join("");
}

export default function PostContent({ content }) {
  return parse("# Table Of Contents\n" + content).then((res) => (
    <div className="text-responsive-p mx-auto max-w-6xl">
      {renderNodes(res, 0)}
    </div>
  ));
}

function renderNodes(node, index) {
  if (!node) return;

  switch (node.type) {
    case "text": {
      if (!node.value) return;
      return node.value;
    }

    case "root": {
      return node.children.map((child, index: number) =>
        renderNodes(child, index),
      );
    }

    case "raw": {
      return;
    }

    default: {
      switch (node.tagName) {
        case "hr": {
          return (
            <hr
              key={index}
              className="border-sub my-12 border-b border-dashed"
            />
          );
        }

        case "h1": {
          return (
            <h1
              key={index}
              className="text-responsive-h1 mt-6 mb-3 flex flex-col"
            >
              <span id={getId(node.children)} className="" {...node.properties}>
                {node.children.map((child, index: number) =>
                  renderNodes(child, index),
                )}
              </span>
              <span className="flex-1 border-b-2" />
            </h1>
          );
        }

        case "h2": {
          return (
            <h3
              key={index}
              className="text-responsive-h2 mt-5 mb-2"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </h3>
          );
        }

        case "h3": {
          return (
            <h4
              key={index}
              className="text-responsive-h3 mt-4 mb-1"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </h4>
          );
        }

        case "p": {
          return (
            <p key={index} className="text-responsive-p" {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </p>
          );
        }

        case "img": {
          return (
            <img
              key={index}
              className="border-sub mx-auto my-4 w-full rounded-md border sm:w-[80dvw] md:w-[75dvw] lg:w-[60%]"
              alt={node.properties.alt}
              src={node.properties.src}
            />
          );
        }

        case "a": {
          const { href } = node.properties;

          if (href[0] === "#")
            return (
              <Link
                href={href}
                className="text-responsive-p text-blue-600 underline dark:text-orange-400"
              >
                {node.children.map((child, index: number) =>
                  renderNodes(child, index),
                )}
              </Link>
            );

          return (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={href}
              className="text-responsive-p text-blue-600 underline dark:text-orange-400"
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </Link>
          );
        }

        case "blockquote": {
          return (
            <blockquote key={index} {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </blockquote>
          );
        }

        case "li": {
          return (
            <li key={index} className="" {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </li>
          );
        }

        case "ul": {
          return (
            <ul
              key={index}
              className="list-disc py-2 ps-6"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </ul>
          );
        }

        case "ol": {
          return (
            <ol
              key={index}
              className="list-decimal py-2 ps-6"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </ol>
          );
        }

        case "strong": {
          return (
            <span key={index} className="font-bold" {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </span>
          );
        }

        case "code": {
          if (!node.properties?.className)
            return (
              <code
                key={index}
                className="rounded-md border border-blue-200 bg-blue-300/20 px-1 dark:border-orange-800 dark:bg-orange-700/30"
                {...node.properties}
              >
                {node.children.map((child, index: number) =>
                  renderNodes(child, index),
                )}
              </code>
            );

          return (
            <div key={index}>
              <SyntaxHighlighter
                style={nord}
                language={node.properties?.className[0]?.split("language-")[1]}
                PreTag="div"
              >
                {node.children.map((child, index: number) =>
                  renderNodes(child, index),
                )}
              </SyntaxHighlighter>
            </div>
          );
        }

        case "table": {
          return (
            <div
              key={index}
              className="my-2 w-fit rounded-md border-2 break-keep"
            >
              <table
                {...node.properties}
                className="border-collapse border-none"
              >
                {node.children.map((child, index: number) =>
                  renderNodes(child, index),
                )}
              </table>
            </div>
          );
        }

        case "thead": {
          return (
            <thead key={index} {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </thead>
          );
        }

        case "tbody": {
          return (
            <tbody key={index} {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </tbody>
          );
        }

        case "tr": {
          return (
            <tr key={index} {...node.properties}>
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </tr>
          );
        }

        case "td": {
          return (
            <td
              key={index}
              className="border-sub border px-3 py-1"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </td>
          );
        }

        case "th": {
          return (
            <th
              key={index}
              className="border-sub border px-3 py-1"
              {...node.properties}
            >
              {node.children.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </th>
          );
        }

        case "br": {
          return <br />;
        }

        default: {
          const className = node?.properties?.className?.join(" ");
          return (
            <node.tagName key={index} className={className}>
              {node.children?.map((child, index: number) =>
                renderNodes(child, index),
              )}
            </node.tagName>
          );
        }
      }
    }
  }
}
