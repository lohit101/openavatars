import { CopySnippet } from './copy-snippet';

export function DocsCodeBlock({
  code,
  label,
  language,
}: {
  code: string;
  label: string;
  language: string;
}) {
  const parts = code.split(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|const|return|export|function|interface|type|true|false|async|await|throw|new|if|try|catch)\b|\/\/[^\n]*)/g,
  );
  return (
    <figure className="docs-code-block">
      <figcaption>
        <span>{label}</span>
        <CopySnippet code={code} label={label} />
      </figcaption>
      <pre tabIndex={0} aria-label={`${label} code example`}>
        <code data-language={language}>
          {parts.map((part, index) => (
            <span
              key={index}
              className={
                part.startsWith('//')
                  ? 'docs-code-comment'
                  : /^["']/.test(part)
                    ? 'code-string'
                    : /^(import|from|const|return|export|function|interface|type|true|false|async|await|throw|new|if|try|catch)$/.test(
                          part,
                        )
                      ? 'code-keyword'
                      : undefined
              }
            >
              {part}
            </span>
          ))}
        </code>
      </pre>
      <span className="docs-code-language">{language}</span>
    </figure>
  );
}
