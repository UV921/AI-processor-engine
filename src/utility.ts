export function normalizeUrl(url: string) {
    const parsedUrl = new URL(url);

    parsedUrl.hash = "";

    if (parsedUrl.pathname !== "/") {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, "");
    }

    return parsedUrl.toString();
}

export function calculateGroundedness(claims,verifiedclaim){
    //total claim 
    clamims.map()
    
}