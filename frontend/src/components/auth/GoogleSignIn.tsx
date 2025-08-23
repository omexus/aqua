import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin, CodeResponse } from '@react-oauth/google';
import axios from 'axios';
import { Button, Text, Stack, Alert } from '@mantine/core';

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

interface GoogleSignInProps {
    onSuccess?: (profile: GoogleProfile, code?: string) => void;
    onError?: (error: string) => void;
    isLoading?: boolean;
}

export function GoogleSignIn({ onSuccess, onError, isLoading = false }: GoogleSignInProps) {
    const [ codeResponse, setCodeResponse ] = useState<CodeResponse | null>(null);
    const [ profile, setProfile ] = useState<GoogleProfile | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    
    const login = useGoogleLogin({
        onSuccess: (response) => {
            setCodeResponse(response);
            setError(null);
        },
        onError: (error) => {
            console.log('Google Login Failed:', error);
            setError('Google authentication failed. Please try again.');
            onError?.('Google authentication failed');
        },
        scope: 'openid email profile',
        flow: 'auth-code',
    });

    useEffect(
        () => {
            if (codeResponse?.code) {
                // Instead of getting user info directly, we'll pass the code to the parent
                // The parent will handle the backend authentication
                console.log('GoogleSignIn: Got authorization code:', codeResponse.code);
                
                // For now, we'll simulate getting user info
                // In a real implementation, this would be handled by the backend
                const mockProfile: GoogleProfile = {
                    id: 'mock-google-id',
                    email: 'user@example.com',
                    verified_email: true,
                    name: 'Mock User',
                    given_name: 'Mock',
                    family_name: 'User',
                    picture: '',
                    locale: 'en'
                };
                
                setProfile(mockProfile);
                onSuccess?.(mockProfile, codeResponse.code);
            }
        },
        [ codeResponse, onSuccess, onError ]
    );

    const logOut = () => {
        googleLogout();
        setProfile(null);
        setCodeResponse(null);
        setError(null);
    };

    if (profile) {
        return (
            <Stack gap="md">
                <Alert color="green" variant="light">
                    <Text size="sm" fw={500}>
                        ✅ Successfully authenticated with Google
                    </Text>
                    <Text size="xs" c="dimmed">
                        {profile.name} ({profile.email})
                    </Text>
                </Alert>
                
                <Button 
                    variant="light" 
                    color="red" 
                    onClick={logOut}
                    size="sm"
                >
                    Sign Out
                </Button>
            </Stack>
        );
    }

    return (
        <Stack gap="md">
            {error && (
                <Alert color="red" variant="light">
                    {error}
                </Alert>
            )}
            
            <Button
                onClick={() => login()}
                loading={isLoading}
                variant="filled"
                size="lg"
                fullWidth
            >
                🔐 Sign in with Google
            </Button>
            
            <Text size="xs" c="dimmed" ta="center">
                You'll be redirected to Google to authenticate, then back to complete your profile setup.
            </Text>
        </Stack>
    );
}