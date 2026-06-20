import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import Thumbnail from "../models/Thumbnail";
import { Request, Response } from "express";
import ai from '../config/ai'
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from 'cloudinary'

const stylePrompts = {
    'Bold & Graphic': "eye-catching, bold typography, vibrant VideoColorSpace, expressive facial reaction, dramatic SVGFEDiffuseLightingElement, high convertProcessSignalToExitCode, click-worthy CompositionEvent, professional style",
    'Tech/Futuristic': 'futuristic thumbnail, cleek modern design, digital UI element, glowing ascents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmospher',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palatte, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnial, ultra-relaistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}

const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold, contrasts, eye-catching plaette',
    sunset: 'arm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural greem tones, earthy colors, calm and organic palette, fressh atmoshere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk ligting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, moder and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        })

        const model = 'Gemini-2.5-flash-image';


        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio || '16;9',
                imageSize: '1K'
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF }
            ]
        }

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`
        }

        if (user_prompt) {
            prompt += `Additional details : ${user_prompt}.`
        }

        prompt += `the thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional , and impossible to ignore.`


        const response: any = await ai.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: generationConfig
        });

        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error('Unexpected response')
        }

        const parts = response.candidates[0].content.parts;

        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64')
            }
        }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join('images', filename);

        fs.mkdirSync('images', { recursive: true })

        fs.writeFileSync(filePath, finalBuffer!)

        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'image' })

        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save()

        res.json({ message: 'Thumbnail Generated', thumbnail })

        fs.unlinkSync(filePath)

    } catch (error: any) {
        console.log(error);
        res.json({ message: error.message })
    }
}


export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;

        await Thumbnail.findByIdAndDelete({ _id: id, userId })

        res.json({ message: 'Thumbnail deleted successfully' })

    } catch (error: any) {
        console.log(error);
        res.json({ message: error.message })
    }
}