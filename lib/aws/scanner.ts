import { STSClient, AssumeRoleCommand, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand, DescribeVpcsCommand } from "@aws-sdk/client-ec2";
import { S3Client, ListBucketsCommand, GetPublicAccessBlockCommand, GetBucketEncryptionCommand, GetBucketLoggingCommand } from "@aws-sdk/client-s3";
import { IAMClient, ListUsersCommand, ListAccessKeysCommand, GetLoginProfileCommand, ListMFADevicesCommand, GetAccountPasswordPolicyCommand, ListAttachedUserPoliciesCommand, ListGroupsForUserCommand, GetAccountSummaryCommand } from "@aws-sdk/client-iam";
import { CloudTrailClient, DescribeTrailsCommand, GetTrailStatusCommand } from "@aws-sdk/client-cloudtrail";
import { SecurityHubClient, GetFindingsCommand } from "@aws-sdk/client-securityhub";
import { NodeHttpHandler } from "@smithy/node-http-handler";

// 15 s per-request timeout so a stuck AWS API call never hangs the scan indefinitely
const requestHandler = new NodeHttpHandler({ connectionTimeout: 5_000, requestTimeout: 15_000 });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanResult {
    assets: AssetResult[];
    findings: FindingResult[];
}

export interface AssetResult {
    name: string;
    type: string;
    external_id: string;
    region: string | null;
    metadata: Record<string, unknown>;
}

export interface FindingResult {
    rule_id: string;
    title: string;
    resource_arn: string | null;
    resource_type: string | null;
    resource_id: string | null;
    severity: string;
    status: string;
    details: Record<string, unknown>;
}

// ─── Assume Role ──────────────────────────────────────────────────────────────

export async function assumeRole(roleArn: string, externalId: string) {
    const sts = new STSClient({ region: "us-east-1", requestHandler });
    const result = await sts.send(new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: "SecComplyAuditSession",
        ExternalId: externalId,
        DurationSeconds: 3600,
    }));

    if (!result.Credentials) throw new Error("STS did not return credentials");

    return {
        accessKeyId: result.Credentials.AccessKeyId!,
        secretAccessKey: result.Credentials.SecretAccessKey!,
        sessionToken: result.Credentials.SessionToken!,
    };
}

// ─── Resolve credentials (direct access key OR cross-account role) ────────────

type AwsCredentials = { accessKeyId: string; secretAccessKey: string; sessionToken?: string };

async function resolveCredentials(roleArnOrKey: string, externalIdOrSecret: string): Promise<AwsCredentials> {
    // Access key IDs always start with AKIA (long-term) or ASIA (temporary)
    // Role ARNs always start with "arn:"
    if (roleArnOrKey.startsWith("AKIA") || roleArnOrKey.startsWith("ASIA")) {
        return { accessKeyId: roleArnOrKey, secretAccessKey: externalIdOrSecret };
    }
    return assumeRole(roleArnOrKey, externalIdOrSecret);
}

// ─── Verify Connection ────────────────────────────────────────────────────────

export async function verifyCredentials(
    roleArnOrKey: string,
    externalIdOrSecret: string
): Promise<{ accountId: string }> {
    const sts = new STSClient({ region: "us-east-1", requestHandler });

    if (roleArnOrKey.startsWith("AKIA") || roleArnOrKey.startsWith("ASIA")) {
        // Direct key — call GetCallerIdentity to verify
        const directSts = new STSClient({
            region: "us-east-1",
            credentials: { accessKeyId: roleArnOrKey, secretAccessKey: externalIdOrSecret },
            requestHandler,
        });
        const result = await directSts.send(new GetCallerIdentityCommand({}));
        const accountId = result.Account ?? "";
        if (!accountId) throw new Error("Could not verify credentials");
        return { accountId };
    }

    // Cross-account role assumption
    const result = await sts.send(new AssumeRoleCommand({
        RoleArn: roleArnOrKey,
        RoleSessionName: "SecComplyVerifySession",
        ExternalId: externalIdOrSecret,
        DurationSeconds: 900,
    }));
    if (!result.AssumedRoleUser) throw new Error("Could not assume role");
    const accountId = result.AssumedRoleUser.Arn?.split(":")[4] ?? "";
    return { accountId };
}

