import * as React from "react"
import { cn } from "@/lib/utils"
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn("flex min-h-[100px] w-full rounded-md border-[1.5px] border-input bg-card px-3 py-2 text-base leading-relaxed placeholder:text-muted-foreground focus-field disabled:cursor-not-allowed disabled:opacity-50 resize-none", className)} ref={ref} {...props} />
})
Textarea.displayName = "Textarea"
export { Textarea }