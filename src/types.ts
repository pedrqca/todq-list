export type Priority = "baixa" | "media" | "alta";

export type Filter = "all" | "active" | "completed" | "overdue";

export interface Todo {
  id: string;
  text: string;
  dueDate: string;
  category: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

export const PRIORITIES: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const DEFAULT_CATEGORIES = ["Estudo", "Trabalho", "Pessoal", "Saúde"];
