"use client"

import { motion } from "framer-motion"

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  variant?: "primary" | "secondary" | "ghost"
  className?: string
  target?: string
  rel?: string
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  target,
  rel,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none"

  const variants = {
    primary:
      "bg-[#d6232f] text-white hover:bg-[#ff4b55] active:scale-95",
    secondary:
      "bg-[#202024] text-[#f3f3f4] border border-[#29292e] hover:border-[#d6232f] hover:text-white active:scale-95",
    ghost:
      "text-[#a8a8ae] hover:text-white underline-offset-4 hover:underline active:scale-95",
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}
