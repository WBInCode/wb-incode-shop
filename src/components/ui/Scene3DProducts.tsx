"use client";

export default function Scene3DProducts() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Animated gradient mesh — Stripe/Linear style */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute w-[600px] h-[600px] -top-[200px] -right-[100px] animate-blob"
          style={{
            background: "linear-gradient(135deg, #30e87a 0%, #0f7a44 50%, transparent 100%)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] -bottom-[150px] -left-[100px] animate-blob-reverse"
          style={{
            background: "linear-gradient(225deg, #0f7a44 0%, #30e87a20 60%, transparent 100%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] top-[40%] left-[50%] animate-blob-slow"
          style={{
            background: "radial-gradient(circle, #30e87a15 0%, transparent 70%)",
            borderRadius: "50% 50% 50% 50%",
            filter: "blur(60px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle 1px at center, #ffffff 0%, transparent 100%)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
}
