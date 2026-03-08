"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const handleToggle = (e, callback) => {
        e.preventDefault();
        callback();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-800 border-b border-gray-700 rounded-t-md">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleBold().run())}
                    className={`${editor.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleItalic().run())}
                    className={`${editor.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleUnderline().run())}
                    className={`${editor.isActive('underline') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* Headings */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                    className={`${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                    className={`${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().setTextAlign('left').run())}
                    className={`${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().setTextAlign('center').run())}
                    className={`${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().setTextAlign('right').run())}
                    className={`${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Other Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleBlockquote().run())}
                    className={`${editor.isActive('blockquote') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} h-8 w-8`}
                    aria-label="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>
            </div>

            {/* History */}
            <div className="flex items-center space-x-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().undo().run())}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="text-gray-400 hover:text-white disabled:opacity-30 h-8 w-8"
                    aria-label="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost" size="icon"
                    onClick={(e) => handleToggle(e, () => editor.chain().focus().redo().run())}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="text-gray-400 hover:text-white disabled:opacity-30 h-8 w-8"
                    aria-label="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, placeholder = "Start typing your poem..." }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base prose-invert max-w-none min-h-[50vh] p-4 bg-gray-900 focus:outline-none rounded-b-md text-gray-200 border-x border-b border-gray-700',
            },

            handleDOMEvents: {
                keydown: (_view, event) => {
                    return false;
                }
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Effect to update editor content if `content` prop changes externally (e.g. loading edit state)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="rich-text-editor overflow-hidden flex flex-col w-full rounded-md mt-2">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="bg-gray-900 border-x border-b border-gray-700 rounded-b-md cursor-text" onClick={() => editor?.commands.focus()} />
            <style jsx global>{`
        /* Global styles for the generic Tiptap elements to match our theme */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
           margin-top: 0.5em;
           margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
           border-left: 3px solid #d4a843;
           padding-left: 1rem;
           margin-left: 0;
           font-style: italic;
           color: #d1d5db;
        }
      `}</style>
        </div>
    );
};

export default RichTextEditor;