// Keep the old export name as an alias for backward compatibility
export const verifyRoleArn = verifyCredentials;

// ─── ISO 27001 control mapping for rule IDs ────────────────────────────────────

const ISO_MAPPING: Record<string, string> = {
    "IAM-001": "A.9.4.2",   // Secure log-on procedures
    "IAM-002": "A.9.2.6",   // Removal of access rights
    "IAM-003": "A.9.4.3",   // Password management
    "IAM-004": "A.9.2.3",   // Privileged access management
    "IAM-005": "A.9.4.2",   // MFA on root account
    "S3-001":  "A.13.1.3",  // Segregation in networks
    "S3-002":  "A.10.1.1",  // Encryption at rest
    "S3-003":  "A.12.4.1",  // Event logging
    "EC2-001": "A.13.1.3",  // Network controls
    "EC2-002": "A.13.1.2",  // Security groups - unrestricted SSH
    "EC2-003": "A.13.1.2",  // Security groups - unrestricted RDP
    "VPC-001": "A.13.1.1",  // Default VPC in use
    "CT-001":  "A.12.4.1",  // Audit logging - CloudTrail not enabled
    "CT-002":  "A.12.4.1",  // CloudTrail log validation
};

// ─── Full Scan ────────────────────────────────────────────────────────────────

