import { CREATOR_CONFIG, isCreatorQuery } from './creatorConfig';

export function getKnownChatbotAnswer(question: string): string | undefined {
  if (isCreatorQuery(question)) {
    return `## 👨‍💻 ${CREATOR_CONFIG.name}

${CREATOR_CONFIG.description}

- **Role:** ${CREATOR_CONFIG.role}
- **Education:** ${CREATOR_CONFIG.education}
- **Email:** [${CREATOR_CONFIG.email}](mailto:${CREATOR_CONFIG.email})
- **GitHub:** [github.com/vasudesalla](${CREATOR_CONFIG.github})
- **LinkedIn:** [linkedin.com/in/vasudesalla](${CREATOR_CONFIG.linkedin})
- **Portfolio:** [vasudesalla.com](${CREATOR_CONFIG.portfolio})`;
  }

  const q = question.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (
    q.includes('lifedesk') &&
    (/\bwhat is\b|\bwhat does\b|\btell me about\b|\babout lifedesk\b/.test(q))
  ) {
    return 'LifeDesk AI is your personal productivity workspace for managing tasks, notes, expenses, and documents, with an AI assistant to help you work with them.';
  }

  if (
    /\b(task|tasks|todo|todos)\b/.test(q) &&
    /\b(add|create|make|manage|organize|organise)\b/.test(q)
  ) {
    return 'Open **Tasks** to create a task, set its priority, category, and due date. You can also describe a task here in chat, then use the **Add Task** button on the preview to save it.';
  }

  if (
    /\b(recurring|repeat|repeating|weekly|daily)\b/.test(q) &&
    /\b(task|tasks|remind|repeat|recurring)\b/.test(q)
  ) {
    return 'Create or edit a task in **Tasks**, then choose its recurrence (such as daily or weekly). You can also describe a repeating task in chat, review the preview, and select **Add Task**.';
  }

  if (
    /\b(mark|complete|completed|finish|done|check off)\b/.test(q) &&
    /\b(task|tasks|todo|todos)\b/.test(q)
  ) {
    return 'Open **Tasks** and select the checkmark on a task to mark it complete. You can find finished tasks in the **Completed** view.';
  }

  if (
    /\b(prioritize|prioritise|priority|eisenhower|urgent|important)\b/.test(q) &&
    /\b(task|tasks|work|today|matrix|priorit)\b/.test(q)
  ) {
    return 'In **Tasks**, use **Eisenhower Matrix Prioritization** to get an AI-suggested order based on urgency and importance. You can also set a task priority when creating or editing it.';
  }

  if (
    /\b(search|find|filter|look for)\b/.test(q) &&
    /\b(task|tasks|todo|todos)\b/.test(q)
  ) {
    return 'Open **Tasks** and use the search box to find tasks by title or description. You can also filter the task list by category, priority, due date, and status.';
  }

  if (
    /\b(note|notes)\b/.test(q) &&
    /\b(create|add|write|make|new)\b/.test(q)
  ) {
    return 'Open **Notes**, enter a title and note content, then save it. Your notes are available there for search and AI summarization.';
  }

  if (
    /\b(note|notes)\b/.test(q) &&
    /\b(summarize|summarise|summary)\b/.test(q)
  ) {
    return 'Open **Notes**, choose a note, and use its AI summary action. You can also ask me to summarize your recent notes.';
  }

  if (
    /\b(search|find|look for)\b/.test(q) &&
    /\b(note|notes)\b/.test(q)
  ) {
    return 'Open **Notes** and use its search field to find notes by title, content, or tags.';
  }

  if (
    /\b(expense|expenses|spending)\b/.test(q) &&
    /\b(track|add|record|log|manage)\b/.test(q)
  ) {
    return 'Open **Expenses** to record an amount, category, date, and description. Once you have logged expenses, ask me about your monthly total or spending by category.';
  }

  if (
    /\b(category|categories|breakdown|top|highest|most)\b/.test(q) &&
    /\b(expense|expenses|spending|spent)\b/.test(q)
  ) {
    return 'Ask me “How much did I spend this month?” or “What is my top spending category?” I will use the expense records available in your workspace to calculate the answer.';
  }

  if (
    /\b(document|documents|pdf|file)\b/.test(q) &&
    /\b(ask|question|upload(?:ed|ing)?|summarize|summarise)\b/.test(q)
  ) {
    return 'Open **Documents** and upload a file. You can then request a summary or ask questions about it. Text-based files provide the best results for content questions.';
  }

  if (
    /\b(theme|dark mode|light mode|appearance)\b/.test(q) &&
    /\b(change|switch|set|toggle|how|app|theme|mode)\b/.test(q)
  ) {
    return 'Open **Settings** and choose **Appearance** to switch between light and dark themes.';
  }

  if (
    /\b(profile photo|profile picture|avatar|picture)\b/.test(q) &&
    /\b(change|update|upload|set|how)\b/.test(q)
  ) {
    return 'Open **Profile** and choose the photo/avatar control. You can upload a picture, choose a preset, or enter an image URL.';
  }

  if (
    /\b(gemini|internet|offline|ai key|api key)\b/.test(q) &&
    /\b(need|require|work|without|configured|necessary)\b/.test(q)
  ) {
    return 'LifeDesk AI can answer some common questions and use local fallbacks without a Gemini key. Gemini-powered summaries and other advanced AI responses require the server to have a valid Gemini API key configured.';
  }

  if (
    /\b(create|add|make|save)\b/.test(q) &&
    /\b(task|tasks|chat|assistant)\b/.test(q)
  ) {
    return 'Describe the task in chat, for example “Tomorrow I need to finish my assignment.” Review the task preview and select **Add Task** to save it to your workspace.';
  }

  if (/\b(private|privacy|secure|security|safe)\b/.test(q) && /\b(data|account|workspace|secure|private)\b/.test(q)) {
    return 'Your workspace data is scoped to your signed-in account. When Supabase is configured, database access is protected with user-level Row Level Security policies.';
  }

  if (/\b(what can you do|what can i ask|what can you help me with|how can you help|help me get started)\b/.test(q)) {
    return 'I can help you organize and prioritize tasks, summarize or search notes, review your logged expenses, answer questions about uploaded documents, and explain how to use LifeDesk AI. Try “What tasks are due today?”, “How do I create a note?”, or “What did I spend the most on?”';
  }

  return undefined;
}
