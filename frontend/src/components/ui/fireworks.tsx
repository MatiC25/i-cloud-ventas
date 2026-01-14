"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface FireworksProps {
    className?: string;
    population?: number;
    color?: string;
}

export const FireworksBackground = ({
    className,
    population = 40,
    color
}: FireworksProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current) {
                const parent = canvasRef.current.parentElement;
                if (parent) {
                    setDimensions({
                        width: parent.clientWidth,
                        height: parent.clientHeight
                    });
                    canvasRef.current.width = parent.clientWidth;
                    canvasRef.current.height = parent.clientHeight;
                }
            }
        };

        window.addEventListener("resize", updateDimensions);
        updateDimensions();

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let fireworks: Firework[] = [];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            alpha: number;
            color: string;

            constructor(x: number, y: number, color: string) {
                this.x = x;
                this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 3 + 1; // Speed
                this.vx = Math.cos(angle) * velocity;
                this.vy = Math.sin(angle) * velocity;
                this.alpha = 1;
                this.color = color;
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= 0.015; // Fade out speed
            }
        }

        class Firework {
            x: number;
            y: number;
            targetY: number;
            color: string;
            exploded: boolean;
            vy: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = canvas!.height;
                this.targetY = Math.random() * (canvas!.height * 0.5); // Explode in top half
                this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                this.exploded = false;
                this.vy = -Math.random() * 3 - 6; // Upward speed
            }

            draw() {
                if (!ctx || this.exploded) return;
                ctx.globalAlpha = 1;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, 3, 10);
            }

            update() {
                if (this.exploded) return;
                this.y += this.vy;
                if (this.y <= this.targetY || this.vy >= 0) {
                    this.exploded = true;
                    this.explode();
                }
                this.vy += 0.1; // Gravity
            }

            explode() {
                for (let i = 0; i < population; i++) {
                    particles.push(new Particle(this.x, this.y, this.color));
                }
            }
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            // Randomly create fireworks
            if (Math.random() < 0.03) { // Frequency
                fireworks.push(new Firework());
            }

            fireworks.forEach((fw, index) => {
                fw.update();
                fw.draw();
                if (fw.exploded && particles.length === 0) {
                    // Could remove firework here, simpler just to keep list clean
                }
            });

            // Cleanup exploded fireworks
            fireworks = fireworks.filter(fw => !fw.exploded);

            particles.forEach((p, index) => {
                p.update();
                p.draw();
                if (p.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [dimensions, population, theme]); // Re-run if dims change

    return (
        <canvas
            ref={canvasRef}
            className={cn("pointer-events-none absolute inset-0 z-0", className)}
        />
    );
};
