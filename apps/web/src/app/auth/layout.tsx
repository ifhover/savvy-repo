import Image from "next/image";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full  min-h-[100vh] flex justify-center items-center bg-gray-200">
      <div className="w-[750px] rounded-2xl bg-white shadow-xl grid grid-cols-[5fr_6fr]">
        <div className="relative h-full rounded-2xl">
          <Image
            className="rounded-l-2xl"
            src="/assets/image/login.jpg"
            alt="login"
            sizes="400px"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "bottom" }}
          />
        </div>
        <div className="px-11 pt-15 pb-17 relative">
          {children}
          <div className="absolute bottom-3 text-sm text-center text-gray-400 w-full left-0">
            @Flow site
          </div>
        </div>
      </div>
    </div>
  );
}
