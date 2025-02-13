'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        // Kiểm tra theme từ localStorage khi component mount
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark') {
            setIsDarkMode(true)
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newValue = !prev
            // Lưu theme vào localStorage
            localStorage.setItem('theme', newValue ? 'dark' : 'light')
            // Toggle class dark trên document
            document.documentElement.classList.toggle('dark')
            return newValue
        })
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)