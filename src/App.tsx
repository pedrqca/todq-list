import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarPicker } from "./components/CalendarPicker";
import { CategoryManager } from "./components/CategoryManager";
import { TodoItem } from "./components/TodoItem";
import { Icon } from "./components/Icon";
import { DEFAULT_CATEGORIES, PRIORITIES, type Filter, type Priority, type Todo } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";

const TODO_KEY = "todolist-items-v2";
const CATEGORY_KEY = "todolist-categories";
const THEME_KEY = "todolist-theme";

const isOverdue = (todo: Todo) => 
  Boolean(todo.dueDate && !todo.completed && new Date(`${todo.dueDate}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0)));

function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(TODO_KEY, []);
  
  // CORREÇÃO PRINCIPAL: Inicializa as categorias com as padrões e permite salvar alterações no localStorage
  const [categories, setCategories] = useLocalStorage<string[]>(CATEGORY_KEY, DEFAULT_CATEGORIES);
  
  const [storedTheme, setStoredTheme] = useLocalStorage<"light" | "dark" | "system">(THEME_KEY, "light");
  const theme: "light" | "dark" = storedTheme === "dark" ? "dark" : "light";
  
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskCategory, setTaskCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [priority, setPriority] = useState<Priority>("media");

  const visibleTodos = useMemo(() => 
    todos
      .filter((todo) => 
        filter === "active" ? !todo.completed : 
        filter === "completed" ? todo.completed : 
        filter === "overdue" ? isOverdue(todo) : true
      )
      .filter((todo) => category === "all" || todo.category === category)
      .filter((todo) => todo.text.toLowerCase().includes(search.toLowerCase().trim()))
      .sort((a, b) => 
        a.completed === b.completed 
          ? (a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : b.createdAt - a.createdAt) 
          : a.completed ? 1 : -1
      ), 
    [todos, filter, category, search]
  );

  const pending = todos.filter((todo) => !todo.completed).length;
  const overdueCount = todos.filter(isOverdue).length;

  useEffect(() => { 
    document.documentElement.dataset.theme = theme; 
    document.documentElement.style.colorScheme = theme; 
  }, [theme]);

  // Garante que o taskCategory inicial seja válido caso a lista mude
  useEffect(() => {
    if (!categories.includes(taskCategory) && categories.length > 0) {
      setTaskCategory(categories[0]);
    }
  }, [categories, taskCategory]);

  const setTheme = (value: "light" | "dark") => setStoredTheme(value);

  const addTodo = (event: FormEvent) => { 
    event.preventDefault(); 
    if (!text.trim()) return; 
    setTodos([
      { 
        id: crypto.randomUUID(), 
        text: text.trim(), 
        dueDate, 
        category: taskCategory, 
        priority, 
        completed: false, 
        createdAt: Date.now() 
      }, 
      ...todos
    ]); 
    setText(""); 
    setDueDate(""); 
    setPriority("media"); 
  };

  const updateTodo = (updated: Todo) => 
    setTodos(todos.map((todo) => todo.id === updated.id ? updated : todo));

  // AGORA FUNCIONA: Atualiza diretamente a lista unificada de categorias e propaga para as tarefas
  const renameCategory = (oldName: string, newName: string) => { 
    const clean = newName.trim().charAt(0).toUpperCase() + newName.trim().slice(1);
    if (!clean || categories.some((item) => item.toLowerCase() === clean.toLowerCase() && item !== oldName)) return; 

    setCategories(categories.map((item) => item === oldName ? clean : item));
    setTodos(todos.map((todo) => todo.category === oldName ? { ...todo, category: clean } : todo));
  };

  const addCategory = (name: string) => { 
    const clean = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    if (!clean || categories.some((item) => item.toLowerCase() === clean.toLowerCase())) return; 
    
    setCategories([...categories, clean]); 
  };

  const removeCategory = (name: string) => {
    // Protege as categorias padrão originais contra exclusão acidental
    if (DEFAULT_CATEGORIES.includes(name)) return;

    const fallbackCategory = DEFAULT_CATEGORIES[0];
    setCategories(categories.filter((item) => item !== name));
    setTodos(todos.map((todo) => todo.category === name ? { ...todo, category: fallbackCategory } : todo));
    
    if (category === name) setCategory("all");
    if (taskCategory === name) setTaskCategory(fallbackCategory);
  };

  return (
    <>
      <div className="bg-blob bg-blob--one" />
      <div className="bg-blob bg-blob--two" />
      <main className="app">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Seu dia organizado</p>
            <h1>O que precisa ser feito?</h1>
            <p className="subtitle">Crie, edite, categorize e acompanhe prazos das suas tarefas.</p>
          </div>
          <div className="theme-switch" role="group" aria-label="Tema da página">
            {(["light", "dark"] as const).map((option) => (
              <button 
                key={option} 
                type="button" 
                className={`theme-btn ${theme === option ? "is-active" : ""}`} 
                onClick={() => setTheme(option)} 
                aria-label={`Tema ${option}`} 
                title={`Tema ${option}`}
              >
                <Icon name={option === "light" ? "sun" : "moon"} />
              </button>
            ))}
          </div>
        </header>

        <section className="card">
          <form className="todo-form" onSubmit={addTodo}>
            <label className="visually-hidden" htmlFor="todo-input">Descrição da tarefa</label>
            <input 
              id="todo-input" 
              value={text} 
              onChange={(event) => setText(event.target.value)} 
              maxLength={120} 
              placeholder="Ex.: revisar anotações da aula..." 
              required 
            />
            <div className="form-row">
              <label className="field">
                <span>Vencimento</span>
                <CalendarPicker value={dueDate} onChange={setDueDate} />
              </label>
              <label className="field">
                <span>Categoria</span>
                <select value={taskCategory} onChange={(event) => setTaskCategory(event.target.value)}>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Prioridade</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                  {Object.entries(PRIORITIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-add">Adicionar</button>
            </div>
          </form>

          <CategoryManager 
            categories={categories} 
            onAdd={addCategory} 
            onRename={renameCategory} 
            onRemove={removeCategory} 
          />

          <div className="toolbar">
            <p className="counter">
              {pending} {pending === 1 ? "pendente" : "pendentes"}
              {overdueCount ? ` · ${overdueCount} atrasada(s)` : ""}
            </p>
            <label className="search-field">
              <span className="visually-hidden">Buscar tarefas</span>
              <input 
                type="search" 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Buscar..." 
              />
            </label>
          </div>

          <div className="filters-wrap">
            <div className="filters" role="tablist" aria-label="Filtrar por status">
              {([["all", "Todas"], ["active", "Pendentes"], ["completed", "Concluídas"], ["overdue", "Atrasadas"]] as [Filter, string][]).map(([value, label]) => (
                <button 
                  key={value} 
                  type="button" 
                  className={`filter ${filter === value ? "is-active" : ""}`} 
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="field field--inline">
              <span className="visually-hidden">Filtrar categoria</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">Todas as categorias</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          {visibleTodos.length ? (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  categories={categories} 
                  onToggle={() => setTodos(todos.map((item) => item.id === todo.id ? { ...item, completed: !item.completed } : item))} 
                  onDelete={() => setTodos(todos.filter((item) => item.id !== todo.id))} 
                  onSave={updateTodo} 
                />
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">✦</span>
              <p>Nenhuma tarefa por aqui.</p>
              <p className="empty-hint">Preencha o campo acima e clique em Adicionar.</p>
            </div>
          )}

          <div className="footer-actions">
            <button 
              type="button" 
              className="btn-ghost" 
              hidden={!todos.some((todo) => todo.completed)} 
              onClick={() => setTodos(todos.filter((todo) => !todo.completed))}
            >
              Limpar concluídas
            </button>
            <button 
              type="button" 
              className="btn-ghost" 
              hidden={!todos.length} 
              onClick={() => { if (confirm("Apagar todas as tarefas?")) setTodos([]); }}
            >
              Apagar tudo
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;