import React, { useEffect, useState, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Smile,
  X,
  Check
} from "lucide-react"

// Common Unicode emojis for quick CMS usage
const EMOJI_LIST = [
  "📢", "🚀", "✅", "⚠️", "📄", "🏢", "😀", "😃", "😄", "😎",
  "💡", "📌", "🎯", "📊", "🔍", "📝", "🔒", "⏳", "🎉", "🔥"
]

/**
 * Clean dirty HTML pasted from MS Word or Google Docs
 */
function cleanPastedHtml(html) {
  if (!html || typeof html !== "string") return html

  // Remove MS Word conditional comments and XML namespaces
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<xml[\s\S]*?<\/xml>/gi, "")
    .replace(/<o:p[\s\S]*?<\/o:p>/gi, "")
    .replace(/<\/?\w+:[^>]*>/gi, "")

  // Remove inline mso styles
  cleaned = cleaned.replace(/style="[^"]*mso-[^"]*"/gi, "")

  return cleaned
}

/**
 * Validates external or internal URL, rejecting dangerous schemes like javascript: or vbscript:
 */
function isValidUrl(url) {
  if (!url) return false
  const trimmed = url.trim()
  if (/^\s*(javascript|vbscript|data):/i.test(trimmed)) {
    return false
  }
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:")
}

