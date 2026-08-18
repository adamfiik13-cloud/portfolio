interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "red" | "outline"
  className?: string
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide"

  const variants = {
    default: "bg-[#202024] text-[#a8a8ae]",
    red: "bg-[#d6232f]/15 text-[#ff4b55]",
    outline: "border border-[#29292e] text-[#a8a8ae]",
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
