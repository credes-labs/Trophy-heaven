import * as React from "react"
import { cn } from "@/lib/utils"

const ratioMap: Record<string, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
}

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: keyof typeof ratioMap | (string & {})
}

export function AspectRatio({ ratio = "16:9", className, ...props }: AspectRatioProps) {
  const ratioClass = ratioMap[ratio] || `aspect-[${ratio.replace(":", "/")}]`

  return (
    <div
      className={cn("relative overflow-hidden", ratioClass, className)}
      {...props}
    />
  )
}
