import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // Ao carregar ou mudar o tema, atualiza o HTML e o LocalStorage
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg transition-colors text-sm font-medium
                 text-gray-600 hover:bg-gray-100 
                 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {theme === "light" ? (
        <>
          <Moon size={18} /> Modo Escuro
        </>
      ) : (
        <>
          <Sun size={18} /> Modo Claro
        </>
      )}
    </button>
  );
}