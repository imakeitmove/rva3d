/** One northeast arrow for case-study expansion; the return arrow indicates exit. */
export function MediaExpandIcon({ expanded = false }: { expanded?: boolean }) {
  return <svg data-media-expand aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={expanded ? "M18 6 6 18M6 6v12h12" : "M6 18 18 6M6 6h12v12"} />
  </svg>;
}
