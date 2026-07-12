import * as React from "react"

export function AuthShell({
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {icon}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold text-balance">{title}</h1>
            <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
          </div>
        </div>
        {children}
        {footer ? (
          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </main>
  )
}
