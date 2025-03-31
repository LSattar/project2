export const Capitalize = (text: string): string => {
    return text
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()); 
};