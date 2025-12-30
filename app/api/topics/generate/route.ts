/**
 * API Route: Generate Suggested Topics
 * POST /api/topics/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count = 6, industry, interests } = await req.json();

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt for topic generation
    const prompt = `Generate ${count} engaging LinkedIn post topics that are:
- Trending and relevant in 2024-2025
- Professional and insightful
- Likely to spark engagement and discussion
- Diverse across different themes (leadership, technology, productivity, career growth, etc.)
${industry ? `- Related to ${industry} industry` : ''}
${interests ? `- Aligned with these interests: ${interests}` : ''}

Return ONLY a JSON array of topic strings, nothing else. Each topic should be 8-15 words long.
Example format: ["Topic 1 here", "Topic 2 here", ...]`;

    logger.info("Generating suggested topics", {
      userId: session.user.id,
      count,
      industry,
      interests,
    });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a LinkedIn content strategist expert. Generate engaging, professional post topics that will perform well on LinkedIn. Return only valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No content generated from AI");
    }

    // Parse the JSON response
    let topics: string[];
    try {
      topics = JSON.parse(content);

      if (!Array.isArray(topics) || topics.length === 0) {
        throw new Error("Invalid topics format");
      }

      // Ensure we have the requested count
      topics = topics.slice(0, count);
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON", parseError as Error, {
        content,
      });
      throw new Error("Failed to parse topics from AI response");
    }

    logger.info("Successfully generated topics", {
      userId: session.user.id,
      topicCount: topics.length,
    });

    return NextResponse.json({
      success: true,
      topics,
      count: topics.length,
    });
  } catch (error) {
    logger.error("Error generating topics", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to generate topics",
        },
      },
      { status: 500 }
    );
  }
}

