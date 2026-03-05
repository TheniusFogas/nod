import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path') || '/';

    try {
        revalidatePath(path, 'layout');
        return NextResponse.json({ revalidated: true, path, message: "Cache purged successfully.", now: Date.now() });
    } catch (err: any) {
        return NextResponse.json({ revalidated: false, message: err.message }, { status: 500 });
    }
}
