"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types";

/**
 * A single-line input supporting @mention typeahead. Calls back with the raw
 * text and the set of resolved mentioned user IDs (matched by name token).
 */
export function MentionInput({
  people,
  value,
  onChange,
  onMentionsChange,
  placeholder,
}: {
  people: Pick<Profile, "id" | "name" | "avatar_url">[];
  value: string;
  onChange: (v: string) => void;
  onMentionsChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Resolve mentioned IDs whenever text changes: any @Name matching a person.
  React.useEffect(() => {
    const ids: string[] = [];
    for (const p of people) {
      const token = "@" + p.name.replace(/\s+/g, "");
      if (value.toLowerCase().includes(token.toLowerCase())) ids.push(p.id);
    }
    onMentionsChange(ids);
  }, [value, people, onMentionsChange]);

  function handleChange(next: string) {
    onChange(next);
    const m = next.match(/@(\w*)$/);
    setQuery(m ? m[1] : null);
  }

  const suggestions =
    query != null
      ? people
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
      : [];

  function pick(p: Pick<Profile, "id" | "name">) {
    const next = value.replace(/@(\w*)$/, "@" + p.name.replace(/\s+/g, "") + " ");
    onChange(next);
    setQuery(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? "Add a comment… use @ to tag"}
        className="cut w-full h-11 px-3 surface-2 text-text placeholder:text-muted text-sm focusable"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bottom-12 left-0 right-0 z-20 cut surface border border-border overflow-hidden">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 focusable text-left"
              >
                <Avatar name={p.name} url={p.avatar_url} size={26} />
                <span className="text-sm">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Renders comment text with @mentions highlighted as accent tokens. */
export function renderMentions(body: string, names: string[]) {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  const parts: React.ReactNode[] = [];
  let rest = body;
  let key = 0;
  while (rest.length > 0) {
    let matched = false;
    for (const n of sorted) {
      const token = "@" + n.replace(/\s+/g, "");
      const idx = rest.toLowerCase().indexOf(token.toLowerCase());
      if (idx === 0) {
        parts.push(
          <span key={key++} className="text-accent font-semibold">
            {rest.slice(0, token.length)}
          </span>,
        );
        rest = rest.slice(token.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      parts.push(<span key={key++}>{rest[0]}</span>);
      rest = rest.slice(1);
    }
  }
  return parts;
}
