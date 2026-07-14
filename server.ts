import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Maximize payload size to allow raw background image analysis
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API FIRST: Server-side Gemini API interaction
  app.post("/api/ai-analyze-room", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data. Please upload a venue photo." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return a clean mock response if API Key is not configured yet
        return res.json({
          styleName: "Премиальная пастельная классика (Демо-режим)",
          description: "Вы находитесь в демо-режиме, так как API-ключ еще не настроен. Это пример изысканной классики для свадебного президиума с пастельными драпировками.",
          colors: ["#F6EEFF", "#E2D4F0", "#C08EF4", "#FFFFFF"],
          flowers: ["Пионовидные розы сорта О`Хара", "Пыльная роза Квиксенд", "Эвкалипт Беби Блю", "Белая гортензия"],
          layoutAdvice: "Рекомендуется центрировать круглую или стрельчатую свадебную арку на фоне главного стола. Насыпные свечи расставить симметричными группами.",
          lightingAdvice: "Используйте теплую ретро-гирлянду роса в качестве задней подсветки и мягкий прожектор с направлением снизу вверх на флористические каскады."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Strip data uri prefix
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        }
      };

      const prompt = `You are an elite, world-class wedding decorator and luxury art director.
Analyze the provided event room / hall photo and design a breathtaking, premium visual styling concept that elevates the space.
Return a structured styling guide in Russian containing:
1. styleName: A beautifully named design style concept (e.g., "Флорентийский Сад", "Урбан Минимализм", "Дымчатая Роза")
2. description: An elegant design description of why this fits the space (2-3 sentences)
3. colors: exactly 4 pastel/premium color hex codes (e.g., ["#F3E8FF", "#FFF1F2", "#F0FDFA", "#FFFFFF"])
4. flowers: exactly 4 recommended luxury flower types or decor textures
5. layoutAdvice: practical advice on where to place the arch/photowall, guest tables, and walkways
6. lightingAdvice: advice on ambient, accent, or neon light temperatures

Return as a raw JSON object matching the requested schema. Do not add markdown blocks outside the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: prompt }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              styleName: { type: Type.STRING },
              description: { type: Type.STRING },
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              flowers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              layoutAdvice: { type: Type.STRING },
              lightingAdvice: { type: Type.STRING }
            },
            required: ["styleName", "description", "colors", "flowers", "layoutAdvice", "lightingAdvice"]
          }
        }
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini API Error in server.ts:", err);
      res.status(500).json({ error: err.message || "Ошибка при генерации ИИ-рекомендаций" });
    }
  });

  // Mount Vite development middleware or serve compiled files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Full-stack dev server listening on port ${PORT}`);
  });
}

startServer();
