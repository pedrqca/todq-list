import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface CalendarPickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
}

const toIso = (date: Date) => 
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDate = (value: string) => {
  if (!value) return "Sem prazo";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Inicializa o mês da visão com base no valor atual ou na data de hoje
  const [view, setView] = useState(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  // Sincroniza a visão do calendário se o valor mudar externamente
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setView(new Date(y, m - 1, 1));
    }
  }, [value]);

  // Gerenciamento de eventos globais (Clique fora e Tecla ESC)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toIso(new Date());

  // Calcula a data de amanhã para atalhos rápidos de produtividade
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = toIso(tomorrow);

  return (
    <div className="date-picker" ref={pickerRef}>
      <button 
        type="button" 
        className="date-trigger" 
        aria-haspopup="dialog" 
        aria-expanded={open} 
        onClick={(event) => { 
          event.stopPropagation(); 
          setOpen(!open); 
        }}
      >
        <span className={!value ? "date-trigger-text is-placeholder" : "date-trigger-text"}>
          {formatDate(value)}
        </span>
        <Icon name="calendar" />
      </button>

      {open && (
        <div className="calendar" role="dialog" aria-label="Selecionar data de vencimento">
          <div className="calendar-head">
            <button 
              type="button" 
              className="calendar-nav" 
              onClick={() => setView(new Date(year, month - 1, 1))} 
              aria-label="Mês anterior"
            >
              ‹
            </button>
            <strong>{MONTHS[month]} {year}</strong>
            <button 
              type="button" 
              className="calendar-nav" 
              onClick={() => setView(new Date(year, month + 1, 1))} 
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>

          <div className="calendar-week">
            {WEEKDAYS.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDay }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const dayNum = String(index + 1).padStart(2, "0");
              const dateIso = `${year}-${String(month + 1).padStart(2, "0")}-${dayNum}`;
              const isToday = dateIso === todayIso;
              const isSelected = dateIso === value;

              return (
                <button 
                  key={dateIso} 
                  type="button" 
                  className={`calendar-day ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`} 
                  onClick={() => { 
                    onChange(dateIso); 
                    setOpen(false); 
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="calendar-foot">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}>
              Limpar
            </button>
            <button type="button" onClick={() => { onChange(tomorrowIso); setOpen(false); }}>
              Amanhã
            </button>
            <button type="button" onClick={() => { onChange(todayIso); setOpen(false); }}>
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}