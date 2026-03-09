import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newEmail, newPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json({ error: "Password saat ini wajib diisi." }, { status: 400 });
    }
    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: "Isi minimal email baru atau password baru." }, { status: 400 });
    }

    // Cari user berdasarkan email session
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Verifikasi password lama
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password saat ini tidak benar." }, { status: 400 });
    }

    const updateData: { email?: string; password?: string } = {};
    if (newEmail && newEmail !== user.email) {
      updateData.email = newEmail;
    }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan yang dilakukan." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });

    return NextResponse.json({ message: "Kredensial berhasil diperbarui." });
  } catch (error) {
    console.error("Reset credentials error:", error);
    return NextResponse.json({ error: "Gagal memperbarui kredensial." }, { status: 500 });
  }
}
