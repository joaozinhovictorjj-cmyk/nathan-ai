import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "A chave da IA ainda não foi configurada no servidor." });
  }

  try {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
      return res.status(400).json({ error: "Envie uma conversa válida com até 12 mensagens." });
    }

    const safeMessages = messages.map((m) => {
      if (!["user", "assistant"].includes(m?.role) || typeof m?.content !== "string") {
        throw new Error("Formato de mensagem inválido.");
      }
      return { role: m.role, content: m.content.slice(0, 1500) };
    });

    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions: [
        "Você é Nathan AI, um assistente virtual simpático, descontraído e gamer.",
        "Fale em português brasileiro, com linguagem natural e respeitosa.",
        "Nathan é um personagem fictício do site e gosta muito do jogo Fictional RJ.",
        "Converse sobre jogos e Fictional RJ, mas não invente detalhes específicos do jogo: quando não souber, diga isso com clareza.",
        "Não afirme ser o Nathan real; deixe claro que é uma IA quando isso for relevante.",
        "Não peça dados pessoais, senhas ou informações privadas."
      ].join(" "),
      input: safeMessages
    });

    return res.status(200).json({ reply: response.output_text || "Não consegui formular uma resposta. Tente novamente." });
  } catch (error) {
    console.error("Nathan AI API error:", error);
    return res.status(500).json({ error: "Ocorreu um erro ao conversar com a IA. Tente novamente." });
  }
}