import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-honeycomb',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas class="honeycomb-canvas"></canvas>`,
  styles: [`
    :host {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    .honeycomb-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class HoneycombComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private hexes: any[] = [];
  private animId!: number;
  private flickerInterval!: any;
  private resizeObserver!: ResizeObserver;

  private readonly HEX_SIZE = 28;
  private readonly GAP = 4;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.documentElement);

    this.resize();
    this.seed();
    this.flickerInterval = setInterval(() => this.randomFlicker(), 50);
    this.loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    clearInterval(this.flickerInterval);
    this.resizeObserver?.disconnect();
  }

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.buildGrid();
  }

  private hexCorners(cx: number, cy: number, size: number): [number, number][] {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
    }
    return pts;
  }

  private buildGrid() {
    this.hexes = [];
    const W = window.innerWidth;
    const H = window.innerHeight;
    const w = Math.sqrt(3) * (this.HEX_SIZE + this.GAP);
    const rows = Math.ceil(H / (this.HEX_SIZE * 1.5)) + 3;
    const cols = Math.ceil(W / w) + 3;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offset = row % 2 === 0 ? 0 : w / 2;
        const cx = col * w + offset;
        const cy = row * (this.HEX_SIZE * 1.5 + this.GAP);
        this.hexes.push({
          cx, cy,
          alpha: 0,
          target: 0,
          timer: Math.random() * 300,
          delay: Math.random() * 600,
          speed: 0.006 + Math.random() * 0.012,
          peakAlpha: 0.06 + Math.random() * 0.2,
        });
      }
    }
  }

  private seed() {
    const count = Math.floor(this.hexes.length * 0.05);
    for (let i = 0; i < count; i++) {
      const h = this.hexes[Math.floor(Math.random() * this.hexes.length)];
      h.target = h.peakAlpha;
      h.delay = Math.random() * 60;
    }
  }

  private randomFlicker() {
    const count = Math.max(1, Math.floor(this.hexes.length * 0.005));
    for (let i = 0; i < count; i++) {
      const h = this.hexes[Math.floor(Math.random() * this.hexes.length)];
      if (h.target === 0) {
        h.target = h.peakAlpha;
        h.delay = 0;
      }
    }
  }

  private update() {
    for (const h of this.hexes) {
      if (h.delay > 0) { h.delay--; continue; }
      if (h.alpha < h.target) {
        h.alpha = Math.min(h.target, h.alpha + h.speed);
      } else if (h.alpha > h.target) {
        h.alpha = Math.max(h.target, h.alpha - h.speed * 0.5);
        if (h.alpha <= 0.005) {
          h.alpha = 0;
          h.target = 0;
          h.delay = 200 + Math.random() * 800;
        }
      } else if (h.target > 0) {
        h.timer--;
        if (h.timer <= 0) {
          h.target = 0;
          h.timer = Math.random() * 200;
        }
      }
    }
  }

  private drawHex(h: any) {
    if (h.alpha < 0.003) return;
    const pts = this.hexCorners(h.cx, h.cy, this.HEX_SIZE - this.GAP / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < 6; i++) this.ctx.lineTo(pts[i][0], pts[i][1]);
    this.ctx.closePath();

    this.ctx.fillStyle = `rgba(245, 180, 30, ${h.alpha * 0.25})`;
    this.ctx.fill();

    this.ctx.strokeStyle = `rgba(245, 180, 30, ${h.alpha})`;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private render() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const h of this.hexes) this.drawHex(h);
  }

  private loop() {
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }
}
