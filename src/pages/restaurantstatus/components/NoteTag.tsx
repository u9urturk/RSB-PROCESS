import React from "react";
import { FileText } from "lucide-react";

interface NoteTagProps {
  children: React.ReactNode;
}

const NoteTag: React.FC<NoteTagProps> = ({ children }) => (
  <span className="group bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200 hover:border-amber-300 transition-all duration-200 hover:scale-105 flex items-center gap-1 relative overflow-hidden">
    <div className="absolute inset-0 bg-amber-100/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
    <FileText size={10} className="relative z-10" />
    <span className="relative z-10">{children}</span>
  </span>
);

export default NoteTag;
