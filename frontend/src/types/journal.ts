export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  wordCount?: number;
  isExpanded?: boolean;
}

export interface MoodOption {
  emoji: React.ReactNode;
  label: string;
  color: string;
}

export interface JournalFormData {
  title: string;
  content: string;
  mood: string;
  tags: string[];
}

export interface TagStyle {
  name: string;
  color: string;
  textColor: string;
}