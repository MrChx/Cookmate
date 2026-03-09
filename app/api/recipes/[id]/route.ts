import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { name: true } },
        ingredients: {
          include: { ingredient: true },
        },
        instructions: {
          orderBy: { stepNumber: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      description,
      image,
      prepTime,
      cookTime,
      difficulty,
      calories,
      servings,
      status,
      categoryId,
      ingredients, // Array of { ingredientId, quantity }
      instructions, // Array of { stepNumber, title, description, image }
    } = data;

    // Delete existing relations
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id },
    });
    await prisma.instruction.deleteMany({
      where: { recipeId: id },
    });

    // Update recipe with new relations
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        description,
        image,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        difficulty,
        calories: calories ? Number(calories) : null,
        servings: Number(servings),
        status,
        categoryId,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        },
        instructions: {
          create: instructions.map((ins: any) => ({
            stepNumber: Number(ins.stepNumber),
            title: ins.title,
            description: ins.description,
            image: ins.image,
          })),
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Recipe deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