export async function runFullScan(roleArnOrKey: string, externalIdOrSecret: string, regions: string[]): Promise<ScanResult> {
    const creds = await resolveCredentials(roleArnOrKey, externalIdOrSecret);
    const assets: AssetResult[] = [];
    const findings: FindingResult[] = [];

    const primaryRegion = regions[0] ?? "us-east-1";

    const flag = (f: FindingResult) => findings.push({
        ...f,
        details: { ...f.details, iso_27001: ISO_MAPPING[f.rule_id] ?? null },
    });

    // ── IAM Scan ──────────────────────────────────────────────────────────────
    try {
        const iam = new IAMClient({ region: "us-east-1", credentials: creds, requestHandler });

        // Root account MFA check
        try {
            const summary = await iam.send(new GetAccountSummaryCommand({}));
            const map = summary.SummaryMap ?? {};
            if (!map["AccountMFAEnabled"]) {
                flag({
                    rule_id: "IAM-005",
                    title: "Root account does not have MFA enabled",
                    resource_arn: null,
                    resource_type: "AWS::IAM::Root",
                    resource_id: "root",
                    severity: "critical",
                    status: "ACTIVE",
                    details: { recommendation: "Enable MFA on the AWS root account immediately" },
                });
            }
        } catch { /* skip */ }

        // Password policy check
        try {
            await iam.send(new GetAccountPasswordPolicyCommand({}));
        } catch (e: unknown) {
            // If NoSuchEntityException, no password policy exists
            if (e instanceof Error && e.name === "NoSuchEntityException") {
                flag({
                    rule_id: "IAM-003",
                    title: "No IAM account password policy is configured",
                    resource_arn: null,
                    resource_type: "AWS::IAM::PasswordPolicy",
                    resource_id: "password-policy",
                    severity: "medium",
                    status: "ACTIVE",
                    details: { recommendation: "Set a password policy requiring minimum length, complexity, and rotation" },
                });
            }
        }

        // Per-user checks
        const usersRes = await iam.send(new ListUsersCommand({ MaxItems: 100 }));
        const users = usersRes.Users ?? [];

        for (const user of users) {
            assets.push({
                name: `IAM User: ${user.UserName}`,
                type: "iam-user",
                external_id: user.UserId ?? user.UserName ?? "",
                region: null,
                metadata: { arn: user.Arn, created: user.CreateDate?.toISOString() },
            });

            // Console access + MFA check
            try {
                await iam.send(new GetLoginProfileCommand({ UserName: user.UserName }));
                const mfaRes = await iam.send(new ListMFADevicesCommand({ UserName: user.UserName }));
                if ((mfaRes.MFADevices ?? []).length === 0) {
                    flag({
                        rule_id: "IAM-001",
                        title: `IAM user ${user.UserName} has console access without MFA`,
                        resource_arn: user.Arn ?? null,
                        resource_type: "AWS::IAM::User",
                        resource_id: user.UserName ?? null,
                        severity: "high",
                        status: "ACTIVE",
                        details: { username: user.UserName, recommendation: "Enable MFA for all console users" },
                    });
                }
            } catch { /* no console access */ }

            // Access key age check
            try {
                const keysRes = await iam.send(new ListAccessKeysCommand({ UserName: user.UserName }));
                for (const key of keysRes.AccessKeyMetadata ?? []) {
                    if (key.CreateDate) {
                        const ageDays = (Date.now() - key.CreateDate.getTime()) / 86400000;
                        if (ageDays > 90) {
                            flag({
                                rule_id: "IAM-002",
                                title: `Access key for ${user.UserName} is ${Math.round(ageDays)} days old (>90 days)`,
                                resource_arn: user.Arn ?? null,
                                resource_type: "AWS::IAM::AccessKey",
                                resource_id: key.AccessKeyId ?? null,
                                severity: ageDays > 180 ? "high" : "medium",
                                status: "ACTIVE",
                                details: { username: user.UserName, age_days: Math.round(ageDays), key_id: key.AccessKeyId },
                            });
                        }
                    }
                }
            } catch { /* skip */ }

            // Direct admin policy check
            try {
                const policiesRes = await iam.send(new ListAttachedUserPoliciesCommand({ UserName: user.UserName }));
                const adminPolicies = (policiesRes.AttachedPolicies ?? []).filter(p =>
                    p.PolicyName === "AdministratorAccess" || p.PolicyArn?.includes("AdministratorAccess")
                );
                if (adminPolicies.length > 0) {
                    flag({
                        rule_id: "IAM-004",
                        title: `IAM user ${user.UserName} has AdministratorAccess policy attached directly`,
                        resource_arn: user.Arn ?? null,
                        resource_type: "AWS::IAM::User",
                        resource_id: user.UserName ?? null,
                        severity: "high",
                        status: "ACTIVE",
                        details: { username: user.UserName, recommendation: "Use IAM roles and groups instead of direct admin policies" },
                    });
                }
            } catch { /* skip */ }
        }
    } catch (e) {
        console.error("IAM scan failed:", e);
    }

    // ── CloudTrail Scan ───────────────────────────────────────────────────────
    try {
        const ct = new CloudTrailClient({ region: primaryRegion, credentials: creds, requestHandler });
        const trailsRes = await ct.send(new DescribeTrailsCommand({ includeShadowTrails: false }));
        const trails = trailsRes.trailList ?? [];

        if (trails.length === 0) {
            flag({
                rule_id: "CT-001",
                title: "No CloudTrail trails configured in this region",
                resource_arn: null,
                resource_type: "AWS::CloudTrail::Trail",
                resource_id: primaryRegion,
                severity: "high",
                status: "ACTIVE",
                details: { region: primaryRegion, recommendation: "Enable CloudTrail to audit all API activity" },
            });
        } else {
            for (const trail of trails) {
                if (!trail.LogFileValidationEnabled) {
                    flag({
                        rule_id: "CT-002",
                        title: `CloudTrail trail ${trail.Name} does not have log file validation enabled`,
                        resource_arn: trail.TrailARN ?? null,
                        resource_type: "AWS::CloudTrail::Trail",
                        resource_id: trail.Name ?? null,
                        severity: "medium",
                        status: "ACTIVE",
                        details: { trail: trail.Name, recommendation: "Enable log file validation to detect tampering" },
                    });
                }
                // Check if trail is actually logging
                try {
                    const status = await ct.send(new GetTrailStatusCommand({ Name: trail.TrailARN ?? trail.Name ?? "" }));
                    if (!status.IsLogging) {
                        flag({
                            rule_id: "CT-001",
                            title: `CloudTrail trail ${trail.Name} exists but is not actively logging`,
                            resource_arn: trail.TrailARN ?? null,
                            resource_type: "AWS::CloudTrail::Trail",
                            resource_id: trail.Name ?? null,
                            severity: "high",
                            status: "ACTIVE",
                            details: { trail: trail.Name, recommendation: "Start CloudTrail logging immediately" },
                        });
                    }
                } catch { /* skip */ }
            }
        }
    } catch (e) {
        console.error("CloudTrail scan failed:", e);
    }

    // ── EC2 + Security Groups + VPC (per region) ──────────────────────────────
    for (const region of regions) {
        try {
            const ec2 = new EC2Client({ region, credentials: creds, requestHandler });

            // Instances
            const instancesRes = await ec2.send(new DescribeInstancesCommand({ MaxResults: 100 }));
            for (const reservation of instancesRes.Reservations ?? []) {
                for (const instance of reservation.Instances ?? []) {
                    const name = instance.Tags?.find(t => t.Key === "Name")?.Value ?? instance.InstanceId ?? "Unknown";
                    assets.push({
                        name,
                        type: "ec2",
                        external_id: instance.InstanceId ?? "",
                        region,
                        metadata: { instance_type: instance.InstanceType, state: instance.State?.Name, public_ip: instance.PublicIpAddress, ami_id: instance.ImageId },
                    });
                    if (instance.PublicIpAddress) {
                        flag({
                            rule_id: "EC2-001",
                            title: `EC2 instance ${name} has a public IP address`,
                            resource_arn: `arn:aws:ec2:${region}::instance/${instance.InstanceId}`,
                            resource_type: "AWS::EC2::Instance",
                            resource_id: instance.InstanceId ?? null,
                            severity: "low",
                            status: "ACTIVE",
                            details: { public_ip: instance.PublicIpAddress, region, recommendation: "Use NAT gateway or load balancer instead of direct public IPs" },
                        });
                    }
                }
            }

            // Security Groups — overly permissive rules
            const sgRes = await ec2.send(new DescribeSecurityGroupsCommand({ MaxResults: 100 }));
            for (const sg of sgRes.SecurityGroups ?? []) {
                for (const perm of sg.IpPermissions ?? []) {
                    const openToWorld = perm.IpRanges?.some(r => r.CidrIp === "0.0.0.0/0") ||
                        perm.Ipv6Ranges?.some(r => r.CidrIpv6 === "::/0");
                    if (!openToWorld) continue;

                    if (perm.FromPort === 22 || perm.ToPort === 22) {
                        flag({
                            rule_id: "EC2-002",
                            title: `Security group ${sg.GroupName} allows SSH (port 22) from 0.0.0.0/0`,
                            resource_arn: `arn:aws:ec2:${region}::security-group/${sg.GroupId}`,
                            resource_type: "AWS::EC2::SecurityGroup",
                            resource_id: sg.GroupId ?? null,
                            severity: "high",
                            status: "ACTIVE",
                            details: { group: sg.GroupName, region, recommendation: "Restrict SSH access to known IP ranges or use AWS Systems Manager Session Manager" },
                        });
                    }
                    if (perm.FromPort === 3389 || perm.ToPort === 3389) {
                        flag({
                            rule_id: "EC2-003",
                            title: `Security group ${sg.GroupName} allows RDP (port 3389) from 0.0.0.0/0`,
                            resource_arn: `arn:aws:ec2:${region}::security-group/${sg.GroupId}`,
                            resource_type: "AWS::EC2::SecurityGroup",
                            resource_id: sg.GroupId ?? null,
                            severity: "high",
                            status: "ACTIVE",
                            details: { group: sg.GroupName, region, recommendation: "Restrict RDP access to known IP ranges only" },
                        });
                    }
                }
            }

            // Default VPC check
            const vpcsRes = await ec2.send(new DescribeVpcsCommand({ Filters: [{ Name: "isDefault", Values: ["true"] }] }));
            if ((vpcsRes.Vpcs ?? []).length > 0) {
                flag({
                    rule_id: "VPC-001",
                    title: `Default VPC exists in region ${region}`,
                    resource_arn: null,
                    resource_type: "AWS::EC2::VPC",
                    resource_id: vpcsRes.Vpcs![0].VpcId ?? null,
                    severity: "low",
                    status: "ACTIVE",
                    details: { region, recommendation: "Delete the default VPC and use custom VPCs with proper segmentation" },
                });
            }
        } catch (e) {
            console.error(`EC2/VPC scan failed for region ${region}:`, e);
        }
    }

    // ── S3 Scan ───────────────────────────────────────────────────────────────
    try {
        const s3 = new S3Client({ region: primaryRegion, credentials: creds, requestHandler });
        const bucketsRes = await s3.send(new ListBucketsCommand({}));

        for (const bucket of bucketsRes.Buckets ?? []) {
            if (!bucket.Name) continue;
            assets.push({
                name: bucket.Name,
                type: "s3",
                external_id: `arn:aws:s3:::${bucket.Name}`,
                region: null,
                metadata: { created: bucket.CreationDate?.toISOString() },
            });

            // Public access block
            try {
                const pab = await s3.send(new GetPublicAccessBlockCommand({ Bucket: bucket.Name }));
                const cfg = pab.PublicAccessBlockConfiguration;
                if (!cfg?.BlockPublicAcls || !cfg?.BlockPublicPolicy || !cfg?.IgnorePublicAcls || !cfg?.RestrictPublicBuckets) {
                    flag({
                        rule_id: "S3-001",
                        title: `S3 bucket ${bucket.Name} does not have all public access blocks enabled`,
                        resource_arn: `arn:aws:s3:::${bucket.Name}`,
                        resource_type: "AWS::S3::Bucket",
                        resource_id: bucket.Name,
                        severity: "high",
                        status: "ACTIVE",
                        details: { bucket: bucket.Name, block_public_acls: cfg?.BlockPublicAcls, block_public_policy: cfg?.BlockPublicPolicy },
                    });
                }
            } catch { /* bucket may not support */ }

            // Encryption check
            try {
                await s3.send(new GetBucketEncryptionCommand({ Bucket: bucket.Name }));
            } catch (e: unknown) {
                if (e instanceof Error && (e.name === "ServerSideEncryptionConfigurationNotFoundError" || e.message.includes("encryption"))) {
                    flag({
                        rule_id: "S3-002",
                        title: `S3 bucket ${bucket.Name} does not have server-side encryption enabled`,
                        resource_arn: `arn:aws:s3:::${bucket.Name}`,
                        resource_type: "AWS::S3::Bucket",
                        resource_id: bucket.Name,
                        severity: "medium",
                        status: "ACTIVE",
                        details: { bucket: bucket.Name, recommendation: "Enable AES-256 or AWS KMS encryption on all S3 buckets" },
                    });
                }
            }

            // Access logging check
            try {
                const logging = await s3.send(new GetBucketLoggingCommand({ Bucket: bucket.Name }));
                if (!logging.LoggingEnabled) {
                    flag({
                        rule_id: "S3-003",
                        title: `S3 bucket ${bucket.Name} does not have access logging enabled`,
                        resource_arn: `arn:aws:s3:::${bucket.Name}`,
                        resource_type: "AWS::S3::Bucket",
                        resource_id: bucket.Name,
                        severity: "low",
                        status: "ACTIVE",
                        details: { bucket: bucket.Name, recommendation: "Enable S3 server access logging for audit trail purposes" },
                    });
                }
            } catch { /* skip */ }
        }
    } catch (e) {
        console.error("S3 scan failed:", e);
    }

    // ── SecurityHub (pull if enabled) ─────────────────────────────────────────
    try {
        const sh = new SecurityHubClient({ region: primaryRegion, credentials: creds, requestHandler });
        const shRes = await sh.send(new GetFindingsCommand({
            Filters: { RecordState: [{ Value: "ACTIVE", Comparison: "EQUALS" }] },
            MaxResults: 100,
        }));
        for (const f of shRes.Findings ?? []) {
            findings.push({
                rule_id: `SH-${f.GeneratorId ?? "UNKNOWN"}`,
                title: f.Title ?? "Security Hub Finding",
                resource_arn: f.Resources?.[0]?.Id ?? null,
                resource_type: f.Resources?.[0]?.Type ?? null,
                resource_id: f.Resources?.[0]?.Id?.split("/").pop() ?? null,
                severity: f.Severity?.Label ?? "MEDIUM",
                status: f.RecordState === "ACTIVE" ? "ACTIVE" : "RESOLVED",
                details: { description: f.Description, remediation: f.Remediation?.Recommendation?.Text },
            });
        }
    } catch { /* SecurityHub not enabled — skip */ }

    return { assets, findings };
}
