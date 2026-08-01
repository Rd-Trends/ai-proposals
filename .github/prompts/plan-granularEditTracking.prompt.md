# Plan: Granular Edit Tracking for Tiptap Editor

Implement a track-changes system for the research editor that shows previous vs. updated content when AI actions like "Proofread" are triggered. Users can review individual changes inline with accept/reject controls.

## Steps

### 1. Create custom Tiptap mark extension
Create in `src/components/tiptap/` for tracked changes with attributes:
- `originalText` - The original text before changes
- `updatedText` - The AI-modified text
- `changeType` - Type of change: insert/delete/replace
- `actionType` - Which AI action triggered it (e.g., "proofread", "generate")
- `timestamp` - When the change was made
- `accepted` - Status: null (pending), true (accepted), false (rejected)

### 2. Build AI proofread infrastructure
- Create `src/actions/research-actions.ts` with `proofreadContentAction` server action
- Add `proofreadContent` tool in `src/lib/ai/tools/research-tools.ts`
- Create proofreading prompt in `src/lib/ai/prompts.ts`

### 3. Implement diff algorithm integration
- Use `diff-match-patch` library to compare original and AI-edited content
- Insert tracked-change marks at precise positions via Tiptap commands
- Handle different change types (additions, deletions, replacements)

### 4. Create change visualization components
- `ChangeIndicator` - React node view for inline highlighting with tooltip showing original vs. updated
- `ChangesSidebar` - Panel listing all changes with accept/reject buttons
- Update `SimpleEditor` (src/components/tiptap/simple-editor.tsx) to support toggle between edit/review modes

### 5. Wire up the Proofread button
In `reserach.tsx` (src/app/dashboard/research/reserach.tsx):
- Capture editor HTML on button click
- Call server action with loading state via `useTransition`
- Process diff results
- Update editor with tracked changes

### 6. Add change resolution logic
- Commands: `acceptChange` and `rejectChange` that remove marks and apply/discard text modifications
- Integrate with Tiptap's history system (undo/redo support)
- Provide "Accept All" / "Reject All" batch operations

## Further Considerations

### 1. Change granularity
Should tracking work at word-level, sentence-level, or paragraph-level? 
- **Word-level**: Finest control but more visual noise
- **Sentence-level**: Recommended as default - good balance
- **Paragraph-level**: Cleaner UI but less precise
- Consider making this configurable

### 2. Multiple AI actions
Plan mentions "Generate" button too—should both Proofread and Generate use the same tracking system?
- Consider unified `AIActionType` enum
- Create prompt templates for different operations
- Reusable change tracking infrastructure

### 3. Persistence strategy
Should tracked changes be stored in database or only exist in editor session?
- **Session-only**: Simpler, no DB changes needed
- **Persisted**: Better for research documents that need durability
- If persisted, consider new `researchDocuments` table with:
  - `content` (text/HTML)
  - `trackedChanges` (JSON field)
  - Standard timestamps and user foreign key

## Implementation Pattern Reference

### Server Action Pattern
```typescript
// src/actions/research-actions.ts
export const proofreadContentAction = async (content: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { data: null, error: "Unauthorized", success: false };
  
  const result = await generateText({
    model: openai("gpt-4o"),
    system: "You are a professional proofreader...",
    prompt: content,
  });
  
  return { data: result.text, error: null, success: true };
};
```

### Tool Pattern
```typescript
// src/lib/ai/tools/research-tools.ts
export const proofreadContent = (user: User) =>
  tool({
    description: "Proofread and improve writing content.",
    inputSchema: z.object({
      content: z.string(),
      focusAreas: z.array(z.string()).optional(),
    }),
    execute: async ({ content, focusAreas }) => {
      // Call AI to proofread
      // Return edited content with change markers
    },
  });
```

### Custom Mark Extension Pattern
```typescript
// src/components/tiptap/tracked-change-mark.ts
export const TrackedChangeMark = Mark.create({
  name: "trackedChange",
  
  addAttributes() {
    return {
      originalText: { default: "" },
      updatedText: { default: "" },
      changeType: { default: "replace" }, // insert | delete | replace
      actionType: { default: "proofread" },
      timestamp: { default: Date.now() },
      accepted: { default: null },
    };
  },
  
  parseHTML() {
    return [{ tag: 'span[data-tracked-change]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-tracked-change': '', ...HTMLAttributes }, 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(TrackedChangeNode);
  }
});
```

### Component Usage Pattern
```typescript
// In component
const [isPending, startTransition] = useTransition();

const handleProofread = () => {
  const currentContent = editor?.getHTML();
  if (!currentContent) return;
  
  startTransition(async () => {
    const result = await proofreadContentAction(currentContent);
    if (result.success) {
      // Apply diff and insert tracked changes
      applyTrackedChanges(currentContent, result.data);
      toast.success("Proofread complete");
    } else {
      toast.error(result.error);
    }
  });
};
```

## Data Flow
```
User clicks "Proofread"
  ↓
Capture editor.getHTML()
  ↓
proofreadContentAction(content)
  ↓
AI processes & returns edited version
  ↓
Diff algorithm (original vs edited)
  ↓
Insert custom marks/nodes at diff positions
  ↓
Update editor state
  ↓
Render changes with visual indicators
  ↓
User reviews and accepts/rejects changes
```

## Technical Constraints
1. **Undo/Redo**: Changes must integrate with Tiptap history
2. **Streaming**: For long content, consider streaming AI edits progressively
3. **Export**: Ensure tracked changes export correctly to HTML/plain text
4. **Performance**: Large documents with many changes need efficient rendering
5. **Three-layer architecture**: Follow server actions → DB operations → components pattern
