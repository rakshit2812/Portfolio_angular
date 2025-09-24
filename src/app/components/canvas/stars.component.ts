import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stars-canvas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #starsCanvas 
            class="stars-canvas"
            [width]="canvasWidth"
            [height]="canvasHeight">
    </canvas>
  `,
  styles: [`
    .stars-canvas {
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
      background: transparent;
    }
  `]
})
export class StarsCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('starsCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private animationId!: number;
  private resizeTimeout!: number;

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  ngOnInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.initStars();
    this.animate();
    
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private initStars() {
    this.stars = [];
    const numStars = Math.floor((this.canvasWidth * this.canvasHeight) / 8000);
    
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    this.stars.forEach(star => {
      // Update twinkle effect
      star.twinkle += star.twinkleSpeed;
      const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
      
      // Draw star
      this.ctx.globalAlpha = twinkleOpacity;
      this.ctx.fillStyle = '#854CE6';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add glow effect for larger stars
      if (star.size > 1.5) {
        this.ctx.globalAlpha = twinkleOpacity * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Move star slowly
      star.y += star.speed;
      if (star.y > this.canvasHeight) {
        star.y = -10;
        star.x = Math.random() * this.canvasWidth;
      }
    });
    
    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private handleResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
      this.initStars();
    }, 100);
  }
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinkle: number;
}
