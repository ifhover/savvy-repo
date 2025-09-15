export const success = (data: any = null, message: string = ""): Response => {
  return new Response(
    JSON.stringify({
      status: 0,
      message,
      data,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
