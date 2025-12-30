/**
 * API Route: Saved Topics
 * GET /api/topics/saved - Get all saved topics
 * POST /api/topics/saved - Save a new topic
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

// GET - Fetch all saved topics for the user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedTopics = await prisma.savedTopic.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      topics: savedTopics,
      count: savedTopics.length,
    });
  } catch (error) {
    logger.error("Error fetching saved topics", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch saved topics" },
      { status: 500 }
    );
  }
}

// POST - Save a new topic
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Check if topic already saved
    const existing = await prisma.savedTopic.findFirst({
      where: {
        userId: session.user.id,
        topic: topic.trim(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Topic already saved" },
        { status: 400 }
      );
    }

    const savedTopic = await prisma.savedTopic.create({
      data: {
        userId: session.user.id,
        topic: topic.trim(),
      },
    });

    logger.info("Topic saved", {
      userId: session.user.id,
      topicId: savedTopic.id,
    });

    return NextResponse.json({
      success: true,
      topic: savedTopic,
    });
  } catch (error) {
    logger.error("Error saving topic", error as Error);
    return NextResponse.json(
      { error: "Failed to save topic" },
      { status: 500 }
    );
  }
}
