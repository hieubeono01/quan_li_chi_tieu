// app/_components/ThemeToggle.js
'use client'
import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../_context/ThemeContext'

export default function ThemeToggle() {
    const { isDarkMode, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-background-dark text-text hover:bg-primary/10 transition-colors"
            aria-label="Toggle theme"
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    )
}