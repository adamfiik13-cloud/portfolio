"use client"

import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"

interface CounterNumberProps {
  value: string
  className?: string
}

export default function CounterNumber({ value, className = "" }: CounterNumberProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [displayed, setDisplayed] = useState("0")

  // Parse numeric part and suffix (e.g. "4+" -> num=4, suffix="+")
  const match = value.match(/^(\d+)(.*)$/)
  const num = match ? parseInt(match[1]) : 0
  const suffix = match ? match[2] : value

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1500
    const step = 16
    const increment = num / (duration / step)

    const timer = setInterval(() => {
      start += increment
      if (start >= num) {
        setDisplayed(num + suffix)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(start) + suffix)
      }
    }, step)

    return () => clearInterval(timer)
  }, [isInView, num, suffix])

  return (
    <span ref={ref} className={className}>
      {isInView ? displayed : "0" + suffix}
    </span>
  )
}
