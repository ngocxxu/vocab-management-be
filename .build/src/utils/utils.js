import { Error } from 'mongoose';
export const handleError = (err, res, status = 500) => {
    if (err instanceof Error) {
        console.log(err.message);
        res.status(status).json({ error: err.message });
    }
};
export const searchRegex = (search) => ({
    $regex: `.*${escapeRegex(search)}.*`,
    $options: 'i',
});
function escapeRegex(text) {
    // Các ký tự regex đặc biệt của tiếng Việt và tiếng Hàn
    const specialChars = /[.*+?^${}()|[\]\\]/g;
    return text.replace(specialChars, '\\$&');
}
export function getRandomElements(array, count, targetId) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    const target = shuffled.find((item) => item.equals(targetId));
    const others = shuffled
        .filter((item) => !item.equals(targetId))
        .slice(0, count - 1);
    return [...others, target];
}
export function safeSerialize(data) {
    try {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            // Remove function and symbol
            if (typeof value === 'function' || typeof value === 'symbol') {
                return undefined;
            }
            // Convert ObjectId to string
            if (value && value.$oid) {
                return value.$oid;
            }
            return value;
        }));
    }
    catch (error) {
        console.error('Serialization error', error);
        throw error;
    }
}
