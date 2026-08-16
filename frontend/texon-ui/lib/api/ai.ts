import type { GqlParams } from "./graphql"

export const aiChat = async (data: GqlParams) => ({
  data: {
    reply: "AI insights are available on the Insights page.",
    conversation_id: data.conversation_id ?? null,
  },
})

export const getAiConversations = async (_params?: GqlParams) => {
  void _params
  return { data: [] as unknown[] & { results?: unknown } }
}

export const getAiConversation = async (_id: number) => {
  void _id
  return { data: null as unknown as never }
}

export const deleteAiConversation = async (_id: number) => {
  void _id
  return { data: { success: true } }
}