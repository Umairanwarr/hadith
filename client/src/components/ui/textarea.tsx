import * as React from "react"

import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, style, ...props }, ref) => {
  const { currentLanguage } = useTranslation();
  
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      style={{
        direction: currentLanguage === 'ar' ? 'rtl' : 'ltr',
        textAlign: currentLanguage === 'ar' ? 'right' : 'left',
        ...style
      }}
      ref={ref}
      // Prevent browser translation from interfering with form inputs
      translate="no"
      data-translate="no"
      autoComplete="off"
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
