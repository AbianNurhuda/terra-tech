import React, { useMemo } from "react"
import DOMPurify from "dompurify"

// Standard security sanitization configuration for Rich Text rendering
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "del",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre", "span", "hr"
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "title", "dir"],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button", "style"],
  FORBID_ATTR: [
    "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", 
    "onchange", "onsubmit", "onkeydown", "onkeyup", "onkeypress"
  ]
}

/**
 * RichTextContent
 * Safely renders HTML content from RichTextEditor with DOMPurify sanitization
 * and consistent Terra Tech design system typography.
 */
export default function RichTextContent({
  content = "",
  className = "",
  as: Component = "div"
}) {
  const cleanHtml = useMemo(() => {
    if (!content || typeof content !== "string") {
      return ""
    }

    // Check if the string is simple plain text without HTML markup
    const hasHtmlTag = /<[a-z][\s\S]*>/i.test(content)
    
    if (!hasHtmlTag) {
      // Escape and wrap plain text with preserved line breaks
      const escaped = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br />")
      return `<p>${escaped}</p>`
    }

    // Sanitize rich text HTML
    const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIG)

    // Add target="_blank" and rel="noopener noreferrer" to all external/anchor links safely
    return sanitized.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
      // Ensure dangerous schemes are stripped
      if (/^\s*javascript:/i.test(href) || /^\s*data:/i.test(href)) {
        return `<span>${match}</span>`
      }
      const hasTarget = /target=/i.test(rest)
      const hasRel = /rel=/i.test(rest)
      let linkTag = `<a href="${href}"`
      if (!hasTarget) linkTag += ' target="_blank"'
      if (!hasRel) linkTag += ' rel="noopener noreferrer"'
      return `${linkTag}${rest}>`
    })
  }, [content])

  if (!cleanHtml) {
    return null
  }

  return (
    <Component
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
