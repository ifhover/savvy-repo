export const success = (data, message = "") => {
    return new Response(JSON.stringify({
        status: 0,
        message,
        data,
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};
