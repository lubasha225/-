import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure persistent directories exist
  const publicDir = path.join(process.cwd(), "public");
  const uploadsDir = path.join(publicDir, "uploads");
  const logosDir = path.join(uploadsDir, "logos");
  const bannersDir = path.join(uploadsDir, "banners");
  const dataDir = path.join(publicDir, "data");
  [publicDir, uploadsDir, logosDir, bannersDir, dataDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
  });

  // Maximize payload size to allow raw background image analysis & uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve static public folder files directly
  app.use(express.static(publicDir));

  // Persistent Partners API: Read from server file
  app.get("/api/partners", async (req, res) => {
    try {
      const filePath = path.join(dataDir, "partners.json");
      if (fs.existsSync(filePath)) {
        const raw = await fs.promises.readFile(filePath, "utf-8");
        return res.json(JSON.parse(raw));
      }
      return res.json([]);
    } catch (e: any) {
      console.error("Error reading partners.json:", e);
      return res.status(500).json({ error: "Failed to read partners data" });
    }
  });

  // Persistent Partners API: Save to server file
  app.post("/api/partners", async (req, res) => {
    try {
      const filePath = path.join(dataDir, "partners.json");
      await fs.promises.writeFile(filePath, JSON.stringify(req.body, null, 2), "utf-8");
      return res.json({ success: true, count: Array.isArray(req.body) ? req.body.length : 0 });
    } catch (e: any) {
      console.error("Error saving partners.json:", e);
      return res.status(500).json({ error: "Failed to save partners data" });
    }
  });

  // Real File Upload API: Writes actual PNG/JPG files to public/uploads/
  app.post("/api/upload", async (req, res) => {
    try {
      const { dataUrl, type, filename } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: "Missing dataUrl" });
      }

      const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid data URL format" });
      }

      let ext = match[1] === "jpeg" ? "jpg" : match[1];
      if (ext === "svg+xml") ext = "svg";
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const subfolder = type === "banner" ? "banners" : "logos";
      const targetDir = path.join(uploadsDir, subfolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const safeName = (filename || `${type || "file"}`)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);
      const finalFileName = `${safeName}-${Date.now()}.${ext}`;
      const filePath = path.join(targetDir, finalFileName);

      await fs.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${subfolder}/${finalFileName}`;

      return res.json({ success: true, url: publicUrl, filename: finalFileName });
    } catch (err: any) {
      console.error("Upload error in server.ts:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

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

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
      let parsedData = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
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
          parsedData = JSON.parse(text);
          if (parsedData?.styleName) break;
        } catch (mErr: any) {
          console.warn(`Model ${modelName} analysis attempt failed:`, mErr?.message || mErr);
        }
      }

      if (!parsedData) {
        return res.json({
          styleName: "Воздушный Ботанический Шик",
          description: "Концепция построена на сочетании натуральной зелени эвкалипта, прозрачных стеклянных элементов и теплой мягкой подсветки для визуального расширения пространства.",
          colors: ["#F4F0FF", "#E9D8FD", "#D6BCFA", "#FFFFFF"],
          flowers: ["Белая крупнолистная гортензия", "Пионовидные розы Вайт О`Хара", "Эвкалипт Популус", "Французские ранункулюсы"],
          layoutAdvice: "Разместите основную фотозону с акцентной аркой в глубине зала, чтобы создать красивую перспективу на фото гостей.",
          lightingAdvice: "Используйте теплый рассеянный свет 2700K и скрытую диодную подсветку основания президиума."
        });
      }

      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini API Error in server.ts:", err);
      res.json({
        styleName: "Премиальная пастельная классика",
        description: "Элегантное оформление с акцентом на светлые пастельные оттенки и воздушные флористические композиции.",
        colors: ["#F6EEFF", "#E2D4F0", "#C08EF4", "#FFFFFF"],
        flowers: ["Пионовидные розы", "Эвкалипт", "Белая гортензия", "Гипсофила"],
        layoutAdvice: "Центральное размещение свадебного стола и симметричные световые акценты.",
        lightingAdvice: "Мягкая теплая подсветка композиций."
      });
    }
  });

  // API Route: AI Background Removal & Object Segmentation
  app.post("/api/ai-remove-bg", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Отсутствуют данные изображения." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      if (!apiKey) {
        return res.json({
          success: true,
          useFallback: true,
          notice: "Используется высокоточный локальный алгоритм удаления фона."
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

      let analysis: any = null;
      const visionModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
      const visionPrompt = `Analyze this image and identify the primary foreground decoration or subject.
Return a raw JSON object with:
- "found": true/false
- "objectName": string name of the object found (e.g. "Арка из шаров", "Цветочная композиция")
- "box": [ymin, xmin, ymax, xmax] normalized bounding box on a 0-100 scale surrounding ONLY the main subject without background.
- "bgColorHex": hex color string of dominant background (e.g. "#FFFFFF" or "#E0D0F5")
- "fgColorHex": hex color string of object foreground`;

      for (const modelName of visionModels) {
        try {
          const analysisRes = await ai.models.generateContent({
            model: modelName,
            contents: [
              { inlineData: { mimeType: "image/jpeg", data: base64Data } },
              { text: visionPrompt }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  found: { type: Type.BOOLEAN },
                  objectName: { type: Type.STRING },
                  box: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  },
                  bgColorHex: { type: Type.STRING },
                  fgColorHex: { type: Type.STRING }
                },
                required: ["found", "objectName", "box", "bgColorHex", "fgColorHex"]
              }
            }
          });

          analysis = JSON.parse(analysisRes.text || "{}");
          if (analysis?.box) break;
        } catch {
          // Gracefully continue to next model or fallback without throwing
        }
      }

      return res.json({
        success: true,
        analysis,
        useFallback: true
      });
    } catch {
      return res.json({
        success: true,
        useFallback: true,
        notice: "Применен быстрый локальный алгоритм сегментации."
      });
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
