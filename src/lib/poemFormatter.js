/**
 * Formats poem content for rendering and editing.
 * 
 * Purpose:
 * - Seamlessly handles legacy plain-text poems (with \n and \n\n)
 * - Preserves line breaks (<br>) and stanza / section breaks (<p><br></p>)
 * - Prevents empty paragraphs (<p></p>) from collapsing to 0 height in browsers
 */

export const formatPoemHtml = (raw) => {
    if (!raw) return '';

    // Check if the content contains HTML tags (e.g. <p>, <br>, <div>, etc.)
    const isHtml = /<[a-z][\s\S]*>/i.test(raw);

    if (isHtml) {
        // Prevent empty paragraphs from collapsing to 0 height
        return raw
            .replace(/<p>\s*<\/p>/g, '<p><br></p>')
            .replace(/<p><br\s*\/?><\/p>/g, '<p><br></p>');
    }

    // Content is legacy plain text with \n and \n\n:
    // Split on 2+ newlines for stanza breaks, and 1 newline for line breaks within a stanza
    return raw
        .trim()
        .split(/\n{2,}/)
        .map(stanza => {
            const lines = stanza.split(/\n/).map(line => line.trim());
            return `<p>${lines.join('<br />')}</p>`;
        })
        .join('<p><br /></p>');
};
