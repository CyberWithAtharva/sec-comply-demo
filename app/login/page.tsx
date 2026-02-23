import { Metadata } from 'next';
import { LoginUX } from '@/components/auth/LoginUX';

export const metadata: Metadata = {
    title: 'Login - SecComply',
    description: 'Sign in to SecComply Intelligent Compliance Engine',
};

export default function LoginPage() {
    return <LoginUX />;
}
