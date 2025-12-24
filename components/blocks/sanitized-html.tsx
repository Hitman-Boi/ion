export function SanitizedHtml({ content }: { content: string }) {
    // Content is expected to be sanitized on the server before storage
    return <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none dark:prose-invert" />;
}
