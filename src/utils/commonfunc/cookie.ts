export const setCookie = (name: string, value: string, days: number): void => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export const getCookie = (name: string): string | null => {
    const rawCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${encodeURIComponent(name)}=`));

    if (typeof rawCookie === 'string') {
        const parts = rawCookie.split('=');
        if (parts.length >= 2) {
            return decodeURIComponent(parts.slice(1).join('='));
        }
    }

    return null;
};

export const deleteCookie = (name: string): void => {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
};  