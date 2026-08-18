export type CMSBlockType = "HEADING" | "PARAGRAPH" | "WARNING_BANNER" | "IMAGE_GRID";

export interface CMSBlock {
  id: string;
  type: CMSBlockType;
  content: {
    text?: string;
    accentText?: string;
    level?: number;
    images?: string[];
    variant?: "red" | "dark" | "concrete";
  };
  order: number;
}
