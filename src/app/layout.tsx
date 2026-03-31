import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WB InCode Shop — Szablony Stron Internetowych",
  description:
    "Profesjonalne szablony stron internetowych gotowe do użycia. Kup, pobierz i uruchom swoją stronę w kilka minut.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#0a0a0a" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if(sessionStorage.getItem('splash_shown'))return;

                // Create splash screen entirely via JS to avoid hydration mismatch
                var splash=document.createElement('div');
                splash.id='splash-screen';
                splash.style.cssText='position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:#0a0a0a;transition:opacity 0.6s ease-in-out';

                // Keyframes
                var style=document.createElement('style');
                style.textContent='@keyframes ss{to{transform:rotate(360deg)}}@keyframes ssr{to{transform:rotate(-360deg)}}@keyframes sli{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}';
                document.head.appendChild(style);

                // Matrix canvas
                var canvas=document.createElement('canvas');
                canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%';
                splash.appendChild(canvas);

                // Center content
                var center=document.createElement('div');
                center.style.cssText='position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:2rem';

                // Ring container
                var ringBox=document.createElement('div');
                ringBox.style.cssText='position:relative;width:176px;height:176px;display:flex;align-items:center;justify-content:center';

                // Outer ring
                var ring1=document.createElement('div');
                ring1.style.cssText='position:absolute;inset:0;border-radius:50%;border:2px solid rgba(48,232,122,0.2);border-top-color:rgb(48,232,122);border-right-color:rgba(48,232,122,0.4);animation:ss 1.2s linear infinite';
                ringBox.appendChild(ring1);

                // Inner ring
                var ring2=document.createElement('div');
                ring2.style.cssText='position:absolute;inset:12px;border-radius:50%;border:1px solid rgba(48,232,122,0.1);border-bottom-color:rgba(48,232,122,0.3);animation:ssr 2s linear infinite';
                ringBox.appendChild(ring2);

                // Dark circle
                var circ=document.createElement('div');
                circ.style.cssText='position:absolute;inset:20px;border-radius:50%;background:rgba(10,10,10,0.8);box-shadow:0 0 40px rgba(48,232,122,0.15)';
                ringBox.appendChild(circ);

                // Logo
                var logo=document.createElement('img');
                logo.src='/logo/WB InCode.png';
                logo.alt='WB InCode';
                logo.width=80;logo.height=80;
                logo.style.cssText='position:relative;z-index:10;object-fit:contain;filter:drop-shadow(0 0 15px rgba(48,232,122,0.4));animation:sli 0.5s ease-out 0.2s both';
                ringBox.appendChild(logo);
                center.appendChild(ringBox);

                // Status text
                var status=document.createElement('p');
                status.id='splash-status';
                status.style.cssText='color:rgba(48,232,122,0.8);font-size:12px;font-family:monospace;letter-spacing:0.2em;text-transform:uppercase';
                status.textContent='INICJALIZACJA SYSTEMU...';
                center.appendChild(status);

                // Progress bar
                var progWrap=document.createElement('div');
                progWrap.style.cssText='width:208px;height:4px;background:rgba(255,255,255,0.05);border-radius:9999px;overflow:hidden';
                var progBar=document.createElement('div');
                progBar.id='splash-progress';
                progBar.style.cssText='height:100%;width:0%;background:linear-gradient(to right,#30e87a,#34d399);border-radius:9999px;box-shadow:0 0 8px rgba(48,232,122,0.5);transition:width 0.1s linear';
                progWrap.appendChild(progBar);
                center.appendChild(progWrap);

                splash.appendChild(center);
                document.body.prepend(splash);

                // Matrix animation
                var ctx=canvas.getContext('2d');
                canvas.width=window.innerWidth;
                canvas.height=window.innerHeight;
                var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*アイウエオカキクケコ";
                var fs=14,cols=Math.floor(canvas.width/fs);
                var drops=[];for(var i=0;i<cols;i++)drops[i]=Math.floor(Math.random()*-20);
                var matrixInt=setInterval(function(){
                  ctx.fillStyle='rgba(10,10,10,0.12)';
                  ctx.fillRect(0,0,canvas.width,canvas.height);
                  for(var i=0;i<drops.length;i++){
                    var c=chars[Math.floor(Math.random()*chars.length)];
                    var x=i*fs,y=drops[i]*fs;
                    ctx.fillStyle=Math.random()>0.5?'rgba(48,232,122,0.9)':'rgba(48,232,122,0.35)';
                    ctx.font=(Math.random()>0.5?'bold ':'')+fs+'px monospace';
                    ctx.fillText(c,x,y);
                    if(y>canvas.height&&Math.random()>0.96)drops[i]=0;
                    drops[i]+=Math.random()>0.5?2:3;
                  }
                },30);

                // Status & progress
                var msgs=["INICJALIZACJA SYSTEMU...","ŁADOWANIE MODUŁÓW...","KONFIGURACJA VIBE-CODERA...","URUCHAMIANIE ŚRODOWISKA...","KOMPILACJA INTERFEJSU...","SYNCHRONIZACJA DANYCH...","ŁĄCZENIE Z SERWEREM...","WERYFIKACJA ZABEZPIECZEŃ..."];
                var prog=0;
                var progInt=setInterval(function(){prog+=Math.random()*8+3;if(prog>95)prog=95;progBar.style.width=prog+'%';},80);
                var statInt=setInterval(function(){status.textContent=msgs[Math.floor(Math.random()*msgs.length)];},350);

                setTimeout(function(){
                  clearInterval(progInt);clearInterval(statInt);
                  progBar.style.width='100%';status.textContent='SYSTEM GOTOWY';
                  setTimeout(function(){
                    clearInterval(matrixInt);
                    splash.style.opacity='0';
                    setTimeout(function(){splash.remove();sessionStorage.setItem('splash_shown','1');},600);
                  },400);
                },2500);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
