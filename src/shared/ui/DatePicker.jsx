import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import "react-day-picker/dist/style.css";

export const DatePicker = ({ value, onChange, placeholder = "Seleccionar fecha", disabled = false, minDate, maxDate }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const display = value
        ? format(value, "EEE d MMM, yyyy", { locale: es })
        : placeholder;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg outline-none transition-colors ${
                    disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22] cursor-pointer"
                } ${value ? "text-[#2B2B2B] font-semibold" : "text-[#A0A0A0]"}`}
            >
                <CalendarDays size={16} className="text-[#E67E22] shrink-0" />
                <span className="text-left flex-1 truncate">{display}</span>
                {value && !disabled && (
                    <X
                        size={14}
                        className="text-[#6B6B6B] hover:text-[#C0392B] shrink-0"
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                    />
                )}
            </button>
            {open && (
                <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-[#E8D8C3] p-3 animate-fadeIn">
                    <DayPicker
                        mode="single"
                        selected={value}
                        onSelect={(day) => { onChange(day); setOpen(false); }}
                        locale={es}
                        disabled={{ before: minDate || new Date(), after: maxDate || undefined }}
                        showOutsideDays
                        className="text-[#2B2B2B]"
                        components={{
                            Chevron: ({ orientation }) => {
                                const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                                return <Icon size={16} className="text-[#E67E22]" />;
                            },
                        }}
                        styles={{
                            caption: { color: "#2B2B2B", fontWeight: 700 },
                            head_cell: { color: "#6B6B6B", fontSize: "0.75rem" },
                            day_selected: { backgroundColor: "#E67E22", color: "white" },
                            day_today: { color: "#E67E22", fontWeight: 700 },
                            day: { borderRadius: "0.5rem" },
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export const TimePicker = ({ value, onChange, placeholder = "Hora", disabled = false, selectedDate, openingTime, closingTime }) => {
    const now = new Date();
    const isToday = selectedDate && now.toDateString() === new Date(selectedDate).toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const allHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
    const minutes = ["00", "15", "30", "45"];

    const openH = openingTime ? parseInt(openingTime.split(":")[0]) : 0;
    const closeH = closingTime ? parseInt(closingTime.split(":")[0]) : 23;
    const closeM = closingTime ? parseInt(closingTime.split(":")[1]) : 0;

    const lastValidMinute = closeM > 0 ? closeM - 15 : 45;
    const lastValidHour = closeM > 0 ? closeH : closeH - 1;

    const hours = allHours.filter(h => {
        const hi = parseInt(h);
        if (hi < openH) return false;
        if (hi > lastValidHour) return false;
        if (isToday && hi === currentHour) return true;
        if (isToday && hi < currentHour) return false;
        return true;
    });

    const [h, m] = value ? value.split(":") : ["", ""];

    const isMinuteDisabled = (hourStr, minuteStr) => {
        if (!hourStr) return false;
        const hi = parseInt(hourStr);
        const mi = parseInt(minuteStr);
        if (isToday && hi === currentHour && mi <= currentMinute) return true;
        if (hi === lastValidHour && mi > lastValidMinute) return true;
        return false;
    };

    return (
        <div className="flex gap-2">
            <select
                value={h}
                onChange={(e) => {
                    const newH = e.target.value;
                    if (newH && m) onChange(`${newH}:${m}`);
                    else if (newH && !m) onChange(`${newH}:00`);
                    else onChange("");
                }}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none bg-white text-[#2B2B2B]"
            >
                <option value="">HH</option>
                {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
            <span className="text-[#6B6B6B] self-center font-bold">:</span>
            <select
                value={m}
                onChange={(e) => {
                    const newM = e.target.value;
                    const currentH = value ? value.split(":")[0] : "";
                    if (currentH && newM) onChange(`${currentH}:${newM}`);
                    else if (currentH) onChange(`${currentH}:00`);
                    else onChange("");
                }}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm border border-[#E8D8C3] rounded-lg focus:ring-2 focus:ring-[#E67E22] outline-none bg-white text-[#2B2B2B]"
            >
                <option value="">MM</option>
                {minutes.map(m => (
                    <option key={m} value={m} disabled={isMinuteDisabled(h, m)}>{m}</option>
                ))}
            </select>
        </div>
    );
};
