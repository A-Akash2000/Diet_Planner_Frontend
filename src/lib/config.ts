type EnvConfig = Readonly<{
    Api_Url : string,
    excludedRoutes: string[],
    SECRET_KEY: string,
    // Mode : 'local'|'local'
}>;

console.log("Mode",import.meta.env.VITE_ENV)

export const ENV : EnvConfig = Object.freeze({
    Api_Url: "http://localhost:5555",
    excludedRoutes:['/auth/login', '/auth/register'],
    SECRET_KEY : import.meta.env.SECRET_KEY || 'MyWork@123@#'
    // Mode : import.meta.env.VITE_ENV
})