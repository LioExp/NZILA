import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    country: user.country,
    isAngolan: user.isAngolan,
    onboardingDone: user.onboardingDone,
    level: user.level,
  });
});

router.put("/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  const { country, isAngolan, onboardingDone } = req.body;

  const updates: Record<string, unknown> = {};
  if (country !== undefined) updates.country = country;
  if (isAngolan !== undefined) updates.isAngolan = isAngolan;
  if (onboardingDone !== undefined) updates.onboardingDone = onboardingDone;

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user.id))
    .returning();

  res.json({
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    profileImageUrl: updated.profileImageUrl,
    country: updated.country,
    isAngolan: updated.isAngolan,
    onboardingDone: updated.onboardingDone,
    level: updated.level,
  });
});

export default router;
