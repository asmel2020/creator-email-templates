import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

const variantClass: Record<ButtonVariant, string> = {
  default: "ter-button--default",
  outline: "ter-button--outline",
  secondary: "ter-button--secondary",
  ghost: "ter-button--ghost",
  destructive: "ter-button--destructive",
  link: "ter-button--link",
}

const sizeClass: Record<ButtonSize, string> = {
  default: "ter-button--size-default",
  xs: "ter-button--size-xs",
  sm: "ter-button--size-sm",
  lg: "ter-button--size-lg",
  icon: "ter-button--size-icon",
  "icon-xs": "ter-button--size-icon-xs",
  "icon-sm": "ter-button--size-icon-sm",
  "icon-lg": "ter-button--size-icon-lg",
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn("ter-button", variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  )
}

export const buttonVariants = () => ""
