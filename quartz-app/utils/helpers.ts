export function buildEndpointURL(baseEndpoint: string, params?: Record<string, any>) {
    if (!params) return baseEndpoint;

    const stringParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
        stringParams[key] = String(value);
    }
    const searchParams = new URLSearchParams(stringParams);
    return `${baseEndpoint}${params ? `?${searchParams.toString()}` : ''}`;
}