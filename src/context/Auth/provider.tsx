import { useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "./context";
import Login from "./pages/Login/Login";

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider(props : any) {
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(window.localStorage.getItem('access_token'));
    const [user, setUser] = useState<any>(undefined);
    const [authError, setAuthError] = useState<string | undefined>('Message');

    const getLocalUser = useCallback(async (token : string) => {
        const user = await fetch(import.meta.env.VITE_API + '/user/me', {
            headers: {
                'authorization' : 'Bearer ' + token
            },
            
        }).then(async (res) => {
            if (res.status === 200) return res.json();
            else {
                const {message} = await res.json();
                setAuthError(message);
            }
            return undefined;
        });
        if (user) setUser(user);
    }, []);

    const createSession = useCallback(async (username : string) => {
        const validUsername = /^[a-zA-Z0-9\-_]{3,40}$/.test(username);
        if (!validUsername) {
            setAuthError('The username should be between 3 and fourty characters length, alphanumerical, underscore and hyphen only.');
            return;
        }

        setLoading(true);
        try {
            const { accessToken : token } = await fetch(import.meta.env.VITE_API + '/user', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username
                })
            }).then(res => res.json());
            setAccessToken(token);
            window.localStorage.setItem('access_token', token);
            await getLocalUser(token);
        } catch (e : any) {
            console.log(e);
            setAuthError(e?.message ?? 'api error');
        }
        setLoading(false);
    }, []);

    const context = {
        loading,
        user,
        accessToken,
        setUser,
        setAccessToken,
        setLoading,
        createSession,
        authError
    };

    useEffect(() => {
        if (!user && !initialized) {
            if (!accessToken) {
                setInitialized(true);
            } else {
               const getUser = async () => {
                await getLocalUser(accessToken);
                setInitialized(true);
               }
               getUser();
            }
        }
    }, [accessToken, user, loading, initialized])

    if (!initialized) {
        return <>Loading...</>;
    }

    if (!user) {
        return (<AuthContext.Provider value={context}>
            <Login/>
        </AuthContext.Provider>);
    }

    return (
        <AuthContext.Provider value={context}>
            {props.children}
        </AuthContext.Provider>
    );
}