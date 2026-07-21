export function normalizeUrl(url: string) {
    const parsedUrl = new URL(url);

    parsedUrl.hash = "";

    if (parsedUrl.pathname !== "/") {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, "");
    }

    return parsedUrl.toString();
}