/**
 * RichTextEditor Component
 * A robust, accessible, and secure Tiptap Rich Text Editor for Terra Tech CMS.
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis konten di sini...",
  disabled = false,
  error = null,
  minHeight = "220px",
  className = ""
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkInput, setLinkInput] = useState("")
  const [linkError, setLinkError] = useState("")
  const emojiRef = useRef(null)

  // Initialize Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        dropcursor: {
          color: "#06b6d4",
          width: 2
        }
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-accent-cyan underline hover:text-blue-600 font-medium"
        },
        validate: href => isValidUrl(href)
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty"
      })
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none p-3.5 leading-relaxed text-text-primary text-xs",
        style: `min-height: ${typeof minHeight === "number" ? `${minHeight}px` : minHeight};`
      },
      transformPastedHTML(html) {
        return cleanPastedHtml(html)
      }
    },
    onUpdate({ editor }) {
      if (!onChange) return
      // If editor only contains an empty paragraph, send empty string to match form reset behaviors
      if (editor.isEmpty) {
        onChange("")
      } else {
        onChange(editor.getHTML())
      }
    }
  })

  // Synchronize incoming value changes without breaking cursor position
  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    const currentHtml = editor.getHTML()
    const targetValue = value || ""

    // Normalize empty values
    const isEditorEffectivelyEmpty = editor.isEmpty || currentHtml === "<p></p>"
    const isValueEffectivelyEmpty = !targetValue || targetValue === "<p></p>"

    if (isEditorEffectivelyEmpty && isValueEffectivelyEmpty) {
      return
    }

    if (currentHtml !== targetValue) {
      editor.commands.setContent(targetValue, false)
    }
  }, [value, editor])

  // Update editable state
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // Close emoji dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  // Link Dialog Handlers
  const handleOpenLinkModal = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href || ""
    setLinkInput(previousUrl)
    setLinkError("")
    setShowLinkModal(true)
  }, [editor])

  const handleApplyLink = useCallback(() => {
    if (!editor) return

    if (!linkInput.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      setShowLinkModal(false)
      return
    }

    let urlToSet = linkInput.trim()

    // Automatically prefix with https:// if no protocol provided and not a relative path/anchor
    if (!/^https?:\/\//i.test(urlToSet) && !urlToSet.startsWith("/") && !urlToSet.startsWith("#") && !urlToSet.startsWith("mailto:")) {
      urlToSet = `https://${urlToSet}`
    }

    if (!isValidUrl(urlToSet)) {
      setLinkError("URL tidak valid atau mengandung protokol tidak aman.")
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: urlToSet }).run()
    setShowLinkModal(false)
  }, [editor, linkInput])

  const handleRemoveLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    setShowLinkModal(false)
  }, [editor])

  // Insert Emoji
  const handleInsertEmoji = useCallback((emoji) => {
    if (!editor) return
    editor.chain().focus().insertContent(emoji).run()
    setShowEmojiPicker(false)
  }, [editor])

  if (!editor) {
    return (
      <div className={`w-full rounded-xl border border-dark-border bg-dark-base p-4 text-xs text-text-muted animate-pulse ${className}`}>
        Memuat editor teks...
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Editor Main Container */}
      <div
        className={`w-full rounded-xl border transition-all duration-150 overflow-hidden ${
          disabled
            ? "bg-dark-base/40 opacity-75 border-dark-border cursor-not-allowed"
            : error
            ? "border-rose-400 bg-rose-50/10 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200"
            : "border-dark-border bg-white focus-within:border-accent-cyan/80 focus-within:ring-2 focus-within:ring-accent-cyan/15"
        }`}
      >
        {/* Sticky Toolbar */}
        <div
          role="toolbar"
          aria-label="Editor formatting toolbar"
          className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-1.5 border-b border-dark-border bg-dark-base/70 backdrop-blur-sm"
        >
          {/* Format: Bold */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Tebalkan teks (Bold)"
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              editor.isActive("bold")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          {/* Format: Italic */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Miringkan teks (Italic)"
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("italic")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          {/* Format: Underline */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Garis bawahi teks (Underline)"
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("underline")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>

          {/* Format: Strike */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Coret teks (Strikethrough)"
            title="Strikethrough"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("strike")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-dark-border mx-0.5" />

          {/* Headings */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setParagraph().run()}
            aria-label="Paragraf biasa"
            title="Paragraph"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="Heading level 1"
            title="Heading 1"
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading level 2"
            title="Heading 2"
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="Heading level 3"
            title="Heading 3"
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-dark-border mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Daftar poin (Bullet List)"
            title="Bullet List"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("bulletList")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Daftar nomor (Ordered List)"
            title="Ordered List"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("orderedList")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-dark-border mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Rata kiri"
            title="Align Left"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Rata tengah"
            title="Align Center"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Rata kanan"
            title="Align Right"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-dark-border mx-0.5" />

          {/* Link */}
          <button
            type="button"
            disabled={disabled}
            onClick={handleOpenLinkModal}
            aria-label="Sisipkan atau edit link"
            title="Insert Link"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive("link")
                ? "bg-accent-cyan text-white shadow-sm"
                : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          {/* Emoji Picker Dropdown */}
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Sisipkan emoji"
              title="Insert Emoji"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showEmojiPicker
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-text-secondary hover:bg-dark-base hover:text-text-primary"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Smile className="h-3.5 w-3.5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-white rounded-xl shadow-xl border border-dark-border w-52 grid grid-cols-5 gap-1 animate-fade-in">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="h-8 w-8 flex items-center justify-center text-base hover:bg-dark-base rounded-lg transition-transform hover:scale-110"
                    title={`Emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            aria-label="Hapus pemformatan"
            title="Clear formatting"
            className="p-1.5 rounded-lg text-xs text-text-secondary hover:bg-dark-base hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-dark-border mx-0.5" />

          {/* History: Undo / Redo */}
          <button
            type="button"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            aria-label="Batal perubahan (Undo)"
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-xs text-text-secondary hover:bg-dark-base hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            aria-label="Ulangi perubahan (Redo)"
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-xs text-text-secondary hover:bg-dark-base hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Link Input Modal / Popover */}
        {showLinkModal && (
          <div className="p-3 bg-dark-base border-b border-dark-border flex flex-col sm:flex-row gap-2 items-stretch sm:items-center animate-fade-in">
            <div className="flex-1">
              <input
                type="text"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value)
                  setLinkError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleApplyLink()
                  } else if (e.key === "Escape") {
                    setShowLinkModal(false)
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-3 py-1.5 rounded-lg border border-dark-border text-xs bg-white text-text-primary focus:outline-none focus:border-accent-cyan"
                autoFocus
              />
              {linkError && (
                <span className="text-[11px] text-rose-500 block mt-1">{linkError}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-3 py-1.5 bg-accent-cyan text-white rounded-lg text-xs font-bold hover:bg-blue-600 flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Terapkan</span>
              </button>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 flex items-center gap-1"
                  title="Hapus Link"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg border border-dark-border"
                title="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Editor Content Area */}
        <div className="tiptap-content-wrapper overflow-y-auto max-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Error Message */}
      {error && typeof error === "string" && (
        <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}
