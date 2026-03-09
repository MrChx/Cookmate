import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { name, image } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { name, image: image || null },
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error("Failed to update ingredient:", error);
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
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

    await prisma.recipeIngredient.deleteMany({ where: { ingredientId: id } });
    await prisma.ingredient.delete({ where: { id } });

    return NextResponse.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Failed to delete ingredient:", error);
    return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 });
  }
}
