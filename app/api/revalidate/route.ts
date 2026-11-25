import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "../../../utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidateTag("portfolio-data", "max");
    revalidatePath("/", "layout");
    revalidatePath("/all-projects");
    revalidatePath("/all-certificates");

    return NextResponse.json({ revalidated: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
