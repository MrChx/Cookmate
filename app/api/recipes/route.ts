import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const ingredientsParam = searchParams.get("ingredients");
    const userIngredientIds = ingredientsParam
      ? ingredientsParam.split(",").filter(Boolean)
      : null;

    let whereClause: any = {};

    if (query) {
      whereClause.title = { contains: query, mode: "insensitive" };
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (status) {
      whereClause.status = status;
    }

    let recipes = await prisma.recipe.findMany({
      where: whereClause,
      include: {
        category: true,
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (userIngredientIds && userIngredientIds.length > 0) {
      recipes = recipes
        .filter((recipe) => {
          const recipeIngredientIds = recipe.ingredients.map(
            (ri) => ri.ingredientId
          );
          if (recipeIngredientIds.length === 0) return false;
          return recipeIngredientIds.some((id) =>
            userIngredientIds.includes(id)
          );
        })
        .sort((a, b) => {
          const aMatch = a.ingredients.filter((ri) => userIngredientIds.includes(ri.ingredientId)).length / a.ingredients.length;
          const bMatch = b.ingredients.filter((ri) => userIngredientIds.includes(ri.ingredientId)).length / b.ingredients.length;
          return bMatch - aMatch;
        });
    }


    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.authorId) {
      data.authorId = session.user.id;
    }

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
      authorId,
      ingredients, // Array of { ingredientId, quantity }
      instructions, // Array of { stepNumber, title, description, image }
    } = data;

    const recipe = await prisma.recipe.create({
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
        authorId,
        ingredients: {
          create: ingredients,
        },
        instructions: {
          create: instructions,
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
