import React from "react";

interface NoteTagProps {
  children: React.ReactNode;
}

const NoteTag: React.FC<NoteTagProps> = ({ children }) => (
  <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-200">
    {children}
  </span>
);

export default NoteTag;
