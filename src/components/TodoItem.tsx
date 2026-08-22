import { useState } from "react";
import { CalendarPicker } from "./CalendarPicker";
import { PRIORITIES, type Priority, type Todo } from "../types";

interface TodoItemProps { 
  todo: Todo; 
  categories: string[]; 
  onToggle: () => void; 
  onDelete: () => void; 
  onSave: (todo: Todo) => void; 
}

const toIso = (date: Date) => 
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Compara strings ISO diretamente para evitar bugs de fuso horário do JS
const isOverdue = (todo: Todo) => {
  if (!todo.dueDate || todo.completed) return false;
  const todayIso = toIso(new Date());
  return todo.dueDate < todayIso;
};

const formatDate = (value: string) => {
  if (!value) return "Sem prazo";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export function TodoItem({ todo, categories, onToggle, onDelete, onSave }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo);
  
  const overdue = isOverdue(todo);

  const update = (field: keyof Todo, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (draft.text.trim()) {
      onSave({ ...draft, text: draft.text.trim() });
      setEditing(false);
    }
  };

  // Modo de Edição
  if (editing) {
    return (
      <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
        <button 
          className="check" 
          type="button" 
          onClick={onToggle} 
          aria-label={todo.completed ? "Marcar como pendente" : "Concluir"}
        >
          {todo.completed ? "✓" : ""}
        </button>

        <div className="edit-row">
          <input 
            className="edit-input edit-text" 
            value={draft.text} 
            onChange={(event) => update("text", event.target.value)} 
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
              if (event.key === "Escape") {
                setDraft(todo);
                setEditing(false);
              }
            }}
            maxLength={120} 
            autoFocus
          />
          
          <div className="edit-grid">
            <CalendarPicker 
              value={draft.dueDate} 
              onChange={(value) => update("dueDate", value)} 
            />
            
            <select 
              className="edit-input" 
              value={draft.category} 
              onChange={(event) => update("category", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              className="edit-input" 
              value={draft.priority} 
              onChange={(event) => update("priority", event.target.value as Priority)}
            >
              {Object.entries(PRIORITIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="edit-actions">
            <button type="button" className="btn-save" onClick={handleSave}>
              Salvar
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => { 
                setDraft(todo); 
                setEditing(false); 
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
        <span />
      </li>
    );
  }

  // Modo de Visualização
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""} ${overdue ? "is-overdue" : ""}`}>
      <button 
        className="check" 
        type="button" 
        onClick={onToggle} 
        aria-label={todo.completed ? "Marcar como pendente" : "Marcar como concluída"}
      >
        {todo.completed ? "✓" : ""}
      </button>

      <div className="todo-body">
        <span className="todo-text">{todo.text}</span>
        <div className="meta">
          <span className="chip">{todo.category || "Geral"}</span>
          <span className={`chip due ${overdue ? "overdue" : ""}`}>
            {overdue ? "Atrasada · " : ""}
            {formatDate(todo.dueDate)}
          </span>
          <span className={`chip priority-${todo.priority}`}>
            {PRIORITIES[todo.priority]}
          </span>
        </div>
      </div>

      <div className="actions">
        <button 
          className="btn-icon btn-edit" 
          type="button" 
          aria-label="Editar tarefa" 
          onClick={() => { 
            setDraft(todo); 
            setEditing(true); 
          }}
        >
          ✎
        </button>
        <button 
          className="btn-icon btn-delete" 
          type="button" 
          aria-label="Excluir tarefa" 
          onClick={onDelete}
        >
          ×
        </button>
      </div>
    </li>
  );
}