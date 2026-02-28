import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCredentials } from "@/lib/aws/scanner";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { org_id, account_id, account_alias, access_key_id, secret_access_key, regions } = body;

        if (!org_id || !account_id || !access_key_id || !secret_access_key) {
            return NextResponse.json({ error: "Missing required fields: org_id, account_id, access_key_id, secret_access_key" }, { status: 400 });
        }

        // Verify credentials work via GetCallerIdentity
        await verifyCredentials(access_key_id, secret_access_key);

        // Store access key in role_arn column and secret in external_id column.
        // The scanner detects AKIA/ASIA prefix to distinguish from role ARNs.
        const { data, error } = await supabase
            .from("aws_accounts")
            .insert({
                org_id,
                account_id,
                account_alias: account_alias ?? null,
                role_arn: access_key_id,
                external_id: secret_access_key,
                regions: regions ?? ["us-east-1"],
                status: "active",
            })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ account: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
