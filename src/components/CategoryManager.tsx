import { useState } from "react";
import { DEFAULT_CATEGORIES, PRIORITIES, type Priority } from "../types";
import { Icon } from "./Icon";

interface CategoryManagerProps {
  categories: string[];
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onRemove: (name: string) => void;
}

export function CategoryManager({ categories, onAdd, onRename, onRemove }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const exists = categories.some(
      (cat) => cat.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) return;

    onAdd(cleanName);
    setName("");
  };

  const handleSave = () => {
    if (!editing) return;
    const cleanEditName = editName.trim();
    
    if (!cleanEditName) {
      setEditing(null);
      return;
    }

    const exists = categories.some(
      (cat) => cat !== editing && cat.toLowerCase() === cleanEditName.toLowerCase()
    );
    if (exists) return;

    // Dispara a função do componente pai para renomear
    onRename(editing, cleanEditName);
    setEditing(null);
  };

  return (
    <section className="management-grid" aria-label="Configurações">
      {/* Painel de Prioridades */}
      <div className="management-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Ritmo de trabalho</p>
            <h2>Prioridades</h2>
          </div>
          <span className="panel-count">3</span>
        </div>
        <div className="priority-list">
          {(Object.keys(PRIORITIES) as Priority[]).map((priority) => (
            <div className="priority-row" key={priority}>
              <span className={`priority-mark priority-${priority}`} />
              <div>
                <strong>{PRIORITIES[priority]}</strong>
                <span>
                  {priority === "alta" 
                    ? "Precisa de atenção" 
                    : priority === "media" 
                    ? "Planejada para breve" 
                    : "Pode esperar"}
                </span>
              </div>
              <span className={`chip priority-${priority}`}>{PRIORITIES[priority]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel de Categorias */}
      <div className="management-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Organização</p>
            <h2>Categorias</h2>
          </div>
          <span className="panel-count">{categories.length}</span>
        </div>

        <form 
          className="category-creator" 
          onSubmit={(event) => { 
            event.preventDefault(); 
            handleAdd(); 
          }}
        >
          <label className="visually-hidden" htmlFor="new-category">Nova categoria</label>
          <input 
            id="new-category" 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            maxLength={24} 
            placeholder="Nova categoria..." 
          />
          <button type="submit" className="btn-add-cat">Criar categoria</button>
        </form>

        <div className="category-list">
          {categories.map((category) => {
            const isEditing = editing === category;
            const isDefault = DEFAULT_CATEGORIES.includes(category);

            return (
              <div className="category-row" key={category}>
                {isEditing ? (
                  <input 
                    className="edit-input" 
                    autoFocus 
                    value={editName} 
                    onChange={(event) => setEditName(event.target.value)} 
                    onKeyDown={(event) => { 
                      if (event.key === "Enter") handleSave(); 
                      if (event.key === "Escape") setEditing(null); 
                    }} 
                  />
                ) : (
                  <span className="category-name">
                    <span className="category-dot" />
                    {category}
                  </span>
                )}

                <div className="category-actions">
                  {isEditing ? (
                    <>
                      <button type="button" className="btn-small btn-save" onClick={handleSave}>
                        Salvar
                      </button>
                      <button 
                        type="button" 
                        className="btn-cancel-icon" 
                        aria-label="Cancelar edição" 
                        onClick={() => setEditing(null)}
                      >
                        <Icon name="close" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="btn-icon" 
                        aria-label={`Editar ${category}`} 
                        onClick={() => { 
                          setEditing(category); 
                          setEditName(category); 
                        }}
                      >
                        <Icon name="edit" />
                      </button>
                      
                      {/* Categorias padrão podem ser renomeadas, mas não excluídas */}
                      {!isDefault && (
                        <button 
                          type="button" 
                          className="btn-icon btn-delete" 
                          aria-label={`Excluir ${category}`} 
                          onClick={() => onRemove(category)}
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}