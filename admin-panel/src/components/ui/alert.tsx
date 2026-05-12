import * as React from "react"

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
}

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = variant === 'destructive' 
      ? 'border-red-200 bg-red-50 text-red-800' 
      : 'border-gray-200 bg-gray-50 text-gray-800'
    
    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${variantClasses} ${className || ''}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm leading-relaxed ${className || ''}`}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
