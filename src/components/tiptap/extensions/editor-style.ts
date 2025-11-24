export const editorStyles = {
  heading: {
    1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
    2: "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    4: "scroll-m-20 text-xl font-semibold tracking-tight",
    5: "scroll-m-20 text-lg font-semibold tracking-tight",
    6: "scroll-m-20 text-base font-semibold tracking-tight",
  },
  paragraph: "leading-7 [&:not(:first-child)]:mt-6",
  blockquote:
    "mt-6 border-l-2 border-border pl-6 italic text-muted-foreground [&>p]:leading-relaxed",
  code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  codeBlock: "mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4",
  horizontalRule: "my-8 border-border",
  link: "text-primary underline underline-offset-4 hover:text-primary/80",
  list: {
    ordered: "my-6 ml-6 list-decimal [&>li]:mt-2",
    bullet: "my-6 ml-6 list-disc [&>li]:mt-2",
  },
  taskList: {
    list: "my-6 ml-1 list-none [&>li]:mt-2",
    item: "flex items-start gap-2 [&_input]:mt-2",
  },
} as const;
