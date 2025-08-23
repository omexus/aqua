import { useState } from 'react';
import { UserProvision } from './UserProvision';
import { Stack, Text, Alert, Button } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

type GoogleProfile = {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
};

interface GoogleSignUpProps {
    onSuccess?: (userData: any) => void;
    onError?: (error: string) => void;
    onCancel?: () => void;
}

export function GoogleSignUp({ onSuccess, onError, onCancel }: GoogleSignUpProps) {
    const { user, googleLogin } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);



    const handleProvisionSuccess = (userData: any) => {
        console.log('GoogleSignUp: User provisioning successful:', userData);
        onSuccess?.(userData);
    };

    const handleProvisionCancel = () => {
        console.log('GoogleSignUp: User provisioning cancelled');
        setError(null);
        onCancel?.();
    };

    // If user has authenticated with Google but hasn't completed provisioning
    if (user && !isAuthenticating) {
        return (
            <Stack gap="md">
                <Alert color="blue" variant="light">
                    <Text size="sm" fw={500}>
                        ✅ Google Authentication Complete
                    </Text>
                    <Text size="xs" c="dimmed">
                        {(user?.userData?.name as string)} ({(user?.userData?.email as string)})
                    </Text>
                </Alert>

                <Text size="sm" c="dimmed" ta="center">
                    Please complete your profile to associate your account with a condo.
                </Text>

                <UserProvision
                    onSuccess={handleProvisionSuccess}
                    onCancel={handleProvisionCancel}
                />
            </Stack>
        );
    }

    // Show Google sign-in
    return (
        <Stack gap="md">
            {error && (
                <Alert color="red" variant="light">
                    {error}
                </Alert>
            )}

            <Text size="lg" fw={600} ta="center">
                🔐 Sign Up with Google
            </Text>

            <Text size="sm" c="dimmed" ta="center">
                Authenticate with your Google account to get started with HOA management.
            </Text>

            <Button
                onClick={() => {
                    console.log('GoogleSignUp: Starting Google OAuth flow');
                    googleLogin();
                }}
                loading={isAuthenticating}
                variant="filled"
                size="lg"
                fullWidth
            >
                🔐 Sign in with Google
            </Button>

            {onCancel && (
                <Button
                    variant="light"
                    onClick={onCancel}
                    size="sm"
                >
                    Cancel
                </Button>
            )}
        </Stack>
    );
}
