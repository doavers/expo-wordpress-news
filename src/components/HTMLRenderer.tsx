import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

interface HTMLRendererProps {
  htmlContent: string;
  style?: any;
}

interface ParsedElement {
  type: "heading" | "paragraph" | "list" | "list-item" | "text";
  content: string;
  level?: number; // For headings (1-6)
  items?: ParsedElement[]; // For lists
  inlineElements?: InlineElement[]; // For inline formatting
}

interface InlineElement {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "link"
    | "text"
    | "code"
    | "lineBreak";
  content: string;
  href?: string; // For links
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  htmlContent,
  style,
}) => {
  // Parse inline formatting elements
  const parseInlineElements = (text: string): InlineElement[] => {
    const elements: InlineElement[] = [];

    // First, handle <br> tags (self-closing)
    const brRegex = /<br\s*\/?>/gi;
    const parts = text.split(brRegex);

    // Process each part for other inline tags
    parts.forEach((part, index) => {
      if (part.trim()) {
        // Create a regex to match inline tags (excluding br which we already handled)
        const inlineTagRegex = /<(strong|b|em|i|u|a|code)([^>]*)>(.*?)<\/\1>/gi;
        let lastIndex = 0;
        let match;

        while ((match = inlineTagRegex.exec(part)) !== null) {
          // Add text before the tag if any
          if (match.index > lastIndex) {
            const beforeText = part.substring(lastIndex, match.index);
            if (beforeText.trim()) {
              elements.push({
                type: "text",
                content: beforeText,
              });
            }
          }

          const tagName = match[1].toLowerCase();
          const attributes = match[2];
          const content = match[3];

          // Handle different inline tags
          if (["strong", "b"].includes(tagName)) {
            elements.push({
              type: "bold",
              content: content,
            });
          } else if (["em", "i"].includes(tagName)) {
            elements.push({
              type: "italic",
              content: content,
            });
          } else if (tagName === "u") {
            elements.push({
              type: "underline",
              content: content,
            });
          } else if (tagName === "a") {
            // Extract href attribute
            const hrefMatch = attributes.match(/href=["']([^"']+)["']/i);
            elements.push({
              type: "link",
              content: content,
              href: hrefMatch ? hrefMatch[1] : undefined,
            });
          } else if (tagName === "code") {
            elements.push({
              type: "code",
              content: content,
            });
          }

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text after the last tag
        if (lastIndex < part.length) {
          const remainingText = part.substring(lastIndex);
          if (remainingText.trim()) {
            elements.push({
              type: "text",
              content: remainingText,
            });
          }
        }
      }

      // Add line break after each part except the last one
      if (index < parts.length - 1) {
        elements.push({
          type: "lineBreak",
          content: "",
        });
      }
    });

    return elements.length > 0 ? elements : [{ type: "text", content: text }];
  };

  // Parse HTML content into structured elements
  const parseHTML = (html: string): ParsedElement[] => {
    const elements: ParsedElement[] = [];

    // Clean up the HTML first
    const cleanHTML = html
      .replace(/&nbsp;/g, " ")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      // Handle common numeric entities
      .replace(/&#8216;/g, "'") // Left single quotation mark
      .replace(/&#8217;/g, "'") // Right single quotation mark
      .replace(/&#8220;/g, '"') // Left double quotation mark
      .replace(/&#8221;/g, '"') // Right double quotation mark
      .replace(/&#8211;/g, "–") // En dash
      .replace(/&#8212;/g, "—") // Em dash
      .replace(/&#8230;/g, "…") // Horizontal ellipsis
      // Handle other common numeric entities
      .replace(/&#(\d+);/g, (match, dec) => {
        try {
          return String.fromCharCode(parseInt(dec, 10));
        } catch (e) {
          return match;
        }
      })
      // Handle hex entities
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch (e) {
          return match;
        }
      });

    // Split by major block elements
    const blocks = cleanHTML.split(/<\/?(?:h[1-6]|p|ul|ol|li|div)[^>]*>/i);

    // Extract tags and content
    const tagMatches =
      cleanHTML.match(/<\/?(h[1-6]|p|ul|ol|li|div)[^>]*>/gi) || [];

    let currentElement: ParsedElement | null = null;
    let currentList: ParsedElement | null = null;

    // Process the content
    let contentIndex = 0;
    for (const tag of tagMatches) {
      const tagName = tag.replace(/<\/?([a-z0-9]+).*/i, "$1").toLowerCase();
      const isClosingTag = tag.startsWith("</");

      if (!isClosingTag) {
        // Opening tag
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
          const content = blocks[contentIndex + 1]?.trim() || "";
          currentElement = {
            type: "heading",
            content: content,
            level: parseInt(tagName.charAt(1)),
            inlineElements: parseInlineElements(content),
          };
          elements.push(currentElement);
        } else if (tagName === "p") {
          const content = blocks[contentIndex + 1]?.trim() || "";
          currentElement = {
            type: "paragraph",
            content: content,
            inlineElements: parseInlineElements(content),
          };
          elements.push(currentElement);
        } else if (["ul", "ol"].includes(tagName)) {
          currentList = {
            type: "list",
            content: "",
            items: [],
          };
          elements.push(currentList);
        } else if (tagName === "li" && currentList) {
          const content = blocks[contentIndex + 1]?.trim() || "";
          const listItem: ParsedElement = {
            type: "list-item",
            content: content,
            inlineElements: parseInlineElements(content),
          };
          currentList.items = currentList.items || [];
          currentList.items.push(listItem);
        }
      } else {
        // Closing tag
        if (["ul", "ol"].includes(tagName)) {
          currentList = null;
        }
      }

      contentIndex++;
    }

    // Add any remaining text content
    if (blocks.length > 0 && elements.length === 0) {
      const textContent = cleanHTML.trim();
      if (textContent) {
        elements.push({
          type: "paragraph",
          content: textContent,
          inlineElements: parseInlineElements(textContent),
        });
      }
    }

    return elements;
  };

  const renderInlineElement = (inline: InlineElement, key: number) => {
    switch (inline.type) {
      case "bold":
        return (
          <ThemedText key={key} style={styles.bold}>
            {inline.content}
          </ThemedText>
        );
      case "italic":
        return (
          <ThemedText key={key} style={styles.italic}>
            {inline.content}
          </ThemedText>
        );
      case "underline":
        return (
          <ThemedText key={key} style={styles.underline}>
            {inline.content}
          </ThemedText>
        );
      case "link":
        return (
          <ThemedText key={key} style={styles.link}>
            {inline.content}
          </ThemedText>
        );
      case "code":
        return (
          <ThemedText key={key} style={styles.code}>
            {inline.content}
          </ThemedText>
        );
      case "lineBreak":
        return (
          <ThemedText key={key} style={styles.lineBreak}>
            {"\n"}
          </ThemedText>
        );
      case "text":
      default:
        return <ThemedText key={key}>{inline.content}</ThemedText>;
    }
  };

  const renderElement = (element: ParsedElement, index: number) => {
    switch (element.type) {
      case "heading":
        return (
          <ThemedText
            key={index}
            style={[
              styles.heading,
              element.level === 1 && styles.h1,
              element.level === 2 && styles.h2,
              element.level === 3 && styles.h3,
              element.level === 4 && styles.h4,
              element.level === 5 && styles.h5,
              element.level === 6 && styles.h6,
            ]}
          >
            {element.inlineElements
              ? element.inlineElements.map((inline, inlineIndex) =>
                  renderInlineElement(inline, inlineIndex)
                )
              : element.content}
          </ThemedText>
        );

      case "paragraph":
        return (
          <ThemedText key={index} style={styles.paragraph}>
            {element.inlineElements
              ? element.inlineElements.map((inline, inlineIndex) =>
                  renderInlineElement(inline, inlineIndex)
                )
              : element.content}
          </ThemedText>
        );

      case "list":
        return (
          <View key={index} style={styles.list}>
            {element.items?.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <ThemedText style={styles.listBullet}>•</ThemedText>
                <ThemedText style={styles.listItemText}>
                  {item.inlineElements
                    ? item.inlineElements.map((inline, inlineIndex) =>
                        renderInlineElement(inline, inlineIndex)
                      )
                    : item.content}
                </ThemedText>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const parsedElements = parseHTML(htmlContent);

  return (
    <View style={[styles.container, style]}>
      {parsedElements.map((element, index) => renderElement(element, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  heading: {
    fontWeight: "bold",
    marginVertical: 10,
    lineHeight: 28,
  },
  h1: {
    fontSize: 24,
    marginVertical: 15,
  },
  h2: {
    fontSize: 22,
    marginVertical: 12,
  },
  h3: {
    fontSize: 20,
    marginVertical: 10,
  },
  h4: {
    fontSize: 18,
    marginVertical: 8,
  },
  h5: {
    fontSize: 16,
    marginVertical: 6,
  },
  h6: {
    fontSize: 14,
    marginVertical: 4,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 8,
    opacity: 0.9,
  },
  list: {
    marginVertical: 8,
    paddingLeft: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 2,
  },
  listBullet: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.7,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    opacity: 0.9,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  lineBreak: {
    lineHeight: 1,
  },
});